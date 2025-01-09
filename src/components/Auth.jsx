import { useState, useEffect } from "react";
import { signInWithGoogle } from "../backend/firebase";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../backend/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Typewriter from "typewriter-effect";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [lastActiveTime, setLastActiveTime] = useState(Date.now()); // Track user activity time

  // Session timeout duration (e.g., 30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    // Check for session timeout on every render and after user activity
    const checkSessionTimeout = () => {
      const currentTime = Date.now();
      if (currentTime - lastActiveTime > SESSION_TIMEOUT) {
        signOut(auth) // Log out user if session has expired
          .then(() => {
            navigate("/login"); // Redirect to login page
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      }
    };

    const intervalId = setInterval(checkSessionTimeout, 60000); // Check every 60 seconds
    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [lastActiveTime, navigate]);

  // Handle activity reset on user interaction
  const handleUserActivity = () => {
    setLastActiveTime(Date.now()); // Update the last active time
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sign-in successful!");
      navigate("/welcome", { state: { email } });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      alert("Google sign-in successful!");
      navigate("/welcome", { state: { email: auth.currentUser.email } });
    } catch (err) {
      setError(err.message);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLastActiveTime(Date.now()); // Reset the session timer on login
      }
    });

    return unsubscribe; // Clean up the listener on component unmount
  }, []);

  return (
    <div className="flex h-screen" onClick={handleUserActivity}>
      {/* Left side */}
      <div className="left w-[50%] h-full bg-black flex justify-center items-center">
        <h1 className="text-white font-bold text-2xl">
          <Typewriter
            options={{
              strings: ["Welcome to the Mapfolio", "Get started by signing in"],
              autoStart: true,
              loop: true,
              delay: 40,
            }}
          />
        </h1>
      </div>

      {/* Right side */}
      <div className="right w-[50%] h-full flex flex-col justify-center items-center">
        <h1 className="font-extrabold text-2xl">Sign in to your account</h1>
        <h2 className="mb-[20px]">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 underline">
            Register
          </Link>
        </h2>
        <FontAwesomeIcon
          icon="fa-brands fa-google"
          fade
          style={{ color: "#74C0FC" }}
        />

        {/* Login form */}
        <div className="login flex flex-col">
          {error && <p style={{ color: "red" }}>{error}</p>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="group w-[300px] h-[30px] mt-[10px] mb-[20px] border p-[20px] rounded-md"
          />
          <div className="flex flex-col relative">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[300px] h-[30px] mt-[10px] border p-[20px] rounded-md"
            />
          </div>

          <button
            onClick={handleSignIn}
            className="text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
          >
            Sign in
          </button>
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
            aria-label="Sign in with Google"
          >
            <FontAwesomeIcon
              icon={faGoogle}
              fade
              style={{ color: "#74C0FC" }}
            />
            <i className="fab fa-google mr-2"></i>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
