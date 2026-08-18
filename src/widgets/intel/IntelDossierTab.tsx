import { useState } from 'react';
import axios from 'axios';

type GitHubUser = {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
};

type LanyardData = {
  discord_user: { username: string };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: { name: string; state?: string; details?: string }[];
  spotify?: { song: string; artist: string; album_art_url: string };
  listening_to_spotify: boolean;
};

function getStatusColor(status: LanyardData['discord_status']) {
  switch (status) {
    case 'online':
      return '#48bb78';
    case 'idle':
      return '#ecc94b';
    case 'dnd':
      return '#fc8181';
    default:
      return 'var(--text-muted)';
  }
}

export default function IntelDossierTab() {
  const [githubQuery, setGithubQuery] = useState('');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [lanyardUser, setLanyardUser] = useState<LanyardData | null>(null);
  const [lanyardLoading, setLanyardLoading] = useState(false);
  const [lanyardError, setLanyardError] = useState('');

  const handleGithubSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubQuery.trim()) return;
    setGithubLoading(true);
    setGithubError('');
    setGithubUser(null);
    try {
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(githubQuery)}`);
      setGithubUser(res.data);
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setGithubError(status === 404 ? 'Netrunner profile not found.' : 'Failed to query GitHub registry.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleLanyardSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordId.trim()) return;
    setLanyardLoading(true);
    setLanyardError('');
    setLanyardUser(null);
    try {
      const res = await axios.get(`https://api.lanyard.rest/v1/users/${encodeURIComponent(discordId)}`);
      if (res.data.success && res.data.data) setLanyardUser(res.data.data);
      else setLanyardError('No Rich Presence records captured for this ID.');
    } catch {
      setLanyardError('Agent telemetry offline. (Verify ID or check Lanyard-enabled Discord server).');
    } finally {
      setLanyardLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(0, 163, 224, 0.1)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>NETRUNNER PROFILE STALKER (GITHUB)</span>
        <form onSubmit={handleGithubSearch} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Enter GitHub handle..." value={githubQuery} onChange={(e) => setGithubQuery(e.target.value)} style={{ flexGrow: 1, background: '#000', border: '1px solid rgba(0, 163, 224, 0.3)', color: '#fff', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }} />
          <button type="submit" className="news-search-button" style={{ width: 'auto' }}>STALK</button>
        </form>
        {githubLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Extracting code profile logs...</div>}
        {githubError && <div style={{ color: '#fc8181', fontSize: '0.75rem' }}>{githubError}</div>}
        {githubUser && (
          <div style={{ display: 'flex', gap: '12px', padding: '8px', background: 'rgba(0, 45, 98, 0.1)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
            <img src={githubUser.avatar_url} alt={githubUser.login} style={{ width: '48px', height: '48px', borderRadius: '4px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>{githubUser.name || githubUser.login}</div>
              {githubUser.bio && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{githubUser.bio}</div>}
              <div style={{ fontSize: '0.65rem', color: 'var(--p3r-blue-light)', marginTop: '4px' }}>REPOS: {githubUser.public_repos} · FOLLOWERS: {githubUser.followers}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>AGENT PRESENCE UPLINK (DISCORD LANYARD)</span>
        <form onSubmit={handleLanyardSearch} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Enter Discord User ID..." value={discordId} onChange={(e) => setDiscordId(e.target.value)} style={{ flexGrow: 1, background: '#000', border: '1px solid rgba(0, 163, 224, 0.3)', color: '#fff', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }} />
          <button type="submit" className="news-search-button" style={{ width: 'auto' }}>UPLINK</button>
        </form>
        {lanyardLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Syncing Discord telemetry stream...</div>}
        {lanyardError && <div style={{ color: '#fc8181', fontSize: '0.75rem' }}>{lanyardError}</div>}
        {lanyardUser && (
          <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{lanyardUser.discord_user.username}</span>
              <span style={{ fontSize: '0.65rem', color: getStatusColor(lanyardUser.discord_status), border: `1px solid ${getStatusColor(lanyardUser.discord_status)}`, padding: '2px 6px' }}>{lanyardUser.discord_status}</span>
            </div>
            {lanyardUser.listening_to_spotify && lanyardUser.spotify && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <img src={lanyardUser.spotify.album_art_url} alt="Album art" style={{ width: '32px', height: '32px' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#48bb78', fontWeight: 'bold' }}>LISTENING TO SPOTIFY</div>
                  <div style={{ fontSize: '0.75rem', color: '#fff' }}>{lanyardUser.spotify.song}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>by {lanyardUser.spotify.artist}</div>
                </div>
              </div>
            )}
            {lanyardUser.activities?.filter((a) => a.name !== 'Spotify').map((activity, idx) => (
              <div key={idx} style={{ background: 'rgba(0, 45, 98, 0.2)', padding: '6px', borderLeft: '2px solid var(--p3r-blue-light)', marginTop: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--p3r-blue-light)', fontWeight: 'bold' }}>ACTIVE SOFTWARE</div>
                <div style={{ fontSize: '0.75rem', color: '#fff' }}>{activity.name}</div>
                {activity.details && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{activity.details}</div>}
                {activity.state && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{activity.state}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
