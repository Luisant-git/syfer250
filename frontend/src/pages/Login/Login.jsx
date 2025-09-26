// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BsFillChatSquareDotsFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer";

import "./Login.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      showSuccess("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Login failed");
      showError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="logo-container">
          <BsFillChatSquareDotsFill className="logo-icon" />
          <span className="logo-name">Syfer250</span>
        </div>
        <div className="signup-prompt">
          <span className="new-to-text">New to Syfer250? </span>

          <a href="/signup">Sign up</a>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <h1 className="login-title text-primary">Sign in to Syfer250</h1>
          <p className="login-subtitle">
            Always land in your lead's inbox with unlimited sender accounts, so
            you can focus on closing deals.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* <a href="#" className="forgot-password-link">
              Forgot Password?
            </a> */}

            <div className="input-group password-wrapper">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
                role="button"
                tabIndex={0}
                aria-label="Toggle password visibility"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") togglePasswordVisibility();
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

             <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default LoginPage;
