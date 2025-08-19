"use client"

import { useState } from "react"
import { Mail, Plus, Check } from "lucide-react"
import Button from "../../../components/UI/Button/Button"
import Card from "../../../components/UI/Card/Card"

const SelectSender = ({ data = {}, onUpdate = () => {} }) => {
  const [selectedAccount, setSelectedAccount] = useState(data?.selectedAccount || "")

  const emailAccounts = [
    {
      id: "gmail-1",
      email: "john@company.com",
      provider: "Gmail",
      status: "connected",
      dailyLimit: 200,
      sent: 45,
    },
    {
      id: "outlook-1",
      email: "marketing@company.com",
      provider: "Outlook",
      status: "connected",
      dailyLimit: 300,
      sent: 120,
    },
    {
      id: "smtp-1",
      email: "support@company.com",
      provider: "SMTP",
      status: "connected",
      dailyLimit: 500,
      sent: 78,
    },
  ]
  const handleAccountSelect = (accountId) => {
    setSelectedAccount(accountId)
    onUpdate({ selectedAccount: accountId })
  }

  return (
    <div className="select-sender">
      <div className="step-header">
        <h2>Select Sender Email Account</h2>
        <p>Choose which email account to send your campaign from</p>
      </div>

      <div className="sender-accounts">
        {emailAccounts.map((account) => (
          <Card
            key={account.id}
            className={`sender-account ${selectedAccount === account.id ? "sender-account--selected" : ""}`}
            onClick={() => handleAccountSelect(account.id)}
          >
            <Card.Body>
              <div className="sender-account__content">
                <div className="sender-account__info">
                  <div className="sender-account__header">
                    <Mail size={20} />
                    <div>
                      <h4>{account.email}</h4>
                      <span className="sender-account__provider">{account.provider}</span>
                    </div>
                  </div>
                  <div className="sender-account__stats">
                    <div className="stat">
                      <span className="stat__label">Daily Limit:</span>
                      <span className="stat__value">{account.dailyLimit}</span>
                    </div>
                    <div className="stat">
                      <span className="stat__label">Sent Today:</span>
                      <span className="stat__value">{account.sent}</span>
                    </div>
                    <div className="stat">
                      <span className="stat__label">Remaining:</span>
                      <span className="stat__value">{account.dailyLimit - account.sent}</span>
                    </div>
                  </div>
                </div>
                <div className="sender-account__selection">
                  {selectedAccount === account.id && (
                    <div className="selection-indicator">
                      <Check size={20} />
                    </div>
                  )}
                </div>
              </div>
              <div className="sender-account__progress">
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${(account.sent / account.dailyLimit) * 100}%` }}
                  />
                </div>
                <span className="progress-text">
                  {Math.round((account.sent / account.dailyLimit) * 100)}% of daily limit used
                </span>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Card className="add-account-card">
        <Card.Body className="text-center">
          <Plus size={48} className="text-muted mb-3" />
          <h4>Need another email account?</h4>
          <p className="text-secondary mb-3">Connect additional email accounts to increase your sending capacity</p>
          <Button variant="outline">
            <Plus size={16} />
            Add Email Account
          </Button>
        </Card.Body>
      </Card>

      {selectedAccount && (
        <Card className="sender-settings">
          <Card.Header>
            <h3>Sender Settings</h3>
          </Card.Header>
          <Card.Body>
            <div className="form-group">
              <label htmlFor="from-name">From Name</label>
              <input type="text" id="from-name" placeholder="Your Name or Company" className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="reply-to">Reply-To Email (Optional)</label>
              <input type="email" id="reply-to" placeholder="reply@company.com" className="form-input" />
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" />
                Track email opens
              </label>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" />
                Track link clicks
              </label>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default SelectSender
