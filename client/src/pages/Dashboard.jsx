import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Top nav */}
      <nav className="border-b border-brand-blue/40 px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl text-brand-gold">LockSend</span>
        <div className="flex items-center gap-6">
          <span className="font-body text-sm text-brand-slate hidden sm:block">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="btn-ghost text-sm px-4 py-2">
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Welcome */}
        <div className="mb-16">
          <p className="font-mono text-xs text-brand-gold/60 uppercase tracking-widest mb-3">
            Dashboard
          </p>
          <h1 className="font-display text-4xl text-brand-cream mb-3">
            Welcome, {user?.name?.split(" ")[0]}.
          </h1>
          <p className="font-body text-brand-slate">
            You have no vouchers yet. Create one to get started.
          </p>
        </div>

        {/* Empty state CTA */}
        <div className="card flex flex-col items-center text-center py-16 gap-6">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-full border border-brand-gold/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <div>
            <h2 className="font-display text-2xl text-brand-cream mb-2">
              Create your first voucher
            </h2>
            <p className="font-body text-brand-slate text-sm max-w-sm">
              Send money your family member's hospital can collect directly —
              no cash, no risk, no uncertainty.
            </p>
          </div>

          <button
            className="btn-primary opacity-50 cursor-not-allowed"
            disabled
            title="Coming in Week 2"
          >
            Create Voucher — Coming Week 2
          </button>
        </div>

        {/* Account info */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Name", value: user?.name },
            { label: "Country", value: user?.country },
            { label: "Phone", value: user?.phone },
          ].map(({ label, value }) => (
            <div key={label} className="card">
              <p className="font-mono text-xs text-brand-slate/60 uppercase tracking-widest mb-1">
                {label}
              </p>
              <p className="font-body text-brand-cream text-sm">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
