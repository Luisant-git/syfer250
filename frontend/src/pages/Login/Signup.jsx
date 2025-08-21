import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BsFillChatSquareDotsFill } from 'react-icons/bs';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/UI/ToastContainer/ToastContainer';
import './Signup.scss';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [source, setSource] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!(fullName && email && password && source));
  }, [fullName, email, password, source]);

  const { register } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isButtonDisabled) return;
    
    setLoading(true);
    setError('');

    try {
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ');
      
      await register({
        email,
        password,
        firstName,
        lastName
      });
      
      showSuccess('Account created successfully! Welcome to Syfer250.');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Registration failed');
      showError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-split-page">
      {/* Left Promotional Panel - Hidden on mobile */}
      <div className="left-panel">
        <div className="panel-content">
          <header className="panel-header">
            <BsFillChatSquareDotsFill className="logo-icon" />
            <span className="logo-name">Syfer250</span>
          </header>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="right-panel">
        {/* Mobile Header with Logo */}
        <div className="mobile-header">
          <BsFillChatSquareDotsFill className="mobile-logo-icon" />
          <span className="mobile-logo-name">Syfer250</span>
        </div>
        
        <div className="login-prompt">
  <span className="login-text">Already have an account?</span> <a href="/login">Log in</a>
</div>

        
        <div className="form-container">
          <h1>Start free trial</h1>
          <p className="subtitle">Unlimited cold emailing at scale with AI Warmups</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input 
                id="fullName" 
                type="text" 
                placeholder="Enter Full name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                placeholder="Enter Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group password-wrapper">
              <label htmlFor="password">Create Password</label>
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span 
                className="password-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="companyUrl">Company URL</label>
              <input 
                id="companyUrl" 
                type="text" 
                placeholder="Enter Company URL" 
                value={companyUrl} 
                onChange={(e) => setCompanyUrl(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="source">Where did you find us?</label>
              <select 
                id="source"  
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                required
              >
                <option value="" disabled>Select an option</option>
                <option value="google">Google</option>
                <option value="linkedin">LinkedIn</option>
                <option value="friend">From a Friend</option>
                <option value="social_media">Social Media</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="create-button" 
              disabled={isButtonDisabled || loading}
            >
              {loading ? 'Creating Account...' : 'Create Now'}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default SignUpPage;