// import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="left w-[50%] h-full bg-black flex justify-center items-center">
        <h1 className="text-white font-bold text-2xl">Welcome to the Site</h1>
      </div>

      {/* Right side */}
      <div className="right w-[50%] h-full flex flex-col justify-center items-center">
        <h1 className="font-extrabold text-2xl">Create your account</h1>
        <h2 className="mb-[20px]">Already have an account?</h2>

        {/* Registration form */}
        <div className="register flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="group w-[300px] h-[30px] mt-[10px] mb-[20px] border p-[20px] rounded-md"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-[300px] h-[30px] mt-[10px] border p-[20px] rounded-md"
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="w-[300px] h-[30px] mt-[10px] mb-[20px] border p-[20px] rounded-md"
          />

          {/* Regular sign-up button */}
          <button
            // onClick={handleSignUpClick}
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
