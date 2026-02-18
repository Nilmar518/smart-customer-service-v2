import { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useWeatherStore } from '../stores/weather.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

type Mode = 'login' | 'signup';

type Props = {
  mode: Mode;
  onAuthed: () => void;
};

export default function AuthForm({ mode, onAuthed }: Props) {
  const setToken = useAuthStore((s) => s.setToken);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');

  const handleAuth = async () => {
    setStatus('');
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body: Record<string, string> = { email, password };
      if (mode === 'signup') {
        body.firstName = firstName;
        body.lastName = lastName;
      }

      const res = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // BEGIN COOKIE_AUTH (OPTIONAL)
        // If using httpOnly cookies, enable credentials and stop using localStorage token.
        // credentials: 'include',
        // END COOKIE_AUTH (OPTIONAL)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Auth failed');

      setToken(data.accessToken);
      fetchWeather(data.accessToken);
      setStatus('Authenticated');
      onAuthed();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Auth failed');
    }
  };

  return (
    <div className="form">
      {mode === 'signup' && (
        <>
          <input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </>
      )}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>{mode === 'login' ? 'Login' : 'Create account'}</button>
      {status && <p className="status">{status}</p>}
    </div>
  );
}
