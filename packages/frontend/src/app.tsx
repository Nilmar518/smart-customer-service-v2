import { useState } from 'react';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import { useAuthStore } from './stores/auth.store';

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <main className="container">
      <h1>Smart Customer v2</h1>

      {!token ? (
        <AuthPage onAuthed={() => {}} />
      ) : (
        <DashboardPage />
      )}
    </main>
  );
}
