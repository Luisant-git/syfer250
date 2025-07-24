"use client"

import { useState } from "react"
import { Plus, Mail, Search, Filter, Archive, Trash2, Reply, Forward, Star } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import "./MasterInbox.scss"


const MasterInbox = () => {
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConnectModal, setShowConnectModal] = useState(false)

  const emailAccounts = [
    {
      id: "gmail-1",
      email: "john@company.com",
      provider: "Gmail",
      status: "connected",
      unreadCount: 12,
      avatar: "JD",
    },
    {
      id: "outlook-1",
      email: "marketing@company.com",
      provider: "Outlook",
      status: "connected",
      unreadCount: 5,
      avatar: "MC",
    },
    {
      id: "smtp-1",
      email: "support@company.com",
      provider: "SMTP",
      status: "connected",
      unreadCount: 8,
      avatar: "SC",
    },
  ]

  const emails = [
    {
      id: 1,
      from: "alice@example.com",
      fromName: "Alice Johnson",
      subject: "Re: Product Demo Request",
      preview: "Thank you for the demo. I have a few questions about the pricing...",
      time: "2 hours ago",
      isRead: false,
      isStarred: true,
      account: "gmail-1",
      labels: ["Important", "Follow-up"],
    },
    {
      id: 2,
      from: "bob@startup.com",
      fromName: "Bob Smith",
      subject: "Partnership Opportunity",
      preview: "Hi there, I came across your company and would love to discuss...",
      time: "4 hours ago",
      isRead: true,
      isStarred: false,
      account: "outlook-1",
      labels: ["Business"],
    },
    {
      id: 3,
      from: "sarah@techcorp.com",
      fromName: "Sarah Wilson",
      subject: "Meeting Follow-up",
      preview: "Great meeting today! As discussed, here are the next steps...",
      time: "1 day ago",
      isRead: false,
      isStarred: false,
      account: "gmail-1",
      labels: ["Meeting"],
    },
    {
      id: 4,
      from: "mike@agency.com",
      fromName: "Mike Davis",
      subject: "Campaign Results",
      preview: "The latest campaign performed exceptionally well. Here are the metrics...",
      time: "2 days ago",
      isRead: true,
      isStarred: true,
      account: "smtp-1",
      labels: ["Reports"],
    },
  ]

  const filteredEmails = emails.filter((email) => {
    const matchesAccount = selectedAccount === "all" || email.account === selectedAccount
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAccount && matchesSearch
  })

  const getAccountById = (id) => emailAccounts.find((acc) => acc.id === id)

  return (
    <div className="master-inbox">
      <div className="inbox-header">
        <h1>Master Inbox</h1>
        <Button variant="primary" onClick={() => setShowConnectModal(true)}>
          <Plus size={16} />
          Connect Email Account
        </Button>
      </div>

      <div className="inbox-layout">
        {/* Sidebar - Email Accounts */}
        <div className="inbox-sidebar">
          <Card>
            <Card.Header>
              <h3>Email Accounts</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="account-list">
                <div
                  className={`account-item ${selectedAccount === "all" ? "account-item--active" : ""}`}
                  onClick={() => setSelectedAccount("all")}
                >
                  <div className="account-item__avatar">
                    <Mail size={16} />
                  </div>
                  <div className="account-item__info">
                    <div className="account-item__name">All Accounts</div>
                    <div className="account-item__count">
                      {emailAccounts.reduce((sum, acc) => sum + acc.unreadCount, 0)} unread
                    </div>
                  </div>
                </div>

                {emailAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`account-item ${selectedAccount === account.id ? "account-item--active" : ""}`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <div className="account-item__avatar">{account.avatar}</div>
                    <div className="account-item__info">
                      <div className="account-item__name">{account.email}</div>
                      <div className="account-item__provider">{account.provider}</div>
                    </div>
                    {account.unreadCount > 0 && <div className="account-item__badge">{account.unreadCount}</div>}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Main Content */}
        <div className="inbox-main">
          {/* Search and Filters */}
          <Card className="inbox-controls">
            <Card.Body>
              <div className="controls-row">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="control-buttons">
                  <Button variant="outline" size="small">
                    <Filter size={16} />
                    Filters
                  </Button>
                  <Button variant="outline" size="small">
                    <Archive size={16} />
                    Archive
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Email List */}
          <Card className="email-list-card">
            <Card.Body className="p-0">
              <div className="email-list">
                {filteredEmails.length === 0 ? (
                  <div className="empty-state">
                    <Mail size={48} />
                    <h3>No emails found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`email-item ${!email.isRead ? "email-item--unread" : ""} ${selectedEmail?.id === email.id ? "email-item--selected" : ""}`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="email-item__avatar">
                        {email.fromName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="email-item__content">
                        <div className="email-item__header">
                          <div className="email-item__from">
                            <span className="email-item__name">{email.fromName}</span>
                            <span className="email-item__email">{email.from}</span>
                          </div>
                          <div className="email-item__meta">
                            {email.isStarred && <Star size={14} className="star-icon" />}
                            <span className="email-item__time">{email.time}</span>
                          </div>
                        </div>
                        <div className="email-item__subject">{email.subject}</div>
                        <div className="email-item__preview">{email.preview}</div>
                        <div className="email-item__labels">
                          {email.labels.map((label) => (
                            <span key={label} className="email-label">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Email Detail Panel */}
        {selectedEmail && (
          <div className="inbox-detail">
            <Card className="email-detail">
              <Card.Header>
                <div className="email-detail__header">
                  <div className="email-detail__info">
                    <h3>{selectedEmail.subject}</h3>
                    <div className="email-detail__meta">
                      <span>
                        {selectedEmail.fromName} &lt;{selectedEmail.from}&gt;
                      </span>
                      <span>to {getAccountById(selectedEmail.account)?.email}</span>
                      <span>{selectedEmail.time}</span>
                    </div>
                  </div>
                  <div className="email-detail__actions">
                    <Button variant="ghost" size="small">
                      <Reply size={16} />
                    </Button>
                    <Button variant="ghost" size="small">
                      <Forward size={16} />
                    </Button>
                    <Button variant="ghost" size="small">
                      <Archive size={16} />
                    </Button>
                    <Button variant="ghost" size="small">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="email-content">
                  <p>Hi there,</p>
                  <p>{selectedEmail.preview}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <p>
                    Best regards,
                    <br />
                    {selectedEmail.fromName}
                  </p>
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="reply-actions">
                  <Button variant="primary">
                    <Reply size={16} />
                    Reply
                  </Button>
                  <Button variant="outline">
                    <Forward size={16} />
                    Forward
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </div>
        )}
      </div>

      {/* Connect Email Modal */}
      {showConnectModal && (
        <div className="connect-modal">
          <div className="connect-modal__backdrop" onClick={() => setShowConnectModal(false)} />
          <div className="connect-modal__content">
            <div className="connect-modal__header">
              <h3>Connect Your Email Account</h3>
              <Button variant="ghost" onClick={() => setShowConnectModal(false)}>
                ×
              </Button>
            </div>
            <div className="connect-modal__body">
              <div className="connect-options">
                <div className="connect-option">
                  <div className="connect-option__icon">
                    <img src="/placeholder.svg?height=40&width=40&text=G" alt="Google" />
                  </div>
                  <div className="connect-option__info">
                    <h4>Google / Gmail</h4>
                    <p>Connect your Gmail account with OAuth</p>
                  </div>
                  <Button variant="primary">Connect</Button>
                </div>

                <div className="connect-option">
                  <div className="connect-option__icon">
                    <img src="/placeholder.svg?height=40&width=40&text=O" alt="Outlook" />
                  </div>
                  <div className="connect-option__info">
                    <h4>Microsoft Outlook</h4>
                    <p>Connect your Outlook account with OAuth</p>
                  </div>
                  <Button variant="primary">Connect</Button>
                </div>

                <div className="connect-option">
                  <div className="connect-option__icon">
                    <Mail size={24} />
                  </div>
                  <div className="connect-option__info">
                    <h4>SMTP Server</h4>
                    <p>Connect using SMTP configuration</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MasterInbox
