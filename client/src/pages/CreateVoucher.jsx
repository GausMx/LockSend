import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const CURRENCIES = [
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
];

const CreateVoucher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    amountForeign: "",
    currency: "GBP",
    recipientName: "",
    intendedHospitalName: "",
    senderPhone: user?.phone || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCurrency = CURRENCIES.find((c) => c.code === form.currency);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.post("/api/voucher/create", {
        ...form,
        amountForeign: parseFloat(form.amountForeign),
      });
      window.location.href = data.paymentLink;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const amount = parseFloat(form.amountForeign) || 0;
  const fee = amount * 0.05;
  const total = amount * 1.05;

  return (
    <div className="min-h-screen bg-brand-navy">
      <nav className="border-b border-brand-blue/40 px-8 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-display text-xl text-brand-gold">LockSend</Link>
        <Link to="/dashboard" className="font-body text-sm text-brand-slate hover:text-brand-cream transition-colors">
          ← Back to dashboard
        </Link>
      </nav>

      <main className="max-w-lg mx-auto px-8 py-16">
        <div className="mb-10">
          <p className="font-mono text-xs text-brand-gold/60 uppercase tracking-widest mb-3">New Voucher</p>
          <h1 className="font-display text-4xl text-brand-cream mb-3">Create a voucher</h1>
          <p className="font-body text-brand-slate text-sm leading-relaxed">
            Your family member takes this to any hospital. The hospital claims funds directly —
            you approve before any money moves.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-sm">
            <p className="font-body text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
              Amount & Currency
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate text-sm pointer-events-none">
                  {selectedCurrency.symbol}
                </span>
                <input
                  name="amountForeign"
                  type="number"
                  min="10"
                  step="0.01"
                  className="input-field pl-8"
                  placeholder="100.00"
                  value={form.amountForeign}
                  onChange={handleChange}
                  required
                />
              </div>
              <select
                name="currency"
                className="input-field w-28"
                value={form.currency}
                onChange={handleChange}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-brand-navy">{c.code}</option>
                ))}
              </select>
            </div>
            <p className="font-mono text-xs text-brand-slate/60 mt-2">
              Minimum {selectedCurrency.symbol}10 · Naira rate locked at payment
            </p>
          </div>

          <div>
            <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
              Recipient's Name in Nigeria
            </label>
            <input
              name="recipientName"
              type="text"
              className="input-field"
              placeholder="e.g. Ngozi Okafor"
              value={form.recipientName}
              onChange={handleChange}
              required
            />
            <p className="font-mono text-xs text-brand-slate/60 mt-2">
              Shown on the hospital redemption page
            </p>
          </div>

          <div>
            <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
              Intended Hospital
              <span className="ml-2 text-brand-gold/70 font-mono normal-case tracking-normal text-xs">
                — recommended for extra security
              </span>
            </label>
            <input
              name="intendedHospitalName"
              type="text"
              className="input-field"
              placeholder="e.g. University College Hospital, Ibadan"
              value={form.intendedHospitalName}
              onChange={handleChange}
            />
            <p className="font-mono text-xs text-brand-slate/60 mt-2">
              Optional — limits which hospital can claim this voucher
            </p>
          </div>

          <div>
            <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
              Your Phone Number
            </label>
            <input
              name="senderPhone"
              type="tel"
              className="input-field"
              placeholder="+44 7700 900000"
              value={form.senderPhone}
              onChange={handleChange}
              required
            />
            <p className="font-mono text-xs text-brand-slate/60 mt-2">
              We'll SMS you when a hospital submits a redemption request
            </p>
          </div>

          {/* Fee breakdown — updates live as sender types */}
          <div className="card !border-brand-gold/20 !bg-brand-gold/5">
            <div className="flex gap-3">
              <svg className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="w-full">
                <p className="font-body text-xs text-brand-gold font-semibold mb-3">Fee breakdown</p>
                <div className="space-y-1.5">
                  {[
                    ["Voucher amount", `${selectedCurrency.symbol}${amount.toFixed(2)}`],
                    ["LockSend fee (5%)", `${selectedCurrency.symbol}${fee.toFixed(2)}`],
                    ["Total charged", `${selectedCurrency.symbol}${total.toFixed(2)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <p className="font-mono text-xs text-brand-slate">{label}</p>
                      <p className={`font-mono text-xs ${label === "Total charged" ? "text-brand-cream font-semibold" : "text-brand-slate"}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                Preparing payment…
              </span>
            ) : (
              `Pay ${selectedCurrency.symbol}${total.toFixed(2)} ${form.currency} & Create Voucher`
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateVoucher;