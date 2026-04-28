import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashPath =
    user?.role === "Student"
      ? "/student"
      : user?.role === "Instructor"
        ? "/instructor"
        : user?.role === "Admin"
          ? "/admin"
          : "/dashboard";

  const profilePath =
    user?.role === "Student"
      ? "/student/profile/create"
      : user?.role === "Instructor"
        ? "/instructor/profile/create"
        : null;

  const roleBadge =
    user?.role === "Admin"
      ? "bg-violet-100 text-violet-800 ring-violet-200"
      : user?.role === "Instructor"
        ? "bg-amber-100 text-amber-900 ring-amber-200"
        : "bg-emerald-100 text-emerald-800 ring-emerald-200";

  const navLinkClass = ({ isActive }) =>
    [
      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
      isActive
        ? "bg-slate-950 text-white shadow-md shadow-slate-900/15"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    ].join(" ");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="group flex items-center gap-3 self-start">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/20 transition group-hover:-translate-y-0.5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </span>
            <span>
              <span className="font-display text-xl font-semibold tracking-tight text-slate-900 group-hover:text-brand-700 transition">
                CourseHub
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Learning platform
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm md:justify-end">
            {user ? (
              <>
                <div className="order-last flex min-w-0 items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm md:order-none md:mr-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-teal-100 text-sm font-bold text-brand-700 ring-1 ring-white">
                    {user.name?.slice(0, 1)?.toUpperCase() || "U"}
                  </span>
                  <span className="max-w-[150px] truncate text-sm font-semibold text-slate-800">{user.name}</span>
                  <span className={`badge ring-1 ${roleBadge}`}>{user.role}</span>
                </div>
                <NavLink
                  to={dashPath}
                  className={navLinkClass}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" />
                  </svg>
                  Dashboard
                </NavLink>
                {profilePath && (
                  <NavLink
                    to={profilePath}
                    className={navLinkClass}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
                    </svg>
                    Profile
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-xs sm:text-sm">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <footer className="border-t border-white/70 bg-white/60 backdrop-blur-sm py-5 text-center">
        <p className="text-xs font-medium text-slate-500">Online Course Management System</p>
        <p className="text-[11px] text-slate-400 mt-1">Built for students, instructors, and admins</p>
      </footer>
    </div>
  );
}
