import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <p className="eyebrow mb-4 tracking-widest text-teal-700">Welcome back</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Pick up exactly where you left off.
        </h1>
        <p className="mt-5 max-w-md text-slate-600">
          Open your dashboard, review course activity, and keep the next class moving.
        </p>
        <div className="mt-8 hidden rounded-lg bg-slate-950 p-5 text-white shadow-soft lg:block">
          <p className="text-sm font-semibold text-teal-200">Today on CourseHub</p>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <p>New notes are ready for Web Development.</p>
            <p>Assignments stay grouped with their course materials.</p>
            <p>Role-based dashboards keep each user focused.</p>
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-amber-300 to-rose-400" />
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use your CourseHub account.</p>
          </div>
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@school.edu"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="border-t border-slate-100 px-6 py-5 text-center text-sm text-slate-600 sm:px-8">
          No account?{" "}
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
