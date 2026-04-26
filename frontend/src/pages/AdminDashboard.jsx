import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";

const formatPrice = (price) => `Rs. ${Number(price ?? 499).toLocaleString("en-IN")}`;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/courses/admin/all"),
      ]);
      setUsers(uRes.data);
      setCourses(cRes.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (userId, role) => {
    setBusy(`role-${userId}`);
    try {
      await api.patch(`/api/users/${userId}/role`, { role });
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not update role");
    } finally {
      setBusy(null);
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    setBusy(`del-${userId}`);
    try {
      await api.delete(`/api/users/${userId}`);
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not delete user");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex justify-center">
        <div className="h-12 w-12 rounded-lg border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-700 mb-2">Administrator</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Control center
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Review accounts, adjust roles, and keep visibility across every published course.
        </p>
        <div className="mt-6 h-px max-w-xs bg-gradient-to-r from-violet-400 via-brand-400 to-transparent rounded-full" />
      </header>

      {err && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3 font-medium">
          {err}
        </div>
      )}

      <section className="mb-14">
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 className="font-display text-xl font-semibold text-slate-900">Users</h2>
          <span className="text-xs font-medium text-slate-500">{users.length} registered</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200/90 bg-white/95 shadow-card backdrop-blur-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50/90 text-left text-slate-600 border-b border-slate-100">
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-900">{u.name}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <select
                      className="input-field !py-2 !px-3 text-xs max-w-[150px] font-semibold"
                      value={u.role}
                      disabled={busy === `role-${u._id}`}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                    >
                      <option value="Student">Student</option>
                      <option value="Instructor">Instructor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs font-medium tabular-nums">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => removeUser(u._id)}
                      disabled={busy === `del-${u._id}`}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 className="font-display text-xl font-semibold text-slate-900">All courses</h2>
          <span className="text-xs font-medium text-slate-500">{courses.length} across platform</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <article
              key={c._id}
              className="rounded-lg border border-slate-200/90 bg-white/95 p-5 shadow-card backdrop-blur-sm transition hover:border-violet-200/80 hover:shadow-glow"
            >
              <h3 className="font-display text-lg font-semibold text-slate-900">{c.title}</h3>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
              <p className="mt-3 text-sm font-semibold text-slate-950">{formatPrice(c.price)}</p>
              <p className="text-xs font-medium text-slate-500 mt-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                {c.instructorId?.name || "Instructor"}
              </p>
            </article>
          ))}
        </div>
        {courses.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 py-12 text-center text-slate-500 text-sm">
            No courses yet.
          </div>
        )}
      </section>
    </div>
  );
}
