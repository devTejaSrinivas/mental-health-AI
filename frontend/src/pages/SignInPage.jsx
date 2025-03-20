import React from "react";
import { teamwork, signup } from "../assets/";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#F28383] from-10% via-[#9D6CD2] via-30% to-[#481EDC] to-90% flex items-center justify-center min-h-screen p-4">
      <div className="max-w-[960px] bg-black-dark grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-20 p-5 rounded-2xl relative">
        <div className="flex justify-center md:justify-start">
          <img src={signup} alt="Signup Background" className="w-full h-auto" />
          <img
            src={teamwork}
            alt="Teamwork"
            className="absolute top-24 md:top-36"
          />
        </div>
        <div className="max-w-md mx-auto grid gap-5">
          <button
            className="bg-[#c334eb] text-white px-4 py-2 rounded-full w-max self-start hover:bg-gray-600"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center md:text-left">
            Login
          </h1>
          <p className="text-dull-white text-center md:text-left">
            Access to 300+ hours of courses, tutorials and livestreams
          </p>
          <form action="" className="space-y-6 text-white">
            <div className="relative">
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white-medium rounded-full p-2 flex items-center justify-center text-blue-300">
                <MdEmail />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white-light text-black py-2 pl-12 pr-4 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-neon-blue focus:drop-shadow-lg"
              />
            </div>
            <div className="relative">
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white-medium rounded-full p-2 flex items-center justify-center text-blue-300">
                <RiLockPasswordFill />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-white-light text-black py-2 pl-12 pr-4 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-neon-blue focus:drop-shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <button
                className="bg-gradient-to-r from-blue-400 to-cyan-200 w-full font-semibold rounded-full py-2"
                onClick={() => navigate("/chat?")}
              >
                Sign in as Patient
              </button>
              <button
                className="bg-gradient-to-r from-cyan-200 to-blue-400 w-full font-semibold rounded-full py-2"
                onClick={() => navigate("/dashboard")}
              >
                Sign in as Doctor
              </button>
            </div>
          </form>
          <div className="text-dull-white border-t border-white-light pt-4 space-y-4 text-sm text-center md:text-left">
            <p>
              Don't have an account?{" "}
              <a
                className="text-neon-blue font-semibold cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </a>
            </p>
            <p>
              Forgot password?{" "}
              <a className="text-neon-blue font-semibold cursor-pointer">
                Reset password
              </a>
            </p>
            <p>
              Don't have a password yet?{" "}
              <a className="text-neon-blue font-semibold cursor-pointer">
                Set password
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
