import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

function typeBadge(type) {
  const map = {
    Video: "bg-violet-100 text-violet-800 ring-violet-200",
    Notes: "bg-slate-100 text-slate-700 ring-slate-200",
    Assignment: "bg-amber-100 text-amber-900 ring-amber-200",
  };
  return map[type] || "bg-slate-100 text-slate-700 ring-slate-200";
}

const formatPrice = (price) => `Rs. ${Number(price ?? 499).toLocaleString("en-IN")}`;

const courseInitial = (title) => title?.trim()?.slice(0, 1)?.toUpperCase() || "C";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("499");
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [materials, setMaterials] = useState({});
  const [matForm, setMatForm] = useState({ title: "", type: "Notes", file: null });
  const [subs, setSubs] = useState({});
  const [busy, setBusy] = useState(null);

  const loadCourses = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/courses");
      setCourses(data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const createCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErr("Title is required");
      return;
    }
    setCreating(true);
    setErr("");
    try {
      await api.post("/api/courses", { title: title.trim(), description, price });
      setTitle("");
      setDescription("");
      setPrice("499");
      await loadCourses();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not create course");
    } finally {
      setCreating(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    setBusy(`del-${id}`);
    try {
      await api.delete(`/api/courses/${id}`);
      await loadCourses();
      setExpanded(null);
    } catch (e) {
      setErr(e.response?.data?.message || "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const toggleCourse = async (courseId) => {
    if (expanded === courseId) {
      setExpanded(null);
      return;
    }
    setExpanded(courseId);
    setErr("");
    try {
      const { data } = await api.get(`/api/materials/course/${courseId}`);
      setMaterials((m) => ({ ...m, [courseId]: data }));
    } catch (e) {
      setErr(e.response?.data?.message || "Could not load materials");
    }
  };

  const uploadMaterial = async (e, courseId) => {
    e.preventDefault();
    if (!matForm.title.trim()) {
      setErr("Material title is required");
      return;
    }
    setBusy(`mat-${courseId}`);
    setErr("");
    const fd = new FormData();
    fd.append("title", matForm.title.trim());
    fd.append("type", matForm.type);
    if (matForm.file) fd.append("file", matForm.file);
    try {
      await api.post(`/api/materials/course/${courseId}`, fd);
      setMatForm({ title: "", type: "Notes", file: null });
      const { data } = await api.get(`/api/materials/course/${courseId}`);
      setMaterials((m) => ({ ...m, [courseId]: data }));
    } catch (err) {
      setErr(err.response?.data?.message || "Upload failed");
    } finally {
      setBusy(null);
    }
  };

  const removeMaterial = async (materialId, courseId) => {
    if (!window.confirm("Delete this material?")) return;
    setBusy(`rm-${materialId}`);
    try {
      await api.delete(`/api/materials/${materialId}`);
      const { data } = await api.get(`/api/materials/course/${courseId}`);
      setMaterials((m) => ({ ...m, [courseId]: data }));
    } catch (e) {
      setErr(e.response?.data?.message || "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const loadSubs = async (assignmentId) => {
    setBusy(`subs-${assignmentId}`);
    try {
      const { data } = await api.get(`/api/submissions/assignment/${assignmentId}/list`);
      setSubs((s) => ({ ...s, [assignmentId]: data }));
    } catch (e) {
      setErr(e.response?.data?.message || "Could not load submissions");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex justify-center">
        <div className="h-12 w-12 rounded-lg border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-2">Instructor</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Teaching workspace
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Shape your curriculum, publish materials, and follow learner submissions from one place.
        </p>
        <Link to="/instructor/profile/create" className="btn-secondary mt-5 text-sm !py-2">
          Create or update profile
        </Link>
        <div className="mt-6 h-px max-w-xs bg-gradient-to-r from-amber-400 via-brand-400 to-transparent rounded-full" />
      </header>

      {err && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3 font-medium">
          {err}
        </div>
      )}

      <form onSubmit={createCourse} className="card mb-10 space-y-5 border-amber-100/50 shadow-glow">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">Create a new course</h2>
            <p className="text-xs text-slate-500">You can add materials after the course exists.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Price
          </label>
          <input
            className="input-field"
            type="number"
            min="0"
            max="5000"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="499"
          />
          <p className="mt-1 text-xs text-slate-500">Keep it student-friendly. Suggested range: Rs. 299 to Rs. 999.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Title
          </label>
          <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Web Development" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Description
          </label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students learn?"
          />
        </div>
        <button type="submit" disabled={creating} className="btn-primary">
          {creating ? "Publishing…" : "Publish course"}
        </button>
      </form>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Course manager</p>
          <h2 className="font-display text-2xl font-semibold text-slate-900">Your courses</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
          {courses.length} total
        </span>
      </div>
      <div className="grid gap-5">
        {courses.map((c) => (
          <div
            key={c._id}
            className="group overflow-hidden rounded-lg border border-slate-200/90 bg-white/95 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-glow"
          >
            <div className="h-1 bg-gradient-to-r from-amber-400 via-brand-400 to-teal-300" />
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 via-white to-brand-100 text-xl font-bold text-amber-800 ring-1 ring-amber-200">
                    {courseInitial(c.title)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl font-semibold text-slate-900">{c.title}</h3>
                      <span className="badge bg-teal-100 text-teal-800 ring-1 ring-teal-200">
                        {c.enrolledCount || 0} enrolled
                      </span>
                      <span className="badge bg-amber-100 text-amber-900 ring-1 ring-amber-200">
                        {formatPrice(c.price)}
                      </span>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{c.description}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => toggleCourse(c._id)}
                    className={expanded === c._id ? "btn-primary text-sm !py-2 !px-4" : "btn-secondary text-sm !py-2 !px-4"}
                  >
                    {expanded === c._id ? "Close tools" : "Manage"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === `del-${c._id}`}
                    onClick={() => deleteCourse(c._id)}
                    className="btn-danger text-sm !py-2 !px-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {expanded === c._id && (
              <div className="border-t border-slate-100 p-5 sm:p-6 bg-gradient-to-b from-slate-50/90 to-white space-y-8">
                <form onSubmit={(e) => uploadMaterial(e, c._id)} className="card !p-5 space-y-4 border-brand-100/60">
                  <p className="text-sm font-semibold text-slate-900">Upload material</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Material title"
                      className="input-field text-sm"
                      value={matForm.title}
                      onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))}
                    />
                    <select
                      className="input-field text-sm cursor-pointer"
                      value={matForm.type}
                      onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value }))}
                    >
                      <option value="Video">Video</option>
                      <option value="Notes">Notes</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => setMatForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-900 cursor-pointer"
                  />
                  <button type="submit" disabled={busy === `mat-${c._id}`} className="btn-primary text-sm !py-2">
                    {busy === `mat-${c._id}` ? "Uploading…" : "Add to course"}
                  </button>
                </form>

                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">Materials in this course</p>
                  <ul className="space-y-2">
                    {(materials[c._id] || []).map((m) => (
                      <li
                        key={m._id}
                        className="flex flex-col gap-3 text-sm rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span className="font-semibold text-slate-900 truncate">{m.title}</span>
                            <span className={`badge ring-1 shrink-0 ${typeBadge(m.type)}`}>{m.type}</span>
                            {m.fileUrl && (
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                              >
                                File ↗
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {m.type === "Assignment" && (
                              <button
                                type="button"
                                onClick={() => loadSubs(m._id)}
                                className="btn-secondary text-xs !py-1.5 !px-2.5"
                              >
                                Submissions
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeMaterial(m._id, c._id)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {m.type === "Assignment" && subs[m._id] && (
                          <ul className="w-full text-xs text-slate-600 border-t border-slate-100 pt-3 space-y-1.5">
                            {subs[m._id].length === 0 && <li className="text-slate-400">No submissions yet.</li>}
                            {subs[m._id].map((s) => (
                              <li key={s._id} className="flex justify-between items-center gap-2 py-0.5">
                                <span className="font-medium text-slate-700">{s.studentId?.name || "Student"}</span>
                                {s.fileUrl && (
                                  <a
                                    href={s.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-brand-600"
                                  >
                                    Download
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 py-14 text-center mt-6">
          <p className="text-slate-500 text-sm font-medium">You have not created any courses yet.</p>
          <p className="text-slate-400 text-xs mt-1">Use the form above to publish your first course.</p>
        </div>
      )}
    </div>
  );
}
