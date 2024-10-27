import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth, signInWithGoogle } from "../backend/firebase"; // Adjust the import path
import { createUserWithEmailAndPassword } from "firebase/auth";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUpClick = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Sign up user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User registered successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="left w-[50%] h-full bg-black flex justify-center items-center">
        <h1 className="text-white font-bold text-2xl">
          Welcome to the MapFolio
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

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="group w-[300px] h-[30px] mt-[10px] mb-[20px] border p-[20px] rounded-md"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-[300px] h-[30px] mt-[10px] border p-[20px] rounded-md"
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

          {/* Google Sign-up button */}
          <button
            onClick={signInWithGoogle}
            className="text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
          >
            Sign Up with Google
          </button>

          {/* Regular sign-up button */}
          <button
            onClick={handleSignUpClick}
            className="text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
