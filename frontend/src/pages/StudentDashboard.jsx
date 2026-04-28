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

const instructorInitial = (name) => name?.trim()?.slice(0, 1)?.toUpperCase() || "I";

function InstructorAvatar({ instructor }) {
  const avatarUrl = instructor?.profile?.avatarUrl;
  const name = instructor?.name || "Instructor";

  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 via-white to-teal-100 text-base font-bold text-brand-700 ring-1 ring-slate-200">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        instructorInitial(name)
      )}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-12 w-12 rounded-lg border-2 border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  );
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [materialCourseId, setMaterialCourseId] = useState(null);
  const [submitFor, setSubmitFor] = useState(null);
  const [file, setFile] = useState(null);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([
        api.get("/api/courses"),
        api.get("/api/enrollments/mine"),
      ]);
      setCourses(cRes.data);
      setEnrollments(eRes.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enrolledIds = new Set(
    enrollments.map((e) => (e.courseId?._id || e.courseId)?.toString?.() || String(e.courseId))
  );
  const selectedMaterialCourse = materialCourseId
    ? courses.find((course) => course._id === materialCourseId)
    : null;
  const visibleCourses = selectedMaterialCourse ? [selectedMaterialCourse] : courses;

  const enroll = async (courseId) => {
    setActionLoading(`enroll-${courseId}`);
    setErr("");
    try {
      await api.post("/api/enrollments", { courseId });
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Enrollment failed");
    } finally {
      setActionLoading(null);
    }
  };

  const openMaterials = async (courseId) => {
    setMaterialCourseId(courseId);
    setMaterials([]);
    setSubs([]);
    setErr("");
    try {
      const [mRes, sRes] = await Promise.all([
        api.get(`/api/materials/course/${courseId}`),
        api.get(`/api/submissions/course/${courseId}/mine`),
      ]);
      setMaterials(mRes.data);
      setSubs(sRes.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Could not load materials");
    }
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!submitFor || !file) return;
    setActionLoading(`sub-${submitFor}`);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/api/submissions/assignment/${submitFor}`, fd);
      setFile(null);
      setSubmitFor(null);
      if (materialCourseId) await openMaterials(materialCourseId);
    } catch (err) {
      setErr(err.response?.data?.message || "Submit failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Student</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Your learning hub
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Browse the catalog, join courses, and open materials whenever you are ready to study.
        </p>
        <Link to="/student/profile/create" className="btn-secondary mt-5 text-sm !py-2">
          Create or update profile
        </Link>
        <div className="mt-6 h-px max-w-xs bg-gradient-to-r from-brand-400 via-accent-400 to-transparent rounded-full" />
      </header>

      {err && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3 font-medium">
          {err}
        </div>
      )}

      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {selectedMaterialCourse ? "Selected course" : "Course catalog"}
            </p>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              {selectedMaterialCourse ? selectedMaterialCourse.title : "Course catalog"}
            </h2>
          </div>
          {selectedMaterialCourse ? (
            <button
              type="button"
              onClick={() => {
                setMaterialCourseId(null);
                setMaterials([]);
                setSubs([]);
                setSubmitFor(null);
                setFile(null);
              }}
              className="btn-secondary text-sm !py-2 !px-4"
            >
              Back to courses
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-500">{courses.length} available</span>
          )}
        </div>
        <div className={selectedMaterialCourse ? "grid gap-5" : "grid gap-5 sm:grid-cols-2"}>
          {visibleCourses.map((c) => {
            const id = c._id;
            const isIn = enrolledIds.has(id);
            const instructor = c.instructorId;
            const instructorPath = `/student/instructors/${instructor?._id || instructor}`;
            return (
              <article
                key={id}
                className="group relative overflow-hidden rounded-lg border border-slate-200/90 bg-white/95 p-5 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-glow"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 via-teal-300 to-amber-300 opacity-80" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-slate-900">{c.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{c.description}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-slate-900/15">
                    {formatPrice(c.price)}
                  </span>
                </div>
                <Link
                  to={instructorPath}
                  className="mt-5 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 transition hover:border-brand-200 hover:bg-brand-50/60"
                >
                  <InstructorAvatar instructor={instructor} />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Instructor
                    </span>
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {instructor?.name || "Instructor profile"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {instructor?.profile?.headline || instructor?.profile?.department || "View profile"}
                    </span>
                  </span>
                </Link>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    {c.enrolledCount || 0} students enrolled
                  </p>
                  {isIn && (
                    <span className="badge bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
                      Enrolled
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link
                    to={instructorPath}
                    className="btn-secondary text-sm !py-2 !px-4"
                  >
                    View instructor
                  </Link>
                  {!isIn ? (
                    <button
                      type="button"
                      disabled={actionLoading === `enroll-${id}`}
                      onClick={() => enroll(id)}
                      className="btn-primary text-sm !py-2 !px-4"
                    >
                      {actionLoading === `enroll-${id}` ? "Joining…" : "Enroll now"}
                    </button>
                  ) : null}
                  {isIn && (
                    <button
                      type="button"
                      onClick={() => openMaterials(id)}
                      className="btn-primary text-sm !py-2 !px-4"
                    >
                      {materialCourseId === id ? "Refresh materials" : "View materials"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {courses.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 py-14 text-center">
            <p className="text-slate-500 text-sm font-medium">No courses published yet.</p>
            <p className="text-slate-400 text-xs mt-1">Check back soon or ask your instructor.</p>
          </div>
        )}
      </section>

      {materialCourseId && (
        <section className="rounded-lg border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-glow backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                {selectedMaterialCourse?.title || "Course"} materials
              </h2>
              <p className="text-sm text-slate-500 mt-1">Videos, notes, and assignments for this course</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMaterialCourseId(null);
                setMaterials([]);
                setSubs([]);
                setSubmitFor(null);
                setFile(null);
              }}
              className="btn-secondary text-sm !py-2"
            >
              Back to courses
            </button>
          </div>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden bg-slate-50/50">
            {materials.map((m) => (
              <li
                key={m._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 bg-white/80"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{m.title}</span>
                    <span className={`badge ring-1 ${typeBadge(m.type)}`}>{m.type}</span>
                  </div>
                  {m.fileUrl && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Open resource →
                    </a>
                  )}
                </div>
                {m.type === "Assignment" && (
                  <div className="flex items-center gap-2 shrink-0">
                    {subs.some((s) => s.assignmentId?._id === m._id || s.assignmentId === m._id) ? (
                      <span className="badge bg-emerald-100 text-emerald-800 ring-emerald-200">Submitted</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitFor(m._id);
                        setFile(null);
                      }}
                      className="btn-secondary text-xs !py-1.5 !px-3"
                    >
                      Submit work
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {materials.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">No materials for this course yet.</p>
          )}

          {submitFor && (
            <form
              onSubmit={submitAssignment}
              className="mt-8 p-5 rounded-lg border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white"
            >
              <p className="text-sm font-semibold text-slate-900 mb-3">Upload your assignment</p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700 cursor-pointer"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={!file || actionLoading}
                  className="btn-primary text-sm !py-2"
                >
                  {actionLoading?.startsWith("sub-") ? "Uploading…" : "Submit file"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitFor(null);
                    setFile(null);
                  }}
                  className="btn-secondary text-sm !py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
