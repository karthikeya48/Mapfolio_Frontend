import { useState } from "react";
import { signInWithGoogle } from "../backend/firebase";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../backend/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  // For routing purposes

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
      navigate("/welcome", { state: { email: auth.currentUser.email } }); // Get email from Firebase auth
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="left w-[50%] h-full bg-black flex justify-center items-center">
        <h1 className="text-white font-bold text-2xl">
          Welcome to the Mapfolio
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

        {/* Login form */}
        <div className="login flex flex-col">
          {error && <p style={{ color: "red" }}>{error}</p>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
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
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
            aria-label="Sign in with Google"
          >
            <i className="fab fa-google mr-2"></i>
            Sign in with Google
          </button>
          <button
            onClick={handleSignIn}
            className="text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
