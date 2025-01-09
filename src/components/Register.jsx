import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../backend/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
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

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!username.trim()) {
      setError("Username cannot be empty!");
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user's profile with the username
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      alert("User registered successfully!");
      navigate("/welcome", {
        state: { email: userCredential.user.email, username },
      });
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
        <h1 className="font-extrabold text-2xl">Create your account</h1>
        <h2 className="mb-[20px]">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 underline">
            Login
          </Link>
        </h2>

        {/* Registration form */}
        <div className="register flex flex-col">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {/* 
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="group w-[300px] h-[30px] mt-[10px] mb-[10px] border p-[20px] rounded-md"
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="group w-[300px] h-[30px] mt-[10px] mb-[10px] border p-[20px] rounded-md"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-[300px] h-[30px] mt-[10px] mb-[10px]  border p-[20px] rounded-md"
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-[300px] h-[30px] mt-[10px] mb-[20px] border p-[20px] rounded-md"
          />

          <button
            onClick={handleSignUpClick}
            className="text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
          >
            Sign Up
          </button> */}

          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center text-white bg-black mt-[20px] h-[40px] w-[240px] p-[10px] rounded-sm"
            aria-label="Sign in with Google"
          >
            <FontAwesomeIcon
              icon={faGoogle}
              fade
              className="mr-[10px]"
              style={{ color: "#74C0FC" }}
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
