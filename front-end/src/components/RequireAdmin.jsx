import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const userData = JSON.parse(localStorage.getItem("sessionUser") || "{}");
  const role = userData?.role || localStorage.getItem("role");

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}