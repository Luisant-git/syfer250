"use client"

import { useState } from "react"
import { Plus, Mail, Eye, Edit, Trash2 } from "lucide-react"
import Button from "../../../components/UI/Button/Button"
import Card from "../../../components/UI/Card/Card"
import EmailEditor from "./EmailEditor" // Import EmailEditor component

const EmailSequences = ({ data = {}, onUpdate = () => {} }) => {
  const [sequences, setSequences] = useState(data?.sequences || [])
  const [showEditor, setShowEditor] = useState(false)
  const [currentEmail, setCurrentEmail] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const addNewEmail = () => {
    const newEmail = {
      id: Date.now(),
      subject: "",
      content: "",
      delay: 0,
      delayUnit: "days",
    }
    setCurrentEmail(newEmail)
    setShowEditor(true)
  }

  const saveEmail = (emailData) => {
    if (currentEmail.id) {
      // Update existing
      const updatedSequences = sequences.map((seq) =>
        seq.id === currentEmail.id ? { ...currentEmail, ...emailData } : seq,
      )
      setSequences(updatedSequences)
    } else {
      // Add new
      setSequences([...sequences, { ...currentEmail, ...emailData }])
    }
    setShowEditor(false)
    setCurrentEmail(null)
    onUpdate({ sequences })
  }

  const editEmail = (email) => {
    setCurrentEmail(email)
    setShowEditor(true)
  }

  const deleteEmail = (id) => {
    const updatedSequences = sequences.filter((seq) => seq.id !== id)
    setSequences(updatedSequences)
    onUpdate({ sequences: updatedSequences })
  }

  return (
    <div className="email-sequences">
      <div className="step-header">
        <h2>Email Sequences</h2>
        <p>Create and manage your email sequence</p>
      </div>

      {!showEditor ? (
        <div>
          <div className="sequences-header">
            <h3>Email Sequence ({sequences.length} emails)</h3>
            <Button variant="primary" onClick={addNewEmail}>
              <Plus size={16} />
              Add Email
            </Button>
          </div>

          {sequences.length === 0 ? (
            <Card>
              <Card.Body className="text-center p-4">
                <Mail size={48} className="text-muted mb-3" />
                <h4>No emails in sequence</h4>
                <p className="text-secondary">Start by adding your first email to the sequence</p>
                <br />
                <Button variant="primary" onClick={addNewEmail}>
                  <Plus size={16} />
                  Add First Email
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div className="sequence-list">
              {sequences.map((email, index) => (
                <Card key={email.id} className="sequence-item">
                  <Card.Body>
                    <div className="sequence-item__header">
                      <div className="sequence-item__info">
                        <div className="sequence-item__number">Email {index + 1}</div>
                        <h4 className="sequence-item__subject">{email.subject || "Untitled Email"}</h4>
                        {email.delay > 0 && (
                          <div className="sequence-item__delay">
                            Send after {email.delay} {email.delayUnit}
                          </div>
                        )}
                      </div>
                      <div className="sequence-item__actions">
                        <Button variant="ghost" size="small" onClick={() => setShowPreview(email)}>
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => editEmail(email)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => deleteEmail(email.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="sequence-item__preview">
                      {email.content ? (
                        <div dangerouslySetInnerHTML={{ __html: email.content.substring(0, 150) + "..." }} />
                      ) : (
                        <p className="text-muted">No content added yet</p>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmailEditor
          email={currentEmail}
          onSave={saveEmail}
          onCancel={() => {
            setShowEditor(false)
            setCurrentEmail(null)
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-modal__backdrop" onClick={() => setShowPreview(false)} />
          <div className="preview-modal__content">
            <div className="preview-modal__header">
              <h3>Email Preview</h3>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                ×
              </Button>
            </div>
            <div className="preview-modal__body">
              <div className="email-preview">
                <div className="email-preview__subject">
                  <strong>Subject:</strong> {showPreview.subject}
                </div>
                <div className="email-preview__content">
                  <div dangerouslySetInnerHTML={{ __html: showPreview.content }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailSequences
