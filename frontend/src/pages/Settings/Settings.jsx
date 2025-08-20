"use client"

import { useState, useEffect } from "react"
import {
  Save,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
  Globe,
  Key,
  Copy,
  RefreshCw,
  Check,
  AlertCircle
} from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import Security from "../Security/Security"
import apiService from "../../services/api"
import useToast from "../../hooks/useToast"
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer"
import "./Settings.scss"

const Settings = () => {
  const [settings, setSettings] = useState({
    // Email Settings
    defaultSendingLimit: 100,
    emailTrackingEnabled: true,
    autoUnsubscribeEnabled: true,
    bounceHandlingEnabled: true,

    // Notification Settings
    emailNotifications: true,
    campaignAlerts: true,
    weeklyReports: true,
    systemUpdates: false,

    // Security Settings
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelisting: false,

    // General Settings
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    language: "en",
    theme: "light",

    // API Settings
    webhookUrl: "",
    apiRateLimit: 1000,
    enableApiLogging: true,
  })

  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState({
    production: 'sk_prod_••••••••••••••••••••••••••••••••',
    test: 'sk_test_••••••••••••••••••••••••••••••••'
  })
  const [copiedKey, setCopiedKey] = useState('')
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await apiService.getUserProfile()
      if (response.success) {
        const userData = response.data
        setSettings(prev => ({
          ...prev,
          timezone: userData.timezone || 'UTC',
          // Map other user data to settings
        }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      showError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save user profile settings
      const profileData = {
        timezone: settings.timezone
      }
      
      const response = await apiService.updateUserProfile(profileData)
      if (response.success) {
        showSuccess('Settings saved successfully!')
      } else {
        showError('Failed to save settings')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      showError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const generateApiKey = async (type) => {
    try {
      // Simulate API key generation
      const newKey = `sk_${type}_${Math.random().toString(36).substring(2, 34)}`
      setApiKeys(prev => ({ ...prev, [type]: newKey }))
      showSuccess(`${type} API key regenerated successfully`)
    } catch (error) {
      showError('Failed to regenerate API key')
    }
  }

  const copyToClipboard = async (text, keyType) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyType)
      showSuccess('API key copied to clipboard')
      setTimeout(() => setCopiedKey(''), 2000)
    } catch (error) {
      showError('Failed to copy API key')
    }
  }

  if (loading) {
    return (
      <div className="settings" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "email", label: "Email", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API", icon: Database },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ]

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
  ]

  return (
    <div className="settings">
      <div className="settings__header">
        <h1>Settings</h1>
        <Button variant="primary" onClick={handleSave} loading={isSaving}>
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      <div className="settings__layout">
        {/* Settings Navigation */}
        <div className="settings__nav">
          <Card>
            <Card.Body className="p-0">
              <nav className="settings-nav">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`settings-nav__item ${activeTab === tab.id ? "settings-nav__item--active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card.Body>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="settings__content">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <Card.Header>
                <h2>General Settings</h2>
                <p>Configure your basic application preferences</p>
              </Card.Header>
              <Card.Body>
                <div className="settings-grid">
                  <div className="form-group">
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange("timezone", e.target.value)}
                      className="form-select"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateFormat">Date Format</label>
                    <select
                      id="dateFormat"
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                      className="form-select"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select
                      id="language"
                      value={settings.language}
                      onChange={(e) => handleSettingChange("language", e.target.value)}
                      className="form-select"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
                      className="form-input"
                      min="5"
                      max="480"
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <Card>
              <Card.Header>
                <h2>Email Settings</h2>
                <p>Configure your email sending and tracking preferences</p>
              </Card.Header>
              <Card.Body>
                <div className="settings-grid">
                  <div className="form-group">
                    <label htmlFor="sendingLimit">Default Daily Sending Limit</label>
                    <input
                      type="number"
                      id="sendingLimit"
                      value={settings.defaultSendingLimit}
                      onChange={(e) => handleSettingChange("defaultSendingLimit", Number.parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                      max="10000"
                    />
                    <small className="form-help">Maximum emails per day for new campaigns</small>
                  </div>

                  <div className="form-group">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.emailTrackingEnabled}
                          onChange={(e) => handleSettingChange("emailTrackingEnabled", e.target.checked)}
                        />
                        <span>Enable email tracking by default</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.autoUnsubscribeEnabled}
                          onChange={(e) => handleSettingChange("autoUnsubscribeEnabled", e.target.checked)}
                        />
                        <span>Auto-handle unsubscribe requests</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.bounceHandlingEnabled}
                          onChange={(e) => handleSettingChange("bounceHandlingEnabled", e.target.checked)}
                        />
                        <span>Automatic bounce handling</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card>
              <Card.Header>
                <h2>Notification Settings</h2>
                <p>Choose what notifications you want to receive</p>
              </Card.Header>
              <Card.Body>
                <div className="notification-settings">
                  <div className="notification-group">
                    <h3>Email Notifications</h3>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                        />
                        <span>General email notifications</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.campaignAlerts}
                          onChange={(e) => handleSettingChange("campaignAlerts", e.target.checked)}
                        />
                        <span>Campaign status alerts</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.weeklyReports}
                          onChange={(e) => handleSettingChange("weeklyReports", e.target.checked)}
                        />
                        <span>Weekly performance reports</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.systemUpdates}
                          onChange={(e) => handleSettingChange("systemUpdates", e.target.checked)}
                        />
                        <span>System updates and maintenance</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Security />
          )}

          {/* API Settings */}
          {activeTab === "api" && (
            <Card>
              <Card.Header>
                <h2>API Settings</h2>
                <p>Configure API access and webhooks</p>
              </Card.Header>
              <Card.Body>
                <div className="settings-grid">
                  <div className="form-group">
                    <label htmlFor="webhookUrl">Webhook URL</label>
                    <input
                      type="url"
                      id="webhookUrl"
                      value={settings.webhookUrl}
                      onChange={(e) => handleSettingChange("webhookUrl", e.target.value)}
                      className="form-input"
                      placeholder="https://your-domain.com/webhook"
                    />
                    <small className="form-help">URL to receive campaign event notifications</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</label>
                    <input
                      type="number"
                      id="apiRateLimit"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleSettingChange("apiRateLimit", Number.parseInt(e.target.value))}
                      className="form-input"
                      min="100"
                      max="10000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.enableApiLogging}
                        onChange={(e) => handleSettingChange("enableApiLogging", e.target.checked)}
                      />
                      <span>Enable API request logging</span>
                    </label>
                  </div>
                </div>

                <div className="api-keys">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Key size={20} />
                    API Keys
                  </h3>
                  <div className="api-key-item" style={{ padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div className="api-key-info" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#dc3545' }}>Production Key</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <code style={{ flex: 1, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.9rem' }}>
                          {apiKeys.production}
                        </code>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button 
                            variant="outline" 
                            size="small" 
                            onClick={() => generateApiKey('production')}
                            title="Regenerate Key"
                          >
                            <RefreshCw size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="small" 
                            onClick={() => copyToClipboard(apiKeys.production, 'production')}
                            title="Copy Key"
                          >
                            {copiedKey === 'production' ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <small style={{ color: '#666', fontSize: '0.8rem' }}>Use this key for production environments. Keep it secure!</small>
                  </div>
                  
                  <div className="api-key-item" style={{ padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                    <div className="api-key-info" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#28a745' }}>Test Key</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <code style={{ flex: 1, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.9rem' }}>
                          {apiKeys.test}
                        </code>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button 
                            variant="outline" 
                            size="small" 
                            onClick={() => generateApiKey('test')}
                            title="Regenerate Key"
                          >
                            <RefreshCw size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="small" 
                            onClick={() => copyToClipboard(apiKeys.test, 'test')}
                            title="Copy Key"
                          >
                            {copiedKey === 'test' ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <small style={{ color: '#666', fontSize: '0.8rem' }}>Use this key for testing and development.</small>
                  </div>
                  
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertCircle size={16} color="#856404" />
                      <strong style={{ color: '#856404' }}>Important</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1rem', color: '#856404', fontSize: '0.9rem' }}>
                      <li>Store API keys securely and never expose them in client-side code</li>
                      <li>Regenerate keys immediately if you suspect they've been compromised</li>
                      <li>Use test keys for development and production keys for live campaigns</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <Card>
              <Card.Header>
                <h2>Appearance Settings</h2>
                <p>Customize the look and feel of your dashboard</p>
              </Card.Header>
              <Card.Body>
                <div className="appearance-settings">
                  <div className="form-group">
                    <label>Theme</label>
                    <div className="theme-options">
                      <label className="theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={settings.theme === "light"}
                          onChange={(e) => handleSettingChange("theme", e.target.value)}
                        />
                        <div className="theme-preview theme-preview--light">
                          <div className="theme-preview__header"></div>
                          <div className="theme-preview__content">
                            <div className="theme-preview__sidebar"></div>
                            <div className="theme-preview__main"></div>
                          </div>
                        </div>
                        <span>Light</span>
                      </label>

                      <label className="theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={settings.theme === "dark"}
                          onChange={(e) => handleSettingChange("theme", e.target.value)}
                        />
                        <div className="theme-preview theme-preview--dark">
                          <div className="theme-preview__header"></div>
                          <div className="theme-preview__content">
                            <div className="theme-preview__sidebar"></div>
                            <div className="theme-preview__main"></div>
                          </div>
                        </div>
                        <span>Dark</span>
                      </label>

                      <label className="theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value="auto"
                          checked={settings.theme === "auto"}
                          onChange={(e) => handleSettingChange("theme", e.target.value)}
                        />
                        <div className="theme-preview theme-preview--auto">
                          <div className="theme-preview__header"></div>
                          <div className="theme-preview__content">
                            <div className="theme-preview__sidebar"></div>
                            <div className="theme-preview__main"></div>
                          </div>
                        </div>
                        <span>Auto</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .api-key-item {
          transition: all 0.2s ease;
        }
        
        .api-key-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .settings__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .settings__layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
        }
        
        .settings-nav__item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
          margin-bottom: 0.25rem;
        }
        
        .settings-nav__item:hover {
          background-color: #f8f9fa;
        }
        
        .settings-nav__item--active {
          background-color: #e3f2fd;
          color: #1976d2;
          font-weight: 500;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        
        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }
        
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-help {
          color: #6b7280;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }
        
        @media (max-width: 768px) {
          .settings__layout {
            grid-template-columns: 1fr;
          }
          
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Settings