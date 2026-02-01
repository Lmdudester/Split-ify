# PowerShell script to generate self-signed SSL certificates for Split-ify
# Works on Windows without WSL/Git Bash

Write-Host "Generating self-signed SSL certificates for Split-ify..." -ForegroundColor Cyan

# Create ssl directory if it doesn't exist
$sslDir = Join-Path $PSScriptRoot "..\ssl"
if (!(Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir | Out-Null
    Write-Host "Created ssl directory: $sslDir" -ForegroundColor Green
}

# Certificate details
$certPath = Join-Path $sslDir "cert.pem"
$keyPath = Join-Path $sslDir "key.pem"

# Check if certificates already exist
if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
    Write-Host "SSL certificates already exist in $sslDir" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to regenerate them? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Keeping existing certificates." -ForegroundColor Green
        exit 0
    }
}

# Generate self-signed certificate using OpenSSL (if available) or .NET
try {
    # Try OpenSSL first (if Git Bash or OpenSSL is installed)
    $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

    if ($opensslPath) {
        Write-Host "Using OpenSSL to generate certificate..." -ForegroundColor Cyan

        & openssl req -x509 -newkey rsa:4096 -sha256 -days 365 `
            -nodes -keyout $keyPath -out $certPath `
            -subj "/CN=localhost" `
            -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

        Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
    } else {
        # Fallback to .NET certificate generation
        Write-Host "OpenSSL not found. Using .NET to generate certificate..." -ForegroundColor Yellow

        # Create self-signed certificate using .NET
        $cert = New-SelfSignedCertificate `
            -Subject "CN=localhost" `
            -DnsName "localhost", "127.0.0.1" `
            -KeyAlgorithm RSA `
            -KeyLength 4096 `
            -NotAfter (Get-Date).AddYears(1) `
            -CertStoreLocation "Cert:\CurrentUser\My" `
            -FriendlyName "Split-ify Self-Signed Certificate" `
            -HashAlgorithm SHA256 `
            -KeyUsage DigitalSignature, KeyEncipherment `
            -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

        # Export certificate and private key
        $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
        [System.IO.File]::WriteAllBytes($certPath, $certBytes)

        # Export private key (requires converting to PEM format)
        $keyBytes = $cert.PrivateKey.Key.Export([System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)

        # Convert to PEM format
        $keyPem = "-----BEGIN PRIVATE KEY-----`n"
        $keyPem += [Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        $keyPem += "`n-----END PRIVATE KEY-----`n"
        [System.IO.File]::WriteAllText($keyPath, $keyPem)

        # Convert certificate to PEM format
        $certPem = "-----BEGIN CERTIFICATE-----`n"
        $certPem += [Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        $certPem += "`n-----END CERTIFICATE-----`n"
        [System.IO.File]::WriteAllText($certPath, $certPem)

        # Remove certificate from store (cleanup)
        Remove-Item -Path "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force

        Write-Host "SSL certificates generated successfully using .NET!" -ForegroundColor Green
    }

    Write-Host "`nCertificate files created:" -ForegroundColor Cyan
    Write-Host "  - Certificate: $certPath" -ForegroundColor White
    Write-Host "  - Private Key: $keyPath" -ForegroundColor White

    Write-Host "`nIMPORTANT: Your browser will show a security warning when accessing https://localhost:3443" -ForegroundColor Yellow
    Write-Host "This is expected for self-signed certificates. You can safely proceed by:" -ForegroundColor Yellow
    Write-Host "  1. Click 'Advanced' or 'Show details'" -ForegroundColor White
    Write-Host "  2. Click 'Proceed to localhost' or 'Accept the risk'" -ForegroundColor White
    Write-Host "`nFor a better experience, you can trust the certificate:" -ForegroundColor Yellow
    Write-Host "  1. Double-click $certPath" -ForegroundColor White
    Write-Host "  2. Click 'Install Certificate...'" -ForegroundColor White
    Write-Host "  3. Choose 'Current User' > 'Place all certificates in the following store'" -ForegroundColor White
    Write-Host "  4. Browse to 'Trusted Root Certification Authorities'" -ForegroundColor White
    Write-Host "  5. Complete the wizard" -ForegroundColor White

} catch {
    Write-Host "Error generating SSL certificates: $_" -ForegroundColor Red
    exit 1
}
