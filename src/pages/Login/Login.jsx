// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BsFillChatSquareDotsFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./Login.scss";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // You can add real authentication here
    console.log("Login attempt with:", { email, password });
    alert(`Signing in as ${email}`);

    // Navigate to dashboard after login
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="logo-container">
          <BsFillChatSquareDotsFill className="logo-icon" />
          <span className="logo-name">Syfer250</span>
        </div>
        <div className="signup-prompt">
          <span>New to Syfer250? </span>
          <a href="/signup">Sign up</a>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <h1 className="login-title">Sign in to Syfer250</h1>
          <p className="login-subtitle">
            Always land in your lead's inbox with unlimited sender accounts, so
            you can focus on closing deals.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
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

             <a href="#" className="forgot-password-link">
              Forgot Password?
            </a>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
