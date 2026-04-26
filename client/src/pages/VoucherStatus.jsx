import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../utils/api";

const STATUS_CONFIG = {
  pending_payment: { label: "Awaiting Payment", color: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10" },
  active: { label: "Active", color: "text-green-400", border: "border-green-400/30", bg: "bg-green-400/10" },
  pending_approval: { label: "Pending Your Approval", color: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10" },
  redeemed: { label: "Redeemed", color: "text-brand-slate", border: "border-brand-slate/30", bg: "bg-brand-slate/10" },
  expired: { label: "Expired", color: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10" },
  refunded: { label: "Refunded", color: "text-brand-slate", border: "border-brand-slate/30", bg: "bg-brand-slate/10" },
};

const formatNaira = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", CAD: "CA$" };

const VoucherStatus = () => {
  const { voucherId } = useParams();
  const [searchParams] = useSearchParams();
  const justPaid = searchParams.get("status") === "successful";

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const fetchVoucher = async () => {
    try {
      const data = await api.get(`/api/voucher/${voucherId}`);
      setVoucher(data.voucher);
      return data.voucher;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();

    if (justPaid) {
      pollRef.current = setInterval(async () => {
        const v = await fetchVoucher();
        if (v && v.status === "active") {
          clearInterval(pollRef.current);
        }
      }, 3000);
    }

    return () => clearInterval(pollRef.current);
  }, [voucherId]);

  const copyLink = () => {
    const link = `${window.location.origin}/redeem/${voucher.voucherCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <p className="font-body text-red-400 mb-4">{error}</p>
          <Link to="/dashboard" className="btn-ghost text-sm px-4 py-2">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.pending_payment;
  const symbol = CURRENCY_SYMBOLS[voucher.currency] || "";
  const redemptionLink = `${window.location.origin}/redeem/${voucher.voucherCode}`;

  return (
    <div className="min-h-screen bg-brand-navy">
      <nav className="border-b border-brand-blue/40 px-8 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-display text-xl text-brand-gold">LockSend</Link>
        <Link to="/dashboard" className="font-body text-sm text-brand-slate hover:text-brand-cream transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <main className="max-w-lg mx-auto px-8 py-16">

        {justPaid && voucher.status === "pending_payment" && (
          <div className="mb-8 px-4 py-4 bg-blue-500/10 border border-blue-500/30 rounded-sm flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="font-body text-sm text-blue-400">
              Payment received — activating your voucher. This takes a few seconds…
            </p>
          </div>
        )}

        {justPaid && voucher.status === "active" && (
          <div className="mb-8 px-4 py-4 bg-green-500/10 border border-green-500/30 rounded-sm">
            <p className="font-body text-sm text-green-400 font-medium">
              ✅ Voucher activated — check your email for the full details.
            </p>
          </div>
        )}

        <div className="mb-8">
          <p className="font-mono text-xs text-brand-gold/60 uppercase tracking-widest mb-3">Voucher</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="font-mono text-4xl text-brand-cream tracking-widest font-bold">
              {voucher.voucherCode || "——————"}
            </h1>
            <span className={`font-mono text-xs px-3 py-1.5 rounded-sm border ${status.bg} ${status.border} ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="card mb-6 divide-y divide-brand-blue/30 !p-0">
          {[
            ["Amount Paid", `${symbol}${voucher.amountForeign} ${voucher.currency}`],
            ["Naira Value", voucher.amountNaira ? formatNaira(voucher.amountNaira) : "Locked at payment"],
            ["For", voucher.recipientName],
            ["Hospital", voucher.intendedHospitalName || "Any hospital"],
            ["Created", formatDate(voucher.createdAt)],
            ["Expires", formatDate(voucher.expiresAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-6 py-3">
              <p className="font-mono text-xs text-brand-slate uppercase tracking-wider">{label}</p>
              <p className="font-body text-sm text-brand-cream text-right max-w-[60%]">{value}</p>
            </div>
          ))}
        </div>

        {voucher.status === "active" && voucher.voucherCode && (
          <div className="card mb-6 !border-brand-gold/20">
            <p className="font-mono text-xs text-brand-slate uppercase tracking-wider mb-3">Redemption Link</p>
            <p className="font-mono text-xs text-brand-cream/70 break-all mb-4">{redemptionLink}</p>
            <button onClick={copyLink} className="btn-primary w-full text-sm py-2.5">
              {copied ? "✅ Copied!" : "Copy Redemption Link"}
            </button>
            <p className="font-mono text-xs text-brand-slate/60 mt-3 text-center">
              Share with your family member — the hospital cashier uses this link
            </p>
          </div>
        )}

        {voucher.status === "pending_approval" && (
          <div className="card !border-blue-400/30 !bg-blue-400/5 mb-6">
            <p className="font-body text-sm text-blue-400 font-medium mb-2">
              A hospital has submitted a redemption request.
            </p>
            <p className="font-body text-xs text-brand-slate mb-4">
              Review the hospital details and approve or reject the payout.
            </p>
            <Link to={`/voucher/${voucherId}/review`} className="btn-primary block text-center text-sm">
              Review & Approve →
            </Link>
          </div>
        )}

      </main>
    </div>
  );
};

export default VoucherStatus;