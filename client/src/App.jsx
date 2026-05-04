import { NavLink, Route, Routes } from 'react-router-dom';
import { BarChart3, Clock3, UploadCloud } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import Home from './pages/Home.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Upload', icon: UploadCloud },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/history', label: 'History', icon: Clock3 }
];

const authUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/auth/google`
  : 'http://localhost:5000/api/auth/google';

function AuthHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
      {loading ? (
        <span className="text-sm text-stone-500">Checking login status…</span>
      ) : user ? (
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-stone-600">Signed in as {user.displayName}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Logout
          </button>
        </div>
      ) : (
        <a
          href={authUrl}
          className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-ocean-700"
        >
          Login with Google
        </a>
      )}
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="text-xl font-semibold tracking-normal text-ink">
            AI Data Analyzer
          </NavLink>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <nav className="flex gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-ocean text-white'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
                    }`
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <AuthHeader />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:datasetId" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:analysisId" element={<History />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
