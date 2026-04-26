import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const STATUS_CONFIG = {
  pending_payment: { label: "Awaiting Payment", color: "text-yellow-400", dot: "bg-yellow-400" },
  active: { label: "Active", color: "text-green-400", dot: "bg-green-400" },
  pending_approval: { label: "Needs Approval", color: "text-blue-400", dot: "bg-blue-400" },
  redeemed: { label: "Redeemed", color: "text-brand-slate", dot: "bg-brand-slate" },
  expired: { label: "Expired", color: "text-red-400", dot: "bg-red-400" },
  refunded: { label: "Refunded", color: "text-brand-slate", dot: "bg-brand-slate" },
};

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", CAD: "CA$" };

const formatNaira = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(true);

  useEffect(() => {
    api.get("/api/voucher")
      .then((data) => setVouchers(data.vouchers))
      .catch(console.error)
      .finally(() => setLoadingVouchers(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pendingApproval = vouchers.filter((v) => v.status === "pending_approval");

  return (
    <div className="min-h-screen bg-brand-navy">
      <nav className="border-b border-brand-blue/40 px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl text-brand-gold">LockSend</span>
        <div className="flex items-center gap-4">
          <span className="font-body text-sm text-brand-slate hidden sm:block">{user?.email}</span>
          <button onClick={handleLogout} className="btn-ghost text-sm px-4 py-2">Sign out</button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">

        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className="font-mono text-xs text-brand-gold/60 uppercase tracking-widest mb-2">Dashboard</p>
            <h1 className="font-display text-4xl text-brand-cream">
              Welcome, {user?.name?.split(" ")[0]}.
            </h1>
          </div>
          <Link to="/voucher/create" className="btn-primary shrink-0">+ New Voucher</Link>
        </div>

        {pendingApproval.length > 0 && (
          <div className="mb-8 px-5 py-4 bg-blue-500/10 border border-blue-500/30 rounded-sm">
            <p className="font-body text-sm text-blue-400 font-medium mb-1">
              🔔 {pendingApproval.length} voucher{pendingApproval.length > 1 ? "s" : ""} need your approval
            </p>
            <p className="font-body text-xs text-brand-slate mb-3">
              A hospital has submitted a redemption request. Review and approve to release funds.
            </p>
            {pendingApproval.map((v) => (
              <Link key={v._id} to={`/voucher/${v._id}/review`} className="inline-block font-body text-xs text-blue-400 underline mr-4">
                Review {v.voucherCode} →
              </Link>
            ))}
          </div>
        )}

        {vouchers.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total", value: vouchers.length },
              { label: "Active", value: vouchers.filter((v) => v.status === "active").length },
              { label: "Redeemed", value: vouchers.filter((v) => v.status === "redeemed").length },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center">
                <p className="font-display text-3xl text-brand-gold mb-1">{value}</p>
                <p className="font-mono text-xs text-brand-slate uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="font-mono text-xs text-brand-slate uppercase tracking-wider mb-4">Your Vouchers</p>

          {loadingVouchers ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="card flex flex-col items-center text-center py-16 gap-5">
              <div className="w-14 h-14 rounded-full border border-brand-gold/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-2xl text-brand-cream mb-2">No vouchers yet</h2>
                <p className="font-body text-brand-slate text-sm max-w-xs">
                  Create your first voucher and send healthcare money your family's hospital can collect directly.
                </p>
              </div>
              <Link to="/voucher/create" className="btn-primary">Create Your First Voucher</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vouchers.map((voucher) => {
                const status = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.pending_payment;
                const symbol = CURRENCY_SYMBOLS[voucher.currency] || "";
                return (
                  <Link
                    key={voucher._id}
                    to={`/voucher/${voucher._id}`}
                    className="card flex items-center justify-between gap-4 hover:border-brand-gold/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-brand-cream font-semibold tracking-wider">
                          {voucher.voucherCode || "PENDING"}
                        </p>
                        <p className="font-body text-xs text-brand-slate truncate">For {voucher.recipientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="font-body text-sm text-brand-cream">{symbol}{voucher.amountForeign} {voucher.currency}</p>
                        {voucher.amountNaira && (
                          <p className="font-mono text-xs text-brand-slate">{formatNaira(voucher.amountNaira)}</p>
                        )}
                      </div>
                      <span className={`font-mono text-xs ${status.color} hidden md:block`}>{status.label}</span>
                      <svg className="w-4 h-4 text-brand-slate group-hover:text-brand-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;