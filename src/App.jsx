import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { db } from "./backend/firebase.js";
import { doc, collection, getDocs } from "firebase/firestore";
import Auth from "./components/Auth/Auth.jsx";
import Register from "./components/Auth/Register.jsx";
import Home from "./components/Home/Home.jsx";
import MyMap from "./components/Map/Mymap.jsx";
import { useAuth } from "./components/Auth/Authprovider.jsx";
import ProfileInfo from "./components/Map/ProfileInfo.jsx";
import "leaflet/dist/leaflet.css";
import DashboardMod from "./components/Dashboard/DashboardMod.jsx";
import MemoryDetailsMod from "./components/Dashboard/MemoryDetailsMod.jsx";
import { MemoryProvider } from "./Context/MemoryContext.jsx";

function App() {
  useEffect(() => {
    handler();
  }, []);

  const handler = async () => {
    const collectionRef = await collection(db, "users");
    const snapDoc = await getDocs(collectionRef);
    console.log(snapDoc.docs);
    snapDoc.docs.forEach((Doc) => {
      console.log(Doc.data());
    });
    console.log("kar");
    // console.log(snapDoc);
  };

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
