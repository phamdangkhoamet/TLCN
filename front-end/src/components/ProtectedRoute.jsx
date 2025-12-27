// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ProtectedRoute({ children }) {
  const token = api.auth.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
