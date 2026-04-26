import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const formatPrice = (price) => `Rs. ${Number(price ?? 499).toLocaleString("en-IN")}`;

export default function InstructorProfileView() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/api/users/instructors/${id}/profile`);
        setProfileData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load instructor profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto h-12 w-12 rounded-lg border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        <Link to="/student" className="btn-secondary mt-5">Back to dashboard</Link>
      </div>
    );
  }

  const instructor = profileData.instructor;
  const profile = instructor.profile || {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/student" className="btn-secondary mb-6 text-sm !py-2">
        Back to dashboard
      </Link>

      <section className="panel overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-teal-300 to-rose-400" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-950 text-3xl font-semibold text-white">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={instructor.name} className="h-full w-full object-cover" />
              ) : (
                instructor.name?.slice(0, 1)
              )}
            </div>
            <div className="min-w-0">
              <p className="eyebrow mb-2 text-amber-700">Instructor profile</p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950">{instructor.name}</h1>
              <p className="mt-2 text-slate-600">{profile.headline || "Instructor"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.department && <span className="badge bg-amber-100 text-amber-900 ring-1 ring-amber-200">{profile.department}</span>}
                {profile.educationLevel && <span className="badge bg-teal-100 text-teal-800 ring-1 ring-teal-200">{profile.educationLevel}</span>}
                {profile.location && <span className="badge bg-slate-100 text-slate-700 ring-1 ring-slate-200">{profile.location}</span>}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.7fr]">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-950">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {profile.bio || "This instructor has not added an about section yet."}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white/80 p-5">
              <h2 className="font-display text-lg font-semibold text-slate-950">Contact and expertise</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Email</dt>
                  <dd className="text-slate-800">{instructor.email}</dd>
                </div>
                {profile.phone && (
                  <div>
                    <dt className="font-semibold text-slate-500">Phone</dt>
                    <dd className="text-slate-800">{profile.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold text-slate-500">Expertise</dt>
                  <dd className="text-slate-800">{profile.expertise || "Not added yet"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-slate-950">Courses by {instructor.name}</h2>
          <span className="text-xs font-medium text-slate-500">{profileData.courses.length} total</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {profileData.courses.map((course) => (
            <article key={course._id} className="rounded-lg border border-slate-200/90 bg-white/90 p-5 shadow-card">
              <h3 className="font-display text-lg font-semibold text-slate-950">{course.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{course.description}</p>
              <p className="mt-3 text-sm font-semibold text-slate-950">{formatPrice(course.price)}</p>
              <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                {course.enrolledCount || 0} students enrolled
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
