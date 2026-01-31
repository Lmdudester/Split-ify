import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../services/auth';

export function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution (React StrictMode runs effects twice)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setError(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        await handleCallback(code);
        navigate('/dashboard');
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Failed to authenticate');
      }
    };

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="callback-page">
        <div className="error-container">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-page">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
}
