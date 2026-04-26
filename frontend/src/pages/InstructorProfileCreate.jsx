import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function InstructorProfileCreate() {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [profile, setProfile] = useState({
    headline: "",
    bio: "",
    phone: "",
    location: "",
    department: "",
    educationLevel: "",
    expertise: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setProfile((current) => ({ ...current, ...(user.profile || {}) }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/users/me/profile", { name: name.trim(), profile });
      await loadUser();
      setMessage("Instructor profile saved.");
      setTimeout(() => navigate("/instructor"), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="eyebrow mb-2 text-amber-700">Instructor profile</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
          Create your instructor profile
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Help students understand your background, department, and courses.
        </p>
      </header>

      <form onSubmit={submit} className="panel p-6 sm:p-8 space-y-5">
        {error && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        {message && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Full name</span>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Professional title</span>
            <input
              className="input-field"
              value={profile.headline}
              onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
              placeholder="Assistant Professor"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Phone</span>
            <input
              className="input-field"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Location</span>
            <input
              className="input-field"
              value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              placeholder="Campus block"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Department</span>
            <input
              className="input-field"
              value={profile.department}
              onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
              placeholder="Computer Science"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Qualification</span>
            <input
              className="input-field"
              value={profile.educationLevel}
              onChange={(e) => setProfile((p) => ({ ...p, educationLevel: e.target.value }))}
              placeholder="M.Tech, PhD"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Expertise</span>
          <input
            className="input-field"
            value={profile.expertise}
            onChange={(e) => setProfile((p) => ({ ...p, expertise: e.target.value }))}
            placeholder="Machine learning, databases, Java"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Profile image URL</span>
          <input
            className="input-field"
            value={profile.avatarUrl}
            onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
            placeholder="https://example.com/photo.jpg"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">About your teaching</span>
          <textarea
            className="input-field min-h-[130px] resize-y"
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell students about your teaching style and academic background."
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save profile"}
          </button>
          <button type="button" onClick={() => navigate("/instructor")} className="btn-secondary">
            Back to dashboard
          </button>
        </div>
      </form>
    </div>
  );
}
