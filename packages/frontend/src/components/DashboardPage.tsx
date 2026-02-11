import HelloPanel from './HelloPanel';
import { useAuthStore } from '../stores/auth.store';

export default function DashboardPage() {
  const clearToken = useAuthStore((s) => s.clearToken);

  return (
    <>
      <div className="tabs">
        <button className="active">Dashboard</button>
        <button onClick={clearToken}>Logout</button>
      </div>
      <HelloPanel />
    </>
  );
}
