"use client"

import { useState } from "react"
import { Save, X, Eye, Type, ImageIcon, Link, Bold, Italic, List } from "lucide-react"
import Button from "../../../components/UI/Button/Button"
import Card from "../../../components/UI/Card/Card"

const EmailEditor = ({ email, onSave, onCancel }) => {
  const [emailData, setEmailData] = useState({
    subject: email?.subject || "",
    content: email?.content || "",
    delay: email?.delay || 0,
    delayUnit: email?.delayUnit || "days",
    ...email,
  })

  const [showPreview, setShowPreview] = useState(false)

  const handleSave = () => {
    onSave(emailData)
  }

  const insertVariable = (variable) => {
    const textarea = document.getElementById("email-content")
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = emailData.content
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)

    setEmailData({
      ...emailData,
      content: before + variable + after,
    })
  }

  const variables = [
    { name: "First Name", value: "{{firstName}}" },
    { name: "Last Name", value: "{{lastName}}" },
    { name: "Company", value: "{{company}}" },
    { name: "Email", value: "{{email}}" },
    { name: "Custom Field 1", value: "{{custom1}}" },
    { name: "Custom Field 2", value: "{{custom2}}" },
  ]

  return (
    <div className="email-editor">
      <div className="email-editor__header">
        <h3>Email Editor</h3>
        <div className="email-editor__actions">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={16} />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X size={16} />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save size={16} />
            Save Email
          </Button>
        </div>
      </div>

      <div className="email-editor__content">
        {!showPreview ? (
          <div className="email-editor__form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email-subject">Subject Line</label>
                <input
                  type="text"
                  id="email-subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="form-input"
                  placeholder="Enter email subject..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-delay">Send Delay</label>
                <div className="delay-inputs">
                  <input
                    type="number"
                    id="email-delay"
                    value={emailData.delay}
                    onChange={(e) => setEmailData({ ...emailData, delay: Number.parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                    style={{ width: "80px" }}
                  />
                  <select
                    value={emailData.delayUnit}
                    onChange={(e) => setEmailData({ ...emailData, delayUnit: e.target.value })}
                    className="form-select"
                    style={{ width: "100px" }}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email-content">Email Content</label>
              <div className="content-editor">
                <div className="editor-toolbar">
                  <button type="button" className="toolbar-btn">
                    <Bold size={16} />
                  </button>
                  <button type="button" className="toolbar-btn">
                    <Italic size={16} />
                  </button>
                  <button type="button" className="toolbar-btn">
                    <List size={16} />
                  </button>
                  <button type="button" className="toolbar-btn">
                    <Link size={16} />
                  </button>
                  <button type="button" className="toolbar-btn">
                    <ImageIcon size={16} />
                  </button>
                </div>
                <textarea
                  id="email-content"
                  value={emailData.content}
                  onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                  className="form-textarea"
                  rows="12"
                  placeholder="Write your email content here..."
                />
              </div>
            </div>

            <div className="email-variables">
              <h4>
                <Type size={16} />
                Personalization Variables
              </h4>
              <p>Click to insert variables into your email content:</p>
              <div className="variable-tags">
                {variables.map((variable, index) => (
                  <button
                    key={index}
                    type="button"
                    className="variable-tag"
                    onClick={() => insertVariable(variable.value)}
                  >
                    {variable.value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="email-preview">
            <Card>
              <Card.Header>
                <h4>Email Preview</h4>
              </Card.Header>
              <Card.Body>
                <div className="preview-email">
                  <div className="preview-email__subject">
                    <strong>Subject:</strong> {emailData.subject || "No subject"}
                  </div>
                  <div className="preview-email__content">
                    {emailData.content ? (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {emailData.content
                          .replace(/{{firstName}}/g, "John")
                          .replace(/{{lastName}}/g, "Doe")
                          .replace(/{{company}}/g, "Acme Corp")
                          .replace(/{{email}}/g, "john@example.com")
                          .replace(/{{custom1}}/g, "Custom Value 1")
                          .replace(/{{custom2}}/g, "Custom Value 2")}
                      </div>
                    ) : (
                      <em>No content</em>
                    )}
                  </div>
                  {emailData.delay > 0 && (
                    <div className="preview-email__delay">
                      <strong>Delay:</strong> Send after {emailData.delay} {emailData.delayUnit}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailEditor
