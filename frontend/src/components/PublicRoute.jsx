import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated }) => {
  return !isAuthenticated ? <Outlet/> : <Navigate to="/homepage"/>;
};

export default ProtectedRoute;