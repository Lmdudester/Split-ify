import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/auth/LoginButton';

export function HomePage() {
  const { login } = useAuth();

  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="logo">Split-ify</h1>
        <p className="tagline">
          Filter your Spotify playlists by artist genres
        </p>

        <div className="features">
          <div className="feature">
            <h3>🎵 Genre Filtering</h3>
            <p>Select specific genres to filter your playlist</p>
          </div>
          <div className="feature">
            <h3>💾 Create Playlists</h3>
            <p>Save your filtered results as new Spotify playlists</p>
          </div>
        </div>

        <LoginButton onClick={login} />
      </div>
    </div>
  );
}
