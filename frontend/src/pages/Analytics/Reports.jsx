"use client"

import { useState, useEffect } from "react"
import { Download, Filter, TrendingUp, Mail, MousePointer, Reply } from "lucide-react"
import Card from "../../components/UI/Card/Card"
import Button from "../../components/UI/Button/Button"
import Table from "../../components/UI/Table/Table"
import apiService from "../../services/api"
import "./Reports.scss"

const Reports = () => {
  const [dateRange, setDateRange] = useState("7d")
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState("all")
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const [campaignsResponse, statsResponse] = await Promise.all([
        apiService.getCampaigns(),
        apiService.getDashboardStats()
      ]);
      
      if (campaignsResponse.success) {
        setCampaigns(campaignsResponse.data);
      } else {
        console.error('Failed to fetch campaigns:', campaignsResponse.error);
        setCampaigns([]);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        console.error('Failed to fetch stats:', statsResponse.error);
        // Set fallback stats
        setStats({
          totalCampaigns: 0,
          sentCampaigns: 0,
          totalRecipients: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      // Set fallback data
      setCampaigns([]);
      setStats({
        totalCampaigns: 0,
        sentCampaigns: 0,
        totalRecipients: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const overallStats = stats ? [
    { title: "Total Sent", value: (stats.totalRecipients || 0).toLocaleString(), change: "+15.3%", icon: Mail, color: "primary" },
    { title: "Open Rate", value: `${(stats.openRate || 0).toFixed(1)}%`, change: "+2.1%", icon: MousePointer, color: "success" },
    { title: "Total Campaigns", value: (stats.totalCampaigns || 0).toString(), change: "+0.8%", icon: TrendingUp, color: "info" },
    { title: "Sent Campaigns", value: (stats.sentCampaigns || 0).toString(), change: "+0.3%", icon: Reply, color: "warning" },
  ] : []

  const campaignReports = campaigns.map(campaign => ({
    id: campaign.id,
    campaign: campaign.name,
    sent: campaign.analytics?.totalSent || 0,
    delivered: campaign.analytics?.totalSent - campaign.analytics?.totalBounced || 0,
    opened: campaign.analytics?.totalOpened || 0,
    clicked: campaign.analytics?.totalClicked || 0,
    replied: 0, // Not tracked in current schema
    openRate: `${campaign.analytics?.openRate?.toFixed(1) || 0}%`,
    clickRate: `${campaign.analytics?.clickRate?.toFixed(1) || 0}%`,
    replyRate: "0%", // Not tracked in current schema
    status: campaign.status,
  }))

  const emailPerformance = [
    {
      id: 1,
      subject: "Introducing our new product line",
      campaign: "Q4 Product Launch",
      sent: 245,
      opened: 89,
      clicked: 23,
      replied: 8,
      openRate: "36.3%",
      clickRate: "9.4%",
      replyRate: "3.3%",
    },
    {
      id: 2,
      subject: "Special holiday offer just for you",
      campaign: "Holiday Campaign",
      sent: 189,
      opened: 67,
      clicked: 12,
      replied: 4,
      openRate: "35.4%",
      clickRate: "6.3%",
      replyRate: "2.1%",
    },
  ]

  const campaignColumns = [
    { key: "campaign", title: "Campaign Name" },
    { key: "sent", title: "Sent", align: "center" },
    { key: "delivered", title: "Delivered", align: "center" },
    { key: "opened", title: "Opened", align: "center" },
    { key: "clicked", title: "Clicked", align: "center" },
    { key: "replied", title: "Replied", align: "center" },
    { key: "openRate", title: "Open Rate", align: "center" },
    { key: "clickRate", title: "Click Rate", align: "center" },
    { key: "replyRate", title: "Reply Rate", align: "center" },
    {
      key: "status",
      title: "Status",
      render: (status) => <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>,
      align: "center",
    },
  ]

  const emailColumns = [
    { key: "subject", title: "Subject Line" },
    { key: "campaign", title: "Campaign" },
    { key: "sent", title: "Sent", align: "center" },
    { key: "opened", title: "Opened", align: "center" },
    { key: "clicked", title: "Clicked", align: "center" },
    { key: "replied", title: "Replied", align: "center" },
    { key: "openRate", title: "Open Rate", align: "center" },
    { key: "clickRate", title: "Click Rate", align: "center" },
    { key: "replyRate", title: "Reply Rate", align: "center" },
  ]

  // Custom table rendering using your Table component
  const renderTable = (columns, data) => (
    <Table>
      <Table.Head>
        <Table.Row>
          {columns.map((col) => (
            <Table.Header key={col.key} style={col.align ? { textAlign: col.align } : {}}>
              {col.title}
            </Table.Header>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {data.map((row, i) => (
          <Table.Row key={row.id || i}>
            {columns.map((col) => (
              <Table.Cell
                key={col.key}
                style={col.align ? { textAlign: col.align } : {}}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )

  // Inline Modal implementation (styled in Reports.scss)
  const ExportModal = ({ open, onClose, children, footer }) => {
    if (!open) return null
    return (
      <div className="export-modal-backdrop">
        <div className="export-modal">
          <div className="export-modal__header">
            <h3 className="export-modal__title">Export Reports</h3>
            <button className="export-modal__close" onClick={onClose} aria-label="Close">
              &times;
            </button>
          </div>
          <div className="export-modal__body">{children}</div>
          <div className="export-modal__footer">{footer}</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="reports">
        <div className="reports__header">
          <h1>Reports & Analytics</h1>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="reports__header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Track your campaign performance and email metrics</p>
        </div>
        <div className="reports__actions">
          <select className="reports__select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={() => setShowExportModal(true)}>
            <Download size={16} />
            Export
          </Button>
          <Button variant="outline">
            <Filter size={16} />
            Filter
          </Button>
        </div>
      </div>

      <div className="reports__stats">
        {overallStats.map((stat, i) => (
          <Card key={i} className="reports__stat-card">
            <div className="reports__stat-icon reports__stat-icon--" data-color={stat.color}>
              <stat.icon size={26} />
            </div>
            <div>
              <div className="reports__stat-value">{stat.value}</div>
              <div className="reports__stat-title">{stat.title}</div>
              <div className={`reports__stat-change reports__stat-change--${stat.color}`}>
                {stat.change}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="reports__content">
        <Card className="reports__card">
          <div className="card__header card__header--flex">
            <h2>Campaign Performance</h2>
            <select className="reports__select" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
              <option value="all">All Campaigns</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
          <div className="card__body">
            {renderTable(campaignColumns, campaignReports)}
            <div className="reports__footer">Showing {campaignReports.length} campaigns</div>
          </div>
        </Card>

        <Card className="reports__card">
          <div className="card__header">
            <h2>Top Performing Emails</h2>
          </div>
          <div className="card__body">
            {renderTable(emailColumns, emailPerformance)}
            <div className="reports__footer">Showing top {emailPerformance.length} emails by open rate</div>
          </div>
        </Card>

        <div className="reports__charts">
          <Card className="reports__chart-card">
            <div className="card__header">
              <h2>Email Performance Over Time</h2>
            </div>
            <div className="card__body">
              <div className="reports__chart-bar-group">
                {[65, 45, 78, 52, 89, 67, 73].map((height, i) => (
                  <div key={i} className="reports__chart-bar" style={{ height: `${height}%` }}></div>
                ))}
              </div>
              <div className="reports__chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </Card>

          <Card className="reports__chart-card">
            <div className="card__header">
              <h2>Response Types</h2>
            </div>
            <div className="card__body">
              <div className="reports__pie-chart">
                <div className="pie-slice positive"></div>
                <div className="pie-slice neutral"></div>
                <div className="pie-slice negative"></div>
              </div>
              <div className="reports__pie-legend">
                <div className="legend-item">
                  <span className="legend-color positive"></span>
                  <span>Positive (45%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color neutral"></span>
                  <span>Neutral (30%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color negative"></span>
                  <span>Negative (25%)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">Export Data</Button>
          </>
        }
      >
        <div className="export-form">
          <div className="form-group">
            <label>Export Format</label>
            <select className="form-control">
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <div className="date-range">
              <input type="date" className="form-control" />
              <span>to</span>
              <input type="date" className="form-control" />
            </div>
          </div>
          <div className="form-group">
            <label>Include Data</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Campaign Performance</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Email Performance</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Contact Engagement</span>
              </label>
            </div>
          </div>
        </div>
      </ExportModal>
    </div>
  )
}

export default Reports