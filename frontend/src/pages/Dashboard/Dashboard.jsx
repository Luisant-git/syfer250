"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, TrendingUp, Users, Send, Eye, Edit, Trash2, Calendar, Mail } from "lucide-react"
import Card from "../../components/UI/Card/Card"
import Button from "../../components/UI/Button/Button"
import Table from "../../components/UI/Table/Table"
import DeleteModal from "../../components/UI/Modal/DeleteModal"
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer";

import "./Dashboard.scss"

const Dashboard = () => {
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState("7days")
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const handleNavigate = () => {
    navigate("/campaigns/new");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [campaignsResponse, statsResponse] = await Promise.all([
        apiService.getCampaigns(),
        apiService.getDashboardStats()
      ]);
      
      if (campaignsResponse.success) {
        setCampaigns(campaignsResponse.data);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = stats ? [
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns.toString(),
      change: "+12%",
      changeType: "positive",
      icon: Send,
      color: "primary",
    },
    {
      title: "Sent Campaigns",
      value: stats.sentCampaigns.toString(),
      change: "+5%",
      changeType: "positive",
      icon: TrendingUp,
      color: "success",
    },
    {
      title: "Total Recipients",
      value: stats.totalRecipients.toLocaleString(),
      change: "+18%",
      changeType: "positive",
      icon: Users,
      color: "warning",
    },
    {
      title: "Open Rate",
      value: `${stats.openRate.toFixed(1)}%`,
      change: "+2.3%",
      changeType: "positive",
      icon: Eye,
      color: "info",
    },
  ] : []

  const getStatusBadge = (status) => {
    const statusClasses = {
      SENT: "badge badge--success",
      SENDING: "badge badge--info", 
      DRAFT: "badge badge--warning",
      SCHEDULED: "badge badge--primary",
      PAUSED: "badge badge--secondary",
      CANCELLED: "badge badge--danger",
      BLOCKED: "badge badge--danger",
    }
    return statusClasses[status] || "badge badge--secondary"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  }

  const getOpenRate = (campaign) => {
    if (!campaign.analytics || campaign.analytics.totalSent === 0) return '-';
    return `${campaign.analytics.openRate.toFixed(1)}%`;
  }

  const getClickRate = (campaign) => {
    if (!campaign.analytics || campaign.analytics.totalSent === 0) return '-';
    return `${campaign.analytics.clickRate.toFixed(1)}%`;
  }

  const getSentCount = (campaign) => {
    return campaign.analytics?.totalSent || 0;
  }

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    
    setDeleteLoading(campaignToDelete.id);
    try {
      await apiService.deleteCampaign(campaignToDelete.id);
      setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id));
      showSuccess('Campaign deleted successfully');
      setShowDeleteModal(false);
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Delete campaign error:', error);
      showError(error.message || 'Failed to delete campaign');
    } finally {
      setDeleteLoading(null);
    }
  }

  const openDeleteModal = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
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
                <Table.Header style={{ width: '25%' }}>Campaign Details</Table.Header>
                <Table.Header style={{ width: '12%' }}>Status</Table.Header>
                <Table.Header style={{ width: '12%' }}>Recipients</Table.Header>
                <Table.Header style={{ width: '12%' }}>Open Rate</Table.Header>
                <Table.Header style={{ width: '12%' }}>Click Rate</Table.Header>
                <Table.Header style={{ width: '12%' }}>Created</Table.Header>
                <Table.Header style={{ width: '15%' }}>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>
                    Loading campaigns...
                  </Table.Cell>
                </Table.Row>
              ) : filteredCampaigns.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>
                    No campaigns found. Create your first campaign!
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <Table.Row key={campaign.id}>
                    <Table.Cell>
                      <div className="campaign-details">
                        <div className="campaign-name">
                          <strong style={{ fontSize: '0.95rem', color: '#1a1a1a' }}>{campaign.name}</strong>
                        </div>
                        <div className="campaign-subject" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={12} />
                          {campaign.subject || 'No subject'}
                        </div>
                        {campaign.scheduledAt && (
                          <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            Scheduled: {formatDate(campaign.scheduledAt)}
                          </div>
                        )}
                        {campaign.priority && (
                          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: campaign.priority === 'URGENT' ? '#dc3545' : campaign.priority === 'HIGH' ? '#fd7e14' : campaign.priority === 'MEDIUM' ? '#ffc107' : '#28a745' }}>
                            Priority: {campaign.priority}
                          </div>
                        )}
                        
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={getStatusBadge(campaign.status)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                        {campaign.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {getSentCount(campaign).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>sent</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#28a745' }}>
                          {getOpenRate(campaign)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>opens</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#667eea' }}>
                          {getClickRate(campaign)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>clicks</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {formatDate(campaign.createdAt)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/campaigns/${campaign.id}`);
                          }}
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          title="View Campaign"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/campaigns/${campaign.id}/edit`);
                          }}
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          title="Edit Campaign"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDeleteModal(campaign);
                          }}
                          style={{ 
                            padding: '0.375rem 0.75rem', 
                            fontSize: '0.8rem',
                            color: '#dc3545'
                          }}
                          title="Delete Campaign"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Body>
      </Card>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCampaignToDelete(null);
        }}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? All associated data including recipients and analytics will be permanently removed."
        itemName={campaignToDelete?.name}
        loading={deleteLoading === campaignToDelete?.id}
      />
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .campaign-details {
          min-width: 200px;
        }
        
        .action-buttons button:hover {
          background-color: #f8f9fa;
        }
        
        .action-buttons button[title="Delete Campaign"]:hover {
          background-color: #fff5f5;
          color: #dc3545 !important;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
