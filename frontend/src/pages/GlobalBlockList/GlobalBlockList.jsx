"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Upload,
  Download,
  Ban,
  Mail,
  Calendar,
  Filter,
} from "lucide-react";
import Button from "../../components/UI/Button/Button";
import Card from "../../components/UI/Card/Card";
import Table from "../../components/UI/Table/Table";
import "./GlobalBlockList.scss";

const GlobalBlockList = () => {
  const [blockedEmails, setBlockedEmails] = useState([
    {
      id: 1,
      email: "spam@example.com",
      reason: "Spam complaint",
      dateAdded: "2024-01-15",
      addedBy: "System",
      source: "Automatic",
    },
    {
      id: 2,
      email: "bounce@domain.com",
      reason: "Hard bounce",
      dateAdded: "2024-01-14",
      addedBy: "Anesh",
      source: "Manual",
    },
    {
      id: 3,
      email: "unsubscribe@test.com",
      reason: "Unsubscribe request",
      dateAdded: "2024-01-13",
      addedBy: "System",
      source: "Automatic",
    },
    {
      id: 4,
      email: "invalid@nowhere.xyz",
      reason: "Invalid email",
      dateAdded: "2024-01-12",
      addedBy: "Jane Smith",
      source: "Manual",
    },
    {
      id: 5,
      email: "complaint@service.com",
      reason: "Abuse complaint",
      dateAdded: "2024-01-11",
      addedBy: "System",
      source: "Automatic",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);

  const filteredEmails = blockedEmails.filter((email) => {
    const matchesSearch =
      email.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterSource === "all" ||
      email.source.toLowerCase() === filterSource.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleAddEmail = () => {
    if (newEmail && newReason) {
      const newBlockedEmail = {
        id: Date.now(),
        email: newEmail,
        reason: newReason,
        dateAdded: new Date().toISOString().split("T")[0],
        addedBy: "Current User",
        source: "Manual",
      };
      setBlockedEmails([...blockedEmails, newBlockedEmail]);
      setNewEmail("");
      setNewReason("");
      setShowAddModal(false);
    }
  };

  const handleBulkAdd = () => {
    if (bulkEmails) {
      const emails = bulkEmails.split("\n").filter((email) => email.trim());
      const newBlockedEmails = emails.map((email) => ({
        id: Date.now() + Math.random(),
        email: email.trim(),
        reason: "Bulk import",
        dateAdded: new Date().toISOString().split("T")[0],
        addedBy: "Current User",
        source: "Manual",
      }));
      setBlockedEmails([...blockedEmails, ...newBlockedEmails]);
      setBulkEmails("");
      setShowBulkModal(false);
    }
  };

  const handleRemoveEmail = (id) => {
    if (
      confirm("Are you sure you want to remove this email from the block list?")
    ) {
      setBlockedEmails(blockedEmails.filter((email) => email.id !== id));
    }
  };

  const handleBulkRemove = () => {
    if (
      selectedEmails.length > 0 &&
      confirm(`Remove ${selectedEmails.length} emails from the block list?`)
    ) {
      setBlockedEmails(
        blockedEmails.filter((email) => !selectedEmails.includes(email.id))
      );
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (id) => {
    setSelectedEmails((prev) =>
      prev.includes(id)
        ? prev.filter((emailId) => emailId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map((email) => email.id));
    }
  };

  const exportBlockList = () => {
    const csvContent = [
      "Email,Reason,Date Added,Added By,Source",
      ...blockedEmails.map(
        (email) =>
          `${email.email},${email.reason},${email.dateAdded},${email.addedBy},${email.source}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "global-block-list.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="global-block-list">
      <div className="block-list__header">
        <div>
          <h1>Global Block List</h1>
          <p>Manage emails that are blocked from receiving your campaigns</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => setShowBulkModal(true)}>
            <Upload size={16} />
            Bulk Import
          </Button>
          <Button variant="outline" onClick={exportBlockList}>
            <Download size={16} />
            Export
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Email
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="block-list__stats">
        <Card className="stat-card">
          <Card.Body>
            <div className="stat-content">
              <div className="stat-icon">
                <Ban size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{blockedEmails.length}</div>
                <div className="stat-label">Total Blocked</div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="stat-card">
          <Card.Body>
            <div className="stat-content">
              <div className="stat-icon">
                <Mail size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {blockedEmails.filter((e) => e.source === "Automatic").length}
                </div>
                <div className="stat-label">Auto-Blocked</div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="stat-card">
          <Card.Body>
            <div className="stat-content">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {
                    blockedEmails.filter(
                      (e) =>
                        e.dateAdded === new Date().toISOString().split("T")[0]
                    ).length
                  }
                </div>
                <div className="stat-label">Added Today</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <Card.Body>
          <div className="block-list__controls">
            <div className="search-section">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search blocked emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-section">
                <Filter size={16} />
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Sources</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
            </div>

            {selectedEmails.length > 0 && (
              <div className="bulk-actions">
                <span className="selected-count">
                  {selectedEmails.length} selected
                </span>
                <Button
                  variant="danger"
                  size="small"
                  onClick={handleBulkRemove}
                >
                  <Trash2 size={14} />
                  Remove Selected
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Block List Table */}
      <Card>
        <Card.Body className="p-0">
          <Table hover>
            <Table.Head>
              <Table.Row>
                <Table.Header>
                  <input
                    type="checkbox"
                    checked={
                      selectedEmails.length === filteredEmails.length &&
                      filteredEmails.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </Table.Header>
                <Table.Header>Email Address</Table.Header>
                <Table.Header>Reason</Table.Header>
                <Table.Header>Date Added</Table.Header>
                <Table.Header>Added By</Table.Header>
                <Table.Header>Source</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredEmails.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="7" className="text-center">
                    <div className="empty-state">
                      <Ban size={48} />
                      <h3>No blocked emails found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredEmails.map((email) => (
                  <Table.Row key={email.id}>
                    <Table.Cell>
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={() => handleSelectEmail(email.id)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="email-cell">
                        <Mail size={16} />
                        <span>{email.email}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{email.reason}</Table.Cell>
                    <Table.Cell>
                      {new Date(email.dateAdded).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>{email.addedBy}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={`source-badge source-badge--${email.source.toLowerCase()}`}
                      >
                        {email.source}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleRemoveEmail(email.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Email Modal */}
      {showAddModal && (
        <div className="modal">
          <div
            className="modal__backdrop"
            onClick={() => setShowAddModal(false)}
          />
          <div className="modal__content">
            <div className="modal__header">
              <h3>Add Email to Block List</h3>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                ×
              </Button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-input"
                  placeholder="user@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <select
                  id="reason"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select a reason</option>
                  <option value="Spam complaint">Spam complaint</option>
                  <option value="Hard bounce">Hard bounce</option>
                  <option value="Unsubscribe request">
                    Unsubscribe request
                  </option>
                  <option value="Invalid email">Invalid email</option>
                  <option value="Abuse complaint">Abuse complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="modal__footer">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddEmail}
                disabled={!newEmail || !newReason}
              >
                Add to Block List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="modal">
          <div
            className="modal__backdrop"
            onClick={() => setShowBulkModal(false)}
          />
          <div className="modal__content modal__content--large">
            <div className="modal__header">
              <h3>Bulk Import Emails</h3>
              <Button variant="ghost" onClick={() => setShowBulkModal(false)}>
                ×
              </Button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label htmlFor="bulk-emails">Email Addresses</label>
                <textarea
                  id="bulk-emails"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="form-textarea"
                  rows="10"
                  placeholder="Enter one email address per line:&#10;spam@example.com&#10;bounce@domain.com&#10;invalid@nowhere.xyz"
                />
                <small className="form-help">
                  Enter one email address per line. All emails will be marked as
                  "Bulk import" reason.
                </small>
              </div>
            </div>
            <div className="modal__footer">
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkAdd}
                disabled={!bulkEmails.trim()}
              >
                Import Emails
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalBlockList;
