import { useState } from "react";
import { signInWithGoogle } from "../../backend/firebase";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../backend/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Typewriter from "typewriter-effect";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      // Check if email exists in Firestore
      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Email not registered.");
        return;
      }

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

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side */}
      <div className="md:w-1/2 w-full h-1/3 md:h-full bg-black flex justify-center items-center text-white p-6">
        <h1 className="text-2xl font-bold text-center">
          <Typewriter
            options={{
              strings: ["Welcome to Mapfolio", "Sign in to get started"],
              autoStart: true,
              loop: true,
              delay: 40,
            }}
          />
        </h1>
      </div>

      {/* Right side */}
      <div className="md:w-1/2 w-full h-2/3 md:h-full flex flex-col justify-center items-center p-6">
        <h1 className="font-extrabold text-2xl mb-4">
          Sign in to your account
        </h1>

        <div className="w-full max-w-sm">
          {error && <p className="text-red-500">{error}</p>}

          {/* Email Input */}
          <label htmlFor="email" className="block mt-4">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-md mt-2"
          />

          {/* Password Input */}
          <label htmlFor="password" className="block mt-4">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-md mt-2"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Sign-in Button */}
          <button
            onClick={handleSignIn}
            className="w-full text-white bg-black mt-6 h-12 rounded-md"
          >
            Sign in
          </button>

          {/* Google Sign-in */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center text-white bg-red-500 mt-4 h-12 rounded-md"
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
            Sign in with Google
          </button>

          {/* Register Link */}
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
