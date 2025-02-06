import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Auth from "../components/Auth/Auth.jsx";
import Register from "../components/Auth/Register.jsx";
import Home from "./Home/Home.jsx";
import Dashboard from "./Dashboard.jsx";
import MyMap from "./Map/Mymap.jsx";
import { useAuth } from "../components/Auth/Authprovider";
import ProfileInfo from "./Map/ProfileInfo.jsx";
import "leaflet/dist/leaflet.css";
import DashboardMod from "./Dashboard/DashboardMod.jsx";
import MemoryDetailsMod from "./Dashboard/MemoryDetailsMod.jsx";
import { MemoryProvider } from "../Context/MemoryContext.jsx";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <MemoryProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/welcome" /> : <Auth />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/welcome" /> : <Register />}
          />
          <Route
            path="/welcome"
            element={user ? <MyMap /> : <Navigate to="/login" />}
          />
          <Route path="/profileInfo" element={<ProfileInfo />} />

          <Route path="/dashboard" element={<DashboardMod />} />
          <Route path="/memory/:memoryId" element={<MemoryDetailsMod />} />
        </Routes>
      </MemoryProvider>
    </Router>
  );
}

export default App;
