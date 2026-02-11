import { useState } from 'react';
import AuthForm from './AuthForm';

type Mode = 'login' | 'signup';

type Props = {
  onAuthed: () => void;
};

export default function AuthPage({ onAuthed }: Props) {
  const [mode, setMode] = useState<Mode>('login');

  return (
    <>
      <div className="tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Login
        </button>
        <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
          Sign Up
        </button>
      </div>

      <AuthForm mode={mode} onAuthed={onAuthed} />
    </>
  );
}
