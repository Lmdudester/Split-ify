#!/bin/bash
# Bash script to generate self-signed SSL certificates for Split-ify
# Works on Linux, macOS, Git Bash, and WSL

set -e

echo "Generating self-signed SSL certificates for Split-ify..."

# Get script directory and create ssl directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/../ssl"

mkdir -p "$SSL_DIR"

CERT_PATH="$SSL_DIR/cert.pem"
KEY_PATH="$SSL_DIR/key.pem"

# Check if certificates already exist
if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
    echo "SSL certificates already exist in $SSL_DIR"
    read -p "Do you want to regenerate them? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing certificates."
        exit 0
    fi
fi

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "Error: OpenSSL is not installed or not in PATH"
    echo "Please install OpenSSL:"
    echo "  - Ubuntu/Debian: sudo apt-get install openssl"
    echo "  - macOS: brew install openssl"
    echo "  - Windows: Install Git for Windows (includes OpenSSL)"
    exit 1
fi

# Generate self-signed certificate
echo "Generating certificate with OpenSSL..."

# Disable Git Bash path conversion for Windows
export MSYS_NO_PATHCONV=1

openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
    -nodes -keyout "$KEY_PATH" -out "$CERT_PATH" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo ""
echo "SSL certificates generated successfully!"
echo ""
echo "Certificate files created:"
echo "  - Certificate: $CERT_PATH"
echo "  - Private Key: $KEY_PATH"
echo ""
echo "IMPORTANT: Your browser will show a security warning when accessing https://localhost:3443"
echo "This is expected for self-signed certificates. You can safely proceed by:"
echo "  1. Click 'Advanced' or 'Show details'"
echo "  2. Click 'Proceed to localhost' or 'Accept the risk'"
echo ""
echo "The certificates are valid for 365 days."
