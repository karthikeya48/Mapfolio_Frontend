import React from "react";
import { useLocation } from "react-router-dom";

function Welcome() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="flex h-screen justify-center items-center">
      <h1 className="text-2xl">
        Welcome! Your email is: <span className="font-bold">{email}</span>
      </h1>
    </div>
  );
}

export default Welcome;
