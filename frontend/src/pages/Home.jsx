import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  {
    title: "Students",
    text: "Find the next class, open resources, and send assignment work without losing your place.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.234-1.783.49-2.658.813m-15.482 0A50.011 50.011 0 0 1 12 2.25c2.407 0 4.742.18 7.035.514" />
    ),
    tint: "from-teal-500 to-cyan-600",
  },
  {
    title: "Instructors",
    text: "Build course rooms, publish materials, and follow submissions from a clean teaching desk.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" />
    ),
    tint: "from-rose-500 to-pink-600",
  },
  {
    title: "Admins",
    text: "Keep users, roles, and published courses visible with the right controls close at hand.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    ),
    tint: "from-amber-500 to-orange-600",
  },
];

const stats = [
  ["3", "role-based workspaces"],
  ["1", "shared course catalog"],
  ["24/7", "material access"],
];

export default function Home() {
  const { user } = useAuth();

  const cta = user
    ? user.role === "Student"
      ? { to: "/student", label: "Open student dashboard" }
      : user.role === "Instructor"
        ? { to: "/instructor", label: "Open instructor workspace" }
        : { to: "/admin", label: "Open admin console" }
    : { to: "/register", label: "Create free account" };

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 sm:pt-14 sm:pb-24">
        <section className="grid min-h-[calc(100vh-11rem)] items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="animate-fadeUp">
            <p className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/75 px-4 py-1.5 tracking-widest text-teal-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online Course Management
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              One calm place for classes, resources, and progress.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              CourseHub gives students, instructors, and admins a focused workspace where the next action is always clear.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={cta.to} className="btn-primary w-full px-8 py-3.5 text-base sm:w-auto">
                {cta.label}
              </Link>
              {!user && (
                <Link to="/login" className="btn-secondary w-full px-8 py-3.5 text-base font-semibold sm:w-auto">
                  I already have an account
                </Link>
              )}
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map(([value, label]) => (
                <div key={label} className="panel px-4 py-4">
                  <p className="font-display text-2xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-medium leading-snug text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="panel overflow-hidden p-3">
              <div className="rounded-lg bg-slate-950 p-4 text-white shadow-soft">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-teal-200">Today</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold">Learning board</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                    Live
                  </span>
                </div>
                <div className="grid gap-3 py-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-xs text-slate-300">Course</p>
                    <p className="mt-2 font-semibold">Web Development</p>
                    <div className="mt-5 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-3/4 rounded-full bg-teal-300" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-xs text-slate-300">Submissions</p>
                    <p className="mt-2 font-semibold">12 reviewed</p>
                    <div className="mt-5 flex -space-x-2">
                      {["A", "M", "R", "S"].map((letter, i) => (
                        <span
                          key={letter}
                          className={`grid h-8 w-8 place-items-center rounded-full border border-slate-950 text-xs font-bold ${
                            i % 2 ? "bg-amber-300 text-slate-950" : "bg-rose-300 text-slate-950"
                          }`}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 rounded-lg bg-white p-4 text-slate-900">
                  {["React notes uploaded", "Assignment due Friday", "New learner joined"].map((item, i) => (
                    <div key={item} className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          i === 0 ? "bg-teal-500" : i === 1 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
          {features.map((card, i) => (
            <div
              key={card.title}
              className="group panel relative p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200/80 hover:shadow-glow sm:p-7"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${card.tint} text-white shadow-lg`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {card.icon}
                </svg>
              </div>
              <h2 className="font-display mb-2 text-xl font-semibold text-slate-900">{card.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
