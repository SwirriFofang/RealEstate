import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const ProjectOwnerLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, clearError } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError("");
      clearError();
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(formData);
      const user = response?.user;

      if (!user) {
        setError("Login failed. Please try again.");
        return;
      }

      if (user.role !== 'project_owner' && user.role !== 'admin') {
        setError('This account is not a Project Owner. Please use the Investor login.');
        return;
      }

      if (user.role === 'project_owner' && !user.isApproved) {
        navigate('/pending-approval');
        return;
      }

      navigate('/project-owners-dashboard');
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[40px] shadow-sm w-full max-w-md overflow-hidden">
        <div className="relative bg-blue-800 h-48 flex flex-col justify-center px-10 text-white">
          <h1 className="text-2xl font-bold z-10">Welcome Back!</h1>
          <p className="text-sm opacity-90 z-10">
            Sign in to manage projects and raise funding
          </p>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-24 w-full">
              <path
                d="M0,150 C150,150 250,0 500,150 L500,150 L0,150 Z"
                fill="white"
              ></path>
            </svg>
          </div>
        </div>

        <div className="p-8 pt-2">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-700 text-gray-600 placeholder-gray-400"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-700 text-gray-600 placeholder-gray-400"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-300"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-md transition-colors"
            >
              {loading ? "Signing In..." : "Sign In (Project Owner)"}
            </button>

            <div className="text-right">
              <a href="#" className="text-sm text-blue-800 font-medium">
                Forgot Password?
              </a>
            </div>

            <div className="flex justify-center items-center gap-4 py-4">
              <button className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-lg">G</span>
              </button>

              <button className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <Mail className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-lg text-blue-600">f</span>
              </button>
            </div>

            <p className="text-sm text-center text-gray-500">
              New here?{" "}
              <Link to="/SignUp" className="text-blue-800 font-bold">
                Sign Up
              </Link>
            </p>

            <p className="text-xs text-center text-gray-500">
              Are you an investor?{" "}
              <Link to="/Login" className="text-blue-800 font-semibold">
                Sign in here
              </Link>
            </p>
          </form>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-1">
            LandInvest is a coordination platform for land investment.
          </p>
          <p className="text-xs text-gray-400">
            LandInvest does not manage funds or own properties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectOwnerLoginPage;
