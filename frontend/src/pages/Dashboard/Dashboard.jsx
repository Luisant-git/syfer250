"use client"

import { useState } from "react"
import { Plus, Filter, TrendingUp, Users, Send, Eye } from "lucide-react"
import Card from "../../components/UI/Card/Card"
import Button from "../../components/UI/Button/Button"
import Table from "../../components/UI/Table/Table"
import { useNavigate } from "react-router-dom";


import "./Dashboard.scss"

const Dashboard = () => {
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState("7days")
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/campaigns/new");
  };

  const summaryCards = [
    {
      title: "Total Campaigns",
      value: "24",
      change: "+12%",
      changeType: "positive",
      icon: Send,
      color: "primary",
    },
    {
      title: "Active Campaigns",
      value: "8",
      change: "+5%",
      changeType: "positive",
      icon: TrendingUp,
      color: "success",
    },
    {
      title: "Total Contacts",
      value: "1,247",
      change: "+18%",
      changeType: "positive",
      icon: Users,
      color: "warning",
    },
    {
      title: "Open Rate",
      value: "68.5%",
      change: "+2.3%",
      changeType: "positive",
      icon: Eye,
      color: "info",
    },
  ]

  const campaigns = [
    {
      id: 1,
      name: "Q4 Product Launch",
      status: "Active",
      openRate: "72.3%",
      clickRate: "15.2%",
      sent: 1250,
      created: "2024-01-15",
    },
    {
      id: 2,
      name: "Holiday Newsletter",
      status: "Completed",
      openRate: "65.8%",
      clickRate: "12.4%",
      sent: 890,
      created: "2024-01-10",
    },
    {
      id: 3,
      name: "Customer Feedback Survey",
      status: "Draft",
      openRate: "-",
      clickRate: "-",
      sent: 0,
      created: "2024-01-12",
    },
    {
      id: 4,
      name: "Welcome Series",
      status: "Active",
      openRate: "78.9%",
      clickRate: "18.7%",
      sent: 456,
      created: "2024-01-08",
    },
    {
      id: 5,
      name: "Monthly Update",
      status: "Scheduled",
      openRate: "-",
      clickRate: "-",
      sent: 0,
      created: "2024-01-14",
    },
  ]

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: "badge badge--success",
      Completed: "badge badge--info",
      Draft: "badge badge--warning",
      Scheduled: "badge badge--primary",
      Paused: "badge badge--secondary",
    }
    return statusClasses[status] || "badge badge--secondary"
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterStatus === "all") return true
    return campaign.status.toLowerCase() === filterStatus.toLowerCase()
  })

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Welcome back! Here's what's happening with your campaigns.</p>
        </div>
  <Button
      variant="primary"
      size="medium"
      style={{ padding: "10px 20px" }}
      onClick={handleNavigate}
    >
      <Plus size={20} />
      New Campaign
    </Button>

      </div>

      {/* Summary Cards */}
      <div className="dashboard__summary">
        {summaryCards.map((card, index) => (
          <Card key={index} className={`summary-card summary-card--${card.color}`}>
            <div className="summary-card__content">
              <div className="summary-card__info">
                <h3 className="summary-card__title">{card.title}</h3>
                <div className="summary-card__value">{card.value}</div>
                <div className={`summary-card__change summary-card__change--${card.changeType}`}>
                  {card.change} from last week
                </div>
              </div>
              <div className="summary-card__icon">
                <card.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters and Campaign Table */}
      <Card>
        <Card.Header>
          <div className="dashboard__table-header">
            <h2>Recent Campaigns</h2>
            <div className="dashboard__filters">
              <div className="filter-group">
                <label htmlFor="status-filter">Status:</label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="date-filter">Date Range:</label>
                <select
                  id="date-filter"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="1year">Last year</option>
                </select>
              </div>
              <Button variant="outline" size="small">
                <Filter size={16} />
                More Filters
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover>
            <Table.Head>
              <Table.Row>
                <Table.Header>Campaign Name</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Open Rate</Table.Header>
                <Table.Header>Click Rate</Table.Header>
                <Table.Header>Sent</Table.Header>
                <Table.Header>Created</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredCampaigns.map((campaign) => (
                <Table.Row key={campaign.id}>
                  <Table.Cell>
                    <div className="campaign-name">
                      <strong>{campaign.name}</strong>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className={getStatusBadge(campaign.status)}>{campaign.status}</span>
                  </Table.Cell>
                  <Table.Cell>{campaign.openRate}</Table.Cell>
                  <Table.Cell>{campaign.clickRate}</Table.Cell>
                  <Table.Cell>{campaign.sent.toLocaleString()}</Table.Cell>
                  <Table.Cell>{new Date(campaign.created).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <div className="action-buttons">
                      <Button variant="ghost" size="small">
                        View
                      </Button>
                      <Button variant="ghost" size="small">
                        Edit
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Dashboard
