import { signInWithGoogle } from "../backend/firebase";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./Auth.jsx";
import Register from "./Register.jsx";
import Welcome from "./Welcome.jsx";
import Home from "./Home.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login/" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;
