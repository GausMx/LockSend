import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
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
      const data = await api.post("/api/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <Link to="/" className="font-display text-xl text-brand-gold block mb-10">
            LockSend
          </Link>
          <h1 className="font-display text-3xl text-brand-cream mb-2">Welcome back</h1>
          <p className="font-body text-brand-slate text-sm">
            No account yet?{" "}
            <Link to="/register" className="text-brand-gold hover:underline">
              Create one
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
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
