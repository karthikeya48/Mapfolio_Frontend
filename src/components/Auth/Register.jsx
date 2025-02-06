import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, signInWithGoogle } from "../../backend/firebase/";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      alert("Google sign-in successful!");
      navigate("/welcome", { state: { email: auth.currentUser.email } });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUpClick = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Username cannot be empty!");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: username });

      // Store user data in Firestore
      await setDoc(doc(db, "users", email), {
        username,
        email,
      });

      alert("User registered successfully!");
      navigate("/welcome", { state: { email, username } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side */}
      <div className="md:w-1/2 w-full h-1/3 md:h-full bg-black flex justify-center items-center text-white p-6">
        <h1 className="text-2xl font-bold text-center">Welcome to Mapfolio</h1>
      </div>

      {/* Right side */}
      <div className="md:w-1/2 w-full h-2/3 md:h-full flex flex-col justify-center items-center p-6">
        <h1 className="font-extrabold text-2xl">Create your account</h1>
        <p className="mb-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 underline">
            Login
          </Link>
        </p>

        <div className="w-full max-w-sm">
          {error && <p className="text-red-500">{error}</p>}

          {/* Username Input */}
          <label htmlFor="username" className="block mt-4">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-3 rounded-md mt-2"
          />

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

          {/* Confirm Password Input */}
          <label htmlFor="confirmPassword" className="block mt-4">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 rounded-md mt-2"
            />
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUpClick}
            className="w-full text-white bg-black mt-6 h-12 rounded-md"
          >
            Sign Up
          </button>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center text-white bg-red-500 mt-4 h-12 rounded-md"
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
