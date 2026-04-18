import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        <p className="eyebrow mb-4 tracking-widest text-rose-700">Start learning</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Create your workspace in minutes.
        </h1>
        <p className="mt-5 max-w-md text-slate-600">
          Join as a student or instructor and move straight into the dashboard made for your role.
        </p>
        <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
          {["Student dashboard", "Instructor tools", "Course materials", "Submission flow"].map((item) => (
            <div key={item} className="panel px-4 py-3 text-sm font-semibold text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-rose-400 via-amber-300 to-teal-400" />
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-950">Create account</h2>
            <p className="mt-1 text-sm text-slate-500">Admin accounts are provisioned separately.</p>
          </div>
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Full name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">I am joining as</label>
            <select className="input-field cursor-pointer" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="border-t border-slate-100 px-6 py-5 text-center text-sm text-slate-600 sm:px-8">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
