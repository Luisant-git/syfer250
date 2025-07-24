"use client"

import { useState } from "react"
import { Save, Bell, Mail, Shield, Database, Palette, Globe } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
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

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
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
            <Card>
              <Card.Header>
                <h2>Security Settings</h2>
                <p>Manage your account security preferences</p>
              </Card.Header>
              <Card.Body>
                <div className="security-settings">
                  <div className="security-group">
                    <h3>Authentication</h3>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorEnabled}
                          onChange={(e) => handleSettingChange("twoFactorEnabled", e.target.checked)}
                        />
                        <span>Enable Two-Factor Authentication</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.ipWhitelisting}
                          onChange={(e) => handleSettingChange("ipWhitelisting", e.target.checked)}
                        />
                        <span>Enable IP Whitelisting</span>
                      </label>
                    </div>
                  </div>

                  <div className="security-actions">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Download Security Log</Button>
                    <Button variant="danger">Revoke All Sessions</Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
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
                  <h3>API Keys</h3>
                  <div className="api-key-item">
                    <div className="api-key-info">
                      <strong>Production Key</strong>
                      <code>sk_prod_••••••••••••••••••••••••••••••••</code>
                    </div>
                    <div className="api-key-actions">
                      <Button variant="outline" size="small">
                        Regenerate
                      </Button>
                      <Button variant="ghost" size="small">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="api-key-item">
                    <div className="api-key-info">
                      <strong>Test Key</strong>
                      <code>sk_test_••••••••••••••••••••••••••••••••</code>
                    </div>
                    <div className="api-key-actions">
                      <Button variant="outline" size="small">
                        Regenerate
                      </Button>
                      <Button variant="ghost" size="small">
                        Copy
                      </Button>
                    </div>
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
    </div>
  )
}

export default Settings
