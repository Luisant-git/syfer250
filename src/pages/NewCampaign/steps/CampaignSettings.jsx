"use client"

import { useState } from "react"
import { Settings, Eye, Play } from "lucide-react"
import Button from "../../../components/UI/Button/Button"
import Card from "../../../components/UI/Card/Card"

const CampaignSettings = ({ data, onUpdate, campaignData }) => {
  const [campaignName, setCampaignName] = useState(data.campaignName || "")
  const [description, setDescription] = useState(data.description || "")
  const [trackOpens, setTrackOpens] = useState(data.trackOpens !== false)
  const [trackClicks, setTrackClicks] = useState(data.trackClicks !== false)
  const [unsubscribeLink, setUnsubscribeLink] = useState(data.unsubscribeLink !== false)
  const [showPreview, setShowPreview] = useState(false)

  const updateData = (updates) => {
    onUpdate({
      campaignName,
      description,
      trackOpens,
      trackClicks,
      unsubscribeLink,
      ...updates,
    })
  }

  const getCampaignSummary = () => {
    const importData = campaignData.import || {}
    const sequences = campaignData.sequences?.sequences || []
    const sender = campaignData.sender || {}
    const schedule = campaignData.schedule || {}

    return {
      contactsCount: importData.file ? "1,247" : "0",
      emailsCount: sequences.length,
      senderEmail: sender.selectedAccount ? "john@company.com" : "Not selected",
      startTime: schedule.scheduleType === "immediate" ? "Immediately" : `${schedule.startDate} ${schedule.startTime}`,
      dailyLimit: schedule.emailsPerDay || 50,
    }
  }

  const summary = getCampaignSummary()

  return (
    <div className="campaign-settings">
      <div className="step-header">
        <h2>Campaign Settings</h2>
        <p>Review your campaign settings and start sending</p>
      </div>

      <div className="settings-grid">
        {/* Campaign Details */}
        <Card>
          <Card.Header>
            <h3>
              <Settings size={20} /> Campaign Details
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="form-group">
              <label htmlFor="campaign-name">Campaign Name *</label>
              <input
                type="text"
                id="campaign-name"
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value)
                  updateData({ campaignName: e.target.value })
                }}
                placeholder="Enter campaign name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  updateData({ description: e.target.value })
                }}
                placeholder="Brief description of this campaign"
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group">
              <h4>Tracking Options</h4>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={trackOpens}
                    onChange={(e) => {
                      setTrackOpens(e.target.checked)
                      updateData({ trackOpens: e.target.checked })
                    }}
                  />
                  Track email opens
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={trackClicks}
                    onChange={(e) => {
                      setTrackClicks(e.target.checked)
                      updateData({ trackClicks: e.target.checked })
                    }}
                  />
                  Track link clicks
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={unsubscribeLink}
                    onChange={(e) => {
                      setUnsubscribeLink(e.target.checked)
                      updateData({ unsubscribeLink: e.target.checked })
                    }}
                  />
                  Include unsubscribe link
                </label>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Campaign Summary */}
        <Card>
          <Card.Header>
            <h3>
              <Eye size={20} /> Campaign Summary
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="summary-stat__value">{summary.contactsCount}</div>
                <div className="summary-stat__label">Contacts</div>
              </div>
              <div className="summary-stat">
                <div className="summary-stat__value">{summary.emailsCount}</div>
                <div className="summary-stat__label">Emails in Sequence</div>
              </div>
              <div className="summary-stat">
                <div className="summary-stat__value">{summary.dailyLimit}</div>
                <div className="summary-stat__label">Daily Limit</div>
              </div>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-label">Sender:</span>
                <span className="summary-value">{summary.senderEmail}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Start Time:</span>
                <span className="summary-value">{summary.startTime}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Tracking:</span>
                <span className="summary-value">
                  {[trackOpens && "Opens", trackClicks && "Clicks", unsubscribeLink && "Unsubscribe"]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-100 mt-3 bg-transparent" onClick={() => setShowPreview(true)}>
              <Eye size={16} />
              Preview Campaign
            </Button>
          </Card.Body>
        </Card>
      </div>

      {/* Final Actions */}
      <Card className="final-actions">
        <Card.Body>
          <div className="final-actions__content">
            <div className="final-actions__info">
              <h3>Ready to Launch?</h3>
              <p>
                Your campaign is configured and ready to start. Click "Start Campaign" to begin sending emails to your
                contacts.
              </p>
            </div>
            <div className="final-actions__buttons">
              <Button variant="outline" size="large">
                Save as Draft
              </Button>
              <Button variant="success" size="large" disabled={!campaignName.trim()}>
                <Play size={20} />
                Start Campaign
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-modal__backdrop" onClick={() => setShowPreview(false)} />
          <div className="preview-modal__content preview-modal__content--large">
            <div className="preview-modal__header">
              <h3>Campaign Preview</h3>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                ×
              </Button>
            </div>
            <div className="preview-modal__body">
              <div className="campaign-preview">
                <div className="preview-section">
                  <h4>Campaign Details</h4>
                  <div className="preview-grid">
                    <div>
                      <strong>Name:</strong> {campaignName || "Untitled Campaign"}
                    </div>
                    <div>
                      <strong>Description:</strong> {description || "No description"}
                    </div>
                    <div>
                      <strong>Contacts:</strong> {summary.contactsCount}
                    </div>
                    <div>
                      <strong>Emails:</strong> {summary.emailsCount}
                    </div>
                  </div>
                </div>

                <div className="preview-section">
                  <h4>Email Sequence</h4>
                  {campaignData.sequences?.sequences?.map((email, index) => (
                    <div key={email.id} className="preview-email">
                      <div className="preview-email__header">
                        <strong>
                          Email {index + 1}: {email.subject || "Untitled"}
                        </strong>
                        {email.delay > 0 && (
                          <span className="preview-email__delay">
                            +{email.delay} {email.delayUnit}
                          </span>
                        )}
                      </div>
                      <div className="preview-email__content">
                        {email.content ? (
                          <div dangerouslySetInnerHTML={{ __html: email.content.substring(0, 200) + "..." }} />
                        ) : (
                          <em>No content</em>
                        )}
                      </div>
                    </div>
                  )) || <em>No emails in sequence</em>}
                </div>

                <div className="preview-section">
                  <h4>Schedule & Settings</h4>
                  <div className="preview-grid">
                    <div>
                      <strong>Start:</strong> {summary.startTime}
                    </div>
                    <div>
                      <strong>Daily Limit:</strong> {summary.dailyLimit}
                    </div>
                    <div>
                      <strong>Sender:</strong> {summary.senderEmail}
                    </div>
                    <div>
                      <strong>Tracking:</strong>{" "}
                      {[trackOpens && "Opens", trackClicks && "Clicks", unsubscribeLink && "Unsubscribe"]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignSettings
