import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function HelloPanel() {
  const token = useAuthStore((s) => s.token);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch(`${API_URL}/api/hello`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // BEGIN COOKIE_AUTH (OPTIONAL)
      // If using httpOnly cookies, remove Authorization header and use:
      // credentials: 'include',
      // END COOKIE_AUTH (OPTIONAL)
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Unauthorized');
        }
        return res.json();
      })
      .then((data) => setMessage(data.message || 'Hello world'))
      .catch(() => setMessage('Unauthorized. Login first.'));
  }, [token]);

  return (
    <div className="hello">
      <h2>Protected</h2>
      <p>{message}</p>
    </div>
  );
}
