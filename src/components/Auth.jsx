import { signInWithGoogle } from "../backend/firebase";

function Auth() {
  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="left w-[50%] h-full bg-black flex justify-center items-center">
        <h1 className="text-white font-bold text-2xl">Welcome to the Site</h1>
      </div>

      {/* Right side */}
      <div className="right w-[50%] h-full flex flex-col justify-center items-center">
        <h1 className="font-extrabold text-2xl">Sign in to your account</h1>
        <h2 className="mb-[20px]">
          Don't have an account?
          <a href="/register" className="text-blue-500 underline">
            Register
          </a>
        </h2>

        {/* Login form */}
        <div className="login flex flex-col">
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

          {/* Google sign-in button */}
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center text-white bg-black mt-[20px] h-[40px] p-2 rounded-sm"
            aria-label="Sign in with Google"
          >
            <i className="fab fa-google mr-2"></i>
            Sign in with Google
          </button>

          {/* Regular sign-in button */}
          <button
            // onClick={handleSignInClick}
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
