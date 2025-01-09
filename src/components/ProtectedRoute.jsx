import { Navigate } from "react-router-dom";
import { auth } from "../backend/firebase";
import PropTypes from "prop-types";

function ProtectedRoute({ children }) {
  const user = auth.currentUser;
  return user ? children : <Navigate to="/login" />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ProtectedRoute;
