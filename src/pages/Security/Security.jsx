"use client"

import { useState } from "react"
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import "./Security.scss"

const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [backupCodes, setBackupCodes] = useState([])
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const passwordRequirements = [
    { text: "At least 8 characters", met: newPassword.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(newPassword) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(newPassword) },
    { text: "Contains number", met: /\d/.test(newPassword) },
    { text: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ]

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, NY",
      ip: "192.168.1.100",
      lastActive: "2 minutes ago",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, NY",
      ip: "192.168.1.101",
      lastActive: "1 hour ago",
      current: false,
    },
    {
      id: 3,
      device: "Firefox on MacOS",
      location: "Boston, MA",
      ip: "10.0.0.50",
      lastActive: "2 days ago",
      current: false,
    },
  ]

  const loginHistory = [
    {
      id: 1,
      timestamp: "2024-01-20 14:30:00",
      device: "Chrome on Windows",
      location: "New York, NY",
      ip: "192.168.1.100",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2024-01-20 09:15:00",
      device: "Safari on iPhone",
      location: "New York, NY",
      ip: "192.168.1.101",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2024-01-19 18:45:00",
      device: "Unknown Device",
      location: "Unknown Location",
      ip: "203.0.113.1",
      status: "failed",
    },
  ]

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      alert("Password doesn't meet requirements")
      return
    }

    setIsChangingPassword(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsChangingPassword(false)

    // Reset form
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    alert("Password changed successfully")
  }

  const handleTwoFactorSetup = () => {
    setShowTwoFactorSetup(true)
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 8).toUpperCase())
    setBackupCodes(codes)
  }

  const handleTwoFactorEnable = () => {
    if (otpCode.length === 6) {
      setTwoFactorEnabled(true)
      setShowTwoFactorSetup(false)
      setOtpCode("")
      alert("Two-factor authentication enabled successfully")
    }
  }

  const handleTwoFactorDisable = () => {
    if (confirm("Are you sure you want to disable two-factor authentication?")) {
      setTwoFactorEnabled(false)
      setBackupCodes([])
    }
  }

  const revokeSession = (sessionId) => {
    if (confirm("Are you sure you want to revoke this session?")) {
      // Handle session revocation
      alert("Session revoked successfully")
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="security">
      <div className="security__header">
        <h1>Security Settings</h1>
        <p>Manage your account security and authentication methods</p>
      </div>

      <div className="security__content">
        {/* Password Change */}
        <Card>
          <Card.Header>
<h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <Key size={20} />
  Change Password
</h2>

          </Card.Header>
          <Card.Body>
            <div className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                  />
                  <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("current")}>
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                  <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("new")}>
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                  <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("confirm")}>
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="password-requirements">
                  <h4>Password Requirements</h4>
                  <ul>
                    {passwordRequirements.map((req, index) => (
                      <li key={index} className={req.met ? "requirement-met" : "requirement-unmet"}>
                        {req.met ? <Check size={14} /> : <X size={14} />}
                        <span>{req.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handlePasswordChange}
                loading={isChangingPassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Change Password
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <Card.Header>
            <h2>
              <Smartphone size={20} />
              Two-Factor Authentication
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="two-factor-section">
              <div className="two-factor-status">
                <div className="status-indicator">
                  <div
                    className={`status-dot ${twoFactorEnabled ? "status-dot--enabled" : "status-dot--disabled"}`}
                  ></div>
                  <div className="status-text">
                    <strong>Two-Factor Authentication is {twoFactorEnabled ? "Enabled" : "Disabled"}</strong>
                    <p>
                      {twoFactorEnabled
                        ? "Your account is protected with two-factor authentication"
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                </div>

                <div className="status-actions">
                  {twoFactorEnabled ? (
                    <Button variant="danger" onClick={handleTwoFactorDisable}>
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleTwoFactorSetup}>
                      Enable 2FA
                    </Button>
                  )}
                </div>
              </div>

              {showTwoFactorSetup && (
                <div className="two-factor-setup">
                  <div className="setup-steps">
                    <div className="setup-step">
                      <h4>Step 1: Install Authenticator App</h4>
                      <p>
                        Download and install an authenticator app like Google Authenticator or Authy on your mobile
                        device.
                      </p>
                    </div>

                    <div className="setup-step">
                      <h4>Step 2: Scan QR Code</h4>
                      <div className="qr-code">
<img
  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HelloWorld"
  alt="QR Code"
/>

                      </div>
                      <p>
                        Or enter this code manually: <code>JBSWY3DPEHPK3PXP</code>
                      </p>
                    </div>

                    <div className="setup-step">
                      <h4>Step 3: Enter Verification Code</h4>
                      <div className="otp-input">
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          className="form-input"
                          maxLength="6"
                        />
                        <Button variant="primary" onClick={handleTwoFactorEnable} disabled={otpCode.length !== 6}>
                          Verify & Enable
                        </Button>
                      </div>
                    </div>

                    <div className="setup-step">
                      <h4>Backup Codes</h4>
                      <p>
                        Save these backup codes in a safe place. You can use them to access your account if you lose
                        your phone.
                      </p>
                      <div className="backup-codes">
                        {backupCodes.map((code, index) => (
                          <code key={index}>{code}</code>
                        ))}
                      </div>
                      <Button variant="outline" size="small">
                        Download Codes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Active Sessions */}
        <Card>
          <Card.Header>
            <h2>
              <Shield size={20} />
              Active Sessions
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="sessions-list">
              {activeSessions.map((session) => (
                <div key={session.id} className="session-item">
                  <div className="session-info">
                    <div className="session-device">
                      <strong>{session.device}</strong>
                      {session.current && <span className="current-session">Current Session</span>}
                    </div>
                    <div className="session-details">
                      <span>{session.location}</span>
                      <span>•</span>
                      <span>{session.ip}</span>
                      <span>•</span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="small" onClick={() => revokeSession(session.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="sessions-actions">
              <Button variant="danger">Revoke All Other Sessions</Button>
            </div>
          </Card.Body>
        </Card>

        {/* Login History */}
        <Card>
          <Card.Header>
            <h2>Login History</h2>
          </Card.Header>
          <Card.Body>
            <div className="login-history">
              {loginHistory.map((login) => (
                <div key={login.id} className="login-item">
                  <div className="login-status">
                    <div className={`status-indicator status-indicator--${login.status}`}>
                      {login.status === "success" ? <Check size={14} /> : <X size={14} />}
                    </div>
                  </div>
                  <div className="login-info">
                    <div className="login-timestamp">{new Date(login.timestamp).toLocaleString()}</div>
                    <div className="login-details">
                      <span>{login.device}</span>
                      <span>•</span>
                      <span>{login.location}</span>
                      <span>•</span>
                      <span>{login.ip}</span>
                    </div>
                  </div>
                  <div className="login-status-text">
                    <span className={`status-text status-text--${login.status}`}>
                      {login.status === "success" ? "Successful" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Security Recommendations */}
        <Card>
          <Card.Header>
            <h2>
              <AlertTriangle size={20} />
              Security Recommendations
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="security-recommendations">
              <div className="recommendation-item">
                <div className="recommendation-icon">
                  <Smartphone size={20} />
                </div>
                <div className="recommendation-content">
                  <h4>Enable Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account by enabling 2FA.</p>
                </div>
                <div className="recommendation-action">
                  {!twoFactorEnabled && (
                    <Button variant="primary" size="small" onClick={handleTwoFactorSetup}>
                      Enable
                    </Button>
                  )}
                  {twoFactorEnabled && (
                    <span className="recommendation-completed">
                      <Check size={16} /> Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="recommendation-item">
                <div className="recommendation-icon">
                  <Key size={20} />
                </div>
                <div className="recommendation-content">
                  <h4>Use a Strong Password</h4>
                  <p>
                    Make sure your password is at least 12 characters long and includes mixed case letters, numbers, and
                    symbols.
                  </p>
                </div>
                <div className="recommendation-action">
                  <Button variant="outline" size="small">
                    Check Password
                  </Button>
                </div>
              </div>

              <div className="recommendation-item">
                <div className="recommendation-icon">
                  <Shield size={20} />
                </div>
                <div className="recommendation-content">
                  <h4>Review Login Activity</h4>
                  <p>Regularly check your login history for any suspicious activity.</p>
                </div>
                <div className="recommendation-action">
                  <span className="recommendation-completed">
                    <Check size={16} /> Up to date
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Security
