import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsFillChatSquareDotsFill } from "react-icons/bs";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer";
import apiService from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.forgotPassword(email);
      setSent(true);
      showSuccess("Reset link sent to your email");
    } catch (error) {
      showError(error.message || "Failed to send reset link");
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
          <h1 className="login-title text-primary">Reset Password</h1>
          {!sent ? (
            <>
              <p className="login-subtitle">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p className="login-subtitle">
                Reset link sent! Check your email for instructions.
              </p>
              <Link to="/login" className="login-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ForgotPassword;