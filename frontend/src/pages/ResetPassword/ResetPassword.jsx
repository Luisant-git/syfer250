import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { BsFillChatSquareDotsFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer";
import apiService from "../../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showError("Invalid reset link");
      navigate('/login');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await apiService.resetPassword(token, password);
      showSuccess("Password reset successful! Please login.");
      navigate('/login');
    } catch (error) {
      showError(error.message || "Failed to reset password");
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
          <Link to="/login">Back to Login</Link>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <h1 className="login-title text-primary">Set New Password</h1>
          <p className="login-subtitle">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group password-wrapper">
              <label htmlFor="password" className="input-label">
                New Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword" className="input-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ResetPassword;