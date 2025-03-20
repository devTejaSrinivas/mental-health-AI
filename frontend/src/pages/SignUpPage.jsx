import React, { useState } from "react";
import axios from "axios"; // Import axios for API calls
import { registerbackground } from "../assets";

function SignUpPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/register`,
        {
          firstname: formData.firstname,
          surname: formData.surname,
          email: formData.email,
          password: formData.password,
        }
      );

      setSuccessMessage(response.data.message);
      setFormData({
        firstname: "",
        surname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <div
      className="min-h-screen py-20 flex items-center justify-center"
      style={{ backgroundImage: "linear-gradient(115deg, #9F7AEA, #FEE2FE)" }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row w-10/12 lg:w-8/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden">
          <div
            className="w-full lg:w-1/2 flex flex-col items-center justify-start p-12 bg-no-repeat bg-cover bg-center"
            style={{
              backgroundImage: `url(${registerbackground})`,
              minHeight: "400px",
            }}
          >
            <h1 className="text-white text-3xl font-bold mt-5">Welcome</h1>
            <p className="text-white text-center px-4 mt-2">
              Monitor your mental health effectively through KalRav. Click here
              to &nbsp;
              <a href="/" className="text-purple-500 font-semibold underline">
                Learn more
              </a>
            </p>
          </div>

          <div className="w-full lg:w-1/2 py-12 px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
              Register
            </h2>
            <p className="mb-6 text-gray-600 text-center">
              Create your account. It’s free and only takes a minute.
            </p>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {successMessage && (
              <p className="text-green-500 text-center mb-4">
                {successMessage}
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstname"
                  placeholder="Firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="border border-gray-400 py-2 px-3 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="text"
                  name="surname"
                  placeholder="Surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className="border border-gray-400 py-2 px-3 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="mt-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border border-gray-400 py-2 px-3 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="mt-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border border-gray-400 py-2 px-3 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="mt-4">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border border-gray-400 py-2 px-3 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="mt-5 flex items-start">
                <input type="checkbox" className="mt-1 mr-2" required />
                <span className="text-gray-600">
                  I accept the{" "}
                  <a href="#" className="text-purple-500 font-semibold">
                    Terms of Use
                  </a>{" "}
                  &{" "}
                  <a href="#" className="text-purple-500 font-semibold">
                    Privacy Policy
                  </a>
                </span>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 transition duration-300 text-white font-semibold py-3 rounded-lg shadow-md"
                >
                  Register Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
