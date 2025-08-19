"use client";
import { useState } from "react";
import {
  Plus,
  Mail,
  Search,
  Filter,
  Archive,
  Trash2,
  Reply,
  Forward,
  Star,
  List,
  Grid,
} from "lucide-react";
import Button from "../../components/UI/Button/Button";
import Card from "../../components/UI/Card/Card";
import "./MasterInbox.scss";

const MasterInbox = () => {
  // First declare emails array since other variables depend on it
  const emails = [
    {
      id: 1,
      from: "alice@example.com",
      fromName: "Alice Johnson",
      subject: "Re: Product Demo Request",
      preview:
        "Thank you for the demo. I have a few questions about the pricing...",
      time: "2 hours ago",
      isRead: false,
      isStarred: true,
      account: "gmail-1",
      labels: ["Important", "Follow-up"],
      folder: "inbox",
    },
    {
      id: 2,
      from: "bob@startup.com",
      fromName: "Bob Smith",
      subject: "Partnership Opportunity",
      preview:
        "Hi there, I came across your company and would love to discuss...",
      time: "4 hours ago",
      isRead: true,
      isStarred: false,
      account: "outlook-1",
      labels: ["Business"],
      folder: "inbox",
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
      folder: "important",
    },
    {
      id: 4,
      from: "mike@agency.com",
      fromName: "Mike Davis",
      subject: "Campaign Results",
      preview:
        "The latest campaign performed exceptionally well. Here are the metrics...",
      time: "2 days ago",
      isRead: true,
      isStarred: true,
      account: "smtp-1",
      labels: ["Reports"],
      folder: "archived",
    },
  ];

  // Then declare folders which uses emails
  const folders = [
    {
      id: "inbox",
      name: "Inbox",
      icon: <Mail size={16} />,
      count: emails.filter((e) => e.folder === "inbox").length,
    },
    {
      id: "unused",
      name: "Unused Regions",
      icon: <Mail size={16} />,
      count: 0,
    },
    {
      id: "important",
      name: "Important",
      icon: <Star size={16} />,
      count: emails.filter((e) => e.folder === "important").length,
    },
    { id: "snoozed", name: "Snoozed", icon: <Mail size={16} />, count: 0 },
    { id: "reminders", name: "Reminders", icon: <Mail size={16} />, count: 0 },
    { id: "scheduled", name: "Scheduled", icon: <Mail size={16} />, count: 0 },
    {
      id: "archived",
      name: "Archived",
      icon: <Archive size={16} />,
      count: emails.filter((e) => e.folder === "archived").length,
    },
  ];

  // Then declare emailAccounts which also uses emails
  const emailAccounts = [
    {
      id: "gmail-1",
      email: "john@company.com",
      provider: "Gmail",
      status: "connected",
      unreadCount: emails.filter((e) => e.account === "gmail-1" && !e.isRead)
        .length,
      avatar: "JD",
    },
    {
      id: "outlook-1",
      email: "marketing@company.com",
      provider: "Outlook",
      status: "connected",
      unreadCount: emails.filter((e) => e.account === "outlook-1" && !e.isRead)
        .length,
      avatar: "MC",
    },
    {
      id: "smtp-1",
      email: "support@company.com",
      provider: "SMTP",
      status: "connected",
      unreadCount: emails.filter((e) => e.account === "smtp-1" && !e.isRead)
        .length,
      avatar: "SC",
    },
  ];

  // State declarations
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [viewMode, setViewMode] = useState("unified"); // 'unified' or 'separate'
  const [activeFolder, setActiveFolder] = useState("inbox");

  const filteredEmails = emails.filter((email) => {
    const matchesAccount =
      selectedAccount === "all" || email.account === selectedAccount;
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder =
      activeFolder === "inbox" || email.folder === activeFolder;
    return matchesAccount && matchesSearch && matchesFolder;
  });

  const getAccountById = (id) => emailAccounts.find((acc) => acc.id === id);

  return (
    <div className="master-inbox">
      <div className="inbox-header">
        <h1>Master Inbox</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <Button
              variant={viewMode === "unified" ? "primary" : "outline"}
              size="small"
              onClick={() => setViewMode("unified")}
            >
              <Grid size={16} />
              <span>Unified</span>
            </Button>
            <Button
              variant={viewMode === "separate" ? "primary" : "outline"}
              size="small"
              onClick={() => setViewMode("separate")}
            >
              <List size={16} />
              <span>Separate</span>
            </Button>
          </div>
          <Button variant="primary" onClick={() => setShowConnectModal(true)}>
            <Plus size={16} />
            Connect Email Account
          </Button>
        </div>
      </div>

      <div className="inbox-layout">
        {/* Sidebar - Folders and Email Accounts */}
        <div className="inbox-sidebar">
          {/* Folders Card - Now at the top */}
          <Card className="folders-card">
            <Card.Header>
              <h3>Folders</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="folder-list">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`folder-item ${
                      activeFolder === folder.id ? "folder-item--active" : ""
                    }`}
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <div className="folder-item__icon">{folder.icon}</div>
                    <div className="folder-item__name">{folder.name}</div>
                    {folder.count > 0 && (
                      <div className="folder-item__count">{folder.count}</div>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Email Accounts Card */}
          <Card>
            <Card.Header>
              <h3>Email Accounts</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="account-list">
                <div
                  className={`account-item ${
                    selectedAccount === "all" ? "account-item--active" : ""
                  }`}
                  onClick={() => setSelectedAccount("all")}
                >
                  <div className="account-item__avatar">
                    <Mail size={16} />
                  </div>
                  <div className="account-item__info">
                    <div className="account-item__name">All Accounts</div>
                    <div className="account-item__count">
                      {emailAccounts.reduce(
                        (sum, acc) => sum + acc.unreadCount,
                        0
                      )}{" "}
                      unread
                    </div>
                  </div>
                </div>

                {emailAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`account-item ${
                      selectedAccount === account.id
                        ? "account-item--active"
                        : ""
                    }`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <div className="account-item__avatar">{account.avatar}</div>
                    <div className="account-item__info">
                      <div className="account-item__name">{account.email}</div>
                      <div className="account-item__provider">
                        {account.provider}
                      </div>
                    </div>
                    {account.unreadCount > 0 && (
                      <div className="account-item__badge">
                        {account.unreadCount}
                      </div>
                    )}
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
                    <p>
                      {viewMode === "unified"
                        ? "Your unified inbox is empty"
                        : "No emails in this folder"}
                    </p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`email-item ${
                        !email.isRead ? "email-item--unread" : ""
                      } ${
                        selectedEmail?.id === email.id
                          ? "email-item--selected"
                          : ""
                      }`}
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
                            <span className="email-item__name">
                              {email.fromName}
                            </span>
                            <span className="email-item__email">
                              {email.from}
                            </span>
                          </div>
                          <div className="email-item__meta">
                            {email.isStarred && (
                              <Star size={14} className="star-icon" />
                            )}
                            <span className="email-item__time">
                              {email.time}
                            </span>
                          </div>
                        </div>
                        <div className="email-item__subject">
                          {email.subject}
                        </div>
                        <div className="email-item__preview">
                          {email.preview}
                        </div>
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
                      <span>
                        to {getAccountById(selectedEmail.account)?.email}
                      </span>
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris.
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
          <div
            className="connect-modal__backdrop"
            onClick={() => setShowConnectModal(false)}
          />
          <div className="connect-modal__content">
            <div className="connect-modal__header">
              <h3>Connect Your Email Account</h3>
              <Button
                variant="ghost"
                onClick={() => setShowConnectModal(false)}
                style={{
                  fontSize: "24px", // Increase text size
                  padding: "8px 16px", // Increase padding
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                ×
              </Button>
            </div>
            <div className="connect-modal__body">
              <div className="connect-options">
                <div className="connect-option">
                  <div className="connect-option__icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div className="connect-option__info">
                    <h4>Google / Gmail</h4>
                    <p>Connect your Gmail account with OAuth</p>
                  </div>
                  <Button variant="primary">Connect</Button>
                </div>

                <div className="connect-option">
                  <div className="connect-option__icon">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png" 
                      alt="Microsoft Outlook" 
                      width="40" 
                      height="40" 
                    />
                  </div>
                  <div className="connect-option__info">
                    <h4>Microsoft Outlook</h4>
                    <p>Connect your Outlook account with OAuth</p>
                  </div>
                  <Button variant="primary">Connect</Button>
                </div>

                <div className="connect-option">
                  <div className="connect-option__icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                      <path d="M7 10l5 3 5-3" strokeDasharray="2,2"/>
                    </svg>
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
  );
};

export default MasterInbox;
