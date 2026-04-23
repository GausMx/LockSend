import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Germany", "France", "Italy", "Netherlands", "Sweden",
  "Norway", "Ireland", "South Africa", "Other",
];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", password: "", country: "", phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.post("/api/auth/register", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue/30 border-r border-brand-blue/40 flex-col justify-between p-12">
        <div>
          <span className="font-display text-2xl text-brand-gold tracking-wide">LockSend</span>
        </div>
        <div>
          <p className="font-display text-4xl text-brand-cream leading-snug mb-6">
            Send healthcare money<br />
            <span className="text-brand-gold">only a hospital can collect.</span>
          </p>
          <p className="font-body text-brand-slate text-lg leading-relaxed">
            Your family gets care. The money goes directly to the hospital. 
            No middlemen. No uncertainty.
          </p>
        </div>
        <p className="font-mono text-xs text-brand-slate/60">
          Scoolynk Technologies · CAC Registered
        </p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <span className="font-display text-xl text-brand-gold lg:hidden block mb-8">LockSend</span>
            <h1 className="font-display text-3xl text-brand-cream mb-2">Create your account</h1>
            <p className="font-body text-brand-slate text-sm">
              Already have one?{" "}
              <Link to="/login" className="text-brand-gold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-sm">
              <p className="font-body text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                className="input-field"
                placeholder="Adaeze Okonkwo"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                className="input-field"
                placeholder="adaeze@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
                Country of Residence
              </label>
              <select
                name="country"
                className="input-field"
                value={form.country}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-brand-navy">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-body text-xs text-brand-slate uppercase tracking-wider mb-2">
                Phone Number (with country code)
              </label>
              <input
                name="phone"
                type="tel"
                className="input-field"
                placeholder="+44 7700 900000"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
