import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StudentProfileCreate from "./pages/StudentProfileCreate.jsx";
import InstructorProfileCreate from "./pages/InstructorProfileCreate.jsx";
import InstructorProfileView from "./pages/InstructorProfileView.jsx";

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Student") return <Navigate to="/student" replace />;
  if (user.role === "Instructor") return <Navigate to="/instructor" replace />;
  if (user.role === "Admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="h-14 w-14 rounded-lg border-2 border-brand-200 border-t-brand-600 animate-spin" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-500/10 to-accent-500/10 blur-xl" />
        </div>
        <p className="mt-5 text-sm font-medium text-slate-500">Preparing your workspace…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["Student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile/create"
          element={
            <ProtectedRoute roles={["Student"]}>
              <StudentProfileCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/instructors/:id"
          element={
            <ProtectedRoute roles={["Student"]}>
              <InstructorProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles={["Instructor"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/profile/create"
          element={
            <ProtectedRoute roles={["Instructor"]}>
              <InstructorProfileCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
