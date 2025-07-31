import React, { useState, useEffect } from 'react';

// Import icons from react-icons library
import { BsFillChatSquareDotsFill } from 'react-icons/bs';
import { FaEyeSlash } from 'react-icons/fa';

// Import the SCSS file for styling
import './Signup.scss';

const SignUpPage = () => {
  // State for form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [source, setSource] = useState('');

  // State for UI interactions
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Effect to enable/disable the submit button based on form completion
  useEffect(() => {
    if (fullName && email && password && source) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [fullName, email, password, source]);

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isButtonDisabled) {
      console.log('Creating account with:', { fullName, email, password, companyUrl, source });
      alert(`Account for ${fullName} at ${companyUrl || 'their company'} created!`);
    }
  };

  return (
    <div className="signup-split-page">
      {/* Left Promotional Panel */}
      <div className="left-panel">
        <div className="panel-content">
          <header className="panel-header">
            <BsFillChatSquareDotsFill className="logo-icon" />
            <span className="logo-name">Syfer250</span>
          </header>
          
          {/* <div className="promo-graphic">
            <div className="email-editor-mockup">
              <div className="mockup-header">Personalize Email Message</div>
              <div className="mockup-body">
                <p>Subject</p>
                <div className="mockup-toolbar"></div>
                <div className="mockup-textarea">
                  Hi &#123;&#123;first_name&#125;&#125;,
                </div>
                <div className="mockup-step">Email Sequence</div>
                <div className="mockup-step">wait for 1 day</div>
                <div className="mockup-step">Email follow up 1</div>
              </div>
            </div>
          </div> */}
          
          {/* <div className="promo-text">
            <h2>Personalized Email Messages</h2>
            <div className="carousel-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div> */}

          {/* <footer className="testimonial">
            <p>"World Class Software Built By A World Class Team"</p>
            <span>– Nick A, CEO of Leadbird.io</span>
          </footer> */}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="right-panel">
        <div className="login-prompt">
          Already have an account? <a href="/login">Log in</a>
        </div>
        
        <div className="form-container">
          <h1>Start free trial</h1>
          <p className="subtitle">Unlimited cold emailing at scale with AI Warmups</p>

          <form onSubmit={handleSubmit}>
               <label htmlFor="fullName">Full name</label>
            <div className="group">
           
              <input id="fullName" type="text" placeholder="Enter Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              
            </div>
             <label htmlFor="email">Email Address</label>
            <div className="group">
              <input id="email" type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
             
            </div>
            
                <label htmlFor="password">Create Password</label>
            <div className="group password-wrapper">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
              <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                <FaEyeSlash />
              </span>
            </div>

   <label htmlFor="companyUrl">Company URL</label>
            <div className="group">
              <input id="companyUrl" type="text" placeholder="Enter Company URL" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} />
           
            </div>
    <label htmlFor="source">Where did you find us?</label>
            <div className="group">
              <select id="source"  value={source} onChange={(e) => setSource(e.target.value)} required>
                <option value="" disabled></option>
                <option value="google">Google</option>
                <option value="linkedin">LinkedIn</option>
                <option value="friend">From a Friend</option>
                <option value="social_media">Social Media</option>
                <option value="other">Other</option>
              </select>
          
            </div>
            
            <button type="submit" className="create-button" disabled={isButtonDisabled}>
              Create Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;