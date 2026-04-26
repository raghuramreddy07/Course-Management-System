import { Outlet, Link, useNavigate } from "react-router-dom";
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white shadow-md shadow-slate-900/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </span>
            <span>
              <span className="font-display text-lg font-semibold tracking-tight text-slate-900 group-hover:text-brand-700 transition">
                CourseHub
              </span>
              <span className="hidden sm:block text-[11px] font-medium uppercase text-slate-400">
                Learning platform
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 mr-1 text-right">
                  <span className="text-sm font-medium text-slate-800 max-w-[140px] truncate">{user.name}</span>
                  <span className={`badge ring-1 ${roleBadge}`}>{user.role}</span>
                </div>
                <Link
                  to={dashPath}
                  className="btn-secondary !py-2 !px-3 text-xs sm:text-sm border-teal-200 text-teal-700 hover:border-teal-300 hover:bg-teal-50"
                >
                  Dashboard
                </Link>
                {profilePath && (
                  <Link
                    to={profilePath}
                    className="btn-secondary !py-2 !px-3 text-xs sm:text-sm border-amber-200 text-amber-800 hover:border-amber-300 hover:bg-amber-50"
                  >
                    Profile
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="btn-ghost text-slate-600"
                >
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
