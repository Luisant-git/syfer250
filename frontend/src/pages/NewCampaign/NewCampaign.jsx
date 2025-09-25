"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import ImportSettings from "./steps/ImportSettingsEnhanced"
import EmailSequences from "./steps/EmailSequences"
import SelectSender from "./steps/SelectSender"
import ScheduleCampaign from "./steps/ScheduleCampaign"
import CampaignSettings from "./steps/CampaignSettings"
import apiService from "../../services/api"
import useToast from "../../hooks/useToast"
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer"
import "./NewCampaign.scss"

const NewCampaign = () => {
  const navigate = useNavigate()
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [campaignData, setCampaignData] = useState({
    import: { recipients: [] },
    sequences: [{ subject: "", content: "" }],
    sender: "",
    schedule: { scheduleType: "now", scheduledAt: null },
    settings: { name: "", description: "", tags: [], priority: "medium" },
  })

  const steps = [
    { id: "import", title: "Import Settings", component: ImportSettings },
    { id: "sequences", title: "Email Sequences", component: EmailSequences },
    { id: "sender", title: "Select Sender", component: SelectSender },
    { id: "schedule", title: "Schedule Campaign", component: ScheduleCampaign },
    { id: "settings", title: "Campaign Settings", component: CampaignSettings },
  ]

  const updateCampaignData = (stepData) => {
    setCampaignData((prev) => ({
      ...prev,
      [steps[currentStep].id]: stepData,
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const createCampaign = async () => {
    setLoading(true)
    setError("")
    
    try {
      const { settings, sequences, sender, schedule, import: importData } = campaignData
      
      // Validate required data
      if (!settings.name || !settings.name.trim()) {
        throw new Error("Campaign name is required")
      }
      
      if (!sequences[0]?.subject || !sequences[0]?.subject.trim()) {
        throw new Error("Email subject is required")
      }
      
      if (!sequences[0]?.content || !sequences[0]?.content.trim()) {
        throw new Error("Email content is required")
      }
      
      if (!importData.recipients || importData.recipients.length === 0) {
        throw new Error("At least one recipient is required")
      }
      
      // Validate scheduled time if scheduling for later
      if (schedule.scheduleType === 'later') {
        if (!schedule.scheduledAt) {
          throw new Error("Scheduled date and time is required")
        }
        
        const scheduledTime = new Date(schedule.scheduledAt)
        const now = new Date()
        const minTime = new Date(now.getTime() + 1 * 60000) // 1 minute from now
        
        if (scheduledTime <= minTime) {
          throw new Error("Campaign must be scheduled at least 1 minute in the future")
        }
      }
      
      const campaignPayload = {
        name: settings.name.trim(),
        description: settings.description || null,
        tags: settings.tags || [],
        subject: sequences[0].subject.trim(),
        content: sequences[0].content.trim(),
        priority: settings.priority || 'medium',
        senderId: sender && sender.trim() !== "" ? sender.trim() : null,
        scheduledAt: schedule.scheduledAt || null,
        scheduleType: schedule.scheduleType || 'draft',
        timezone: schedule.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        recipients: importData.recipients.map(recipient => ({
          email: recipient.email,
          firstName: recipient.firstName || "",
          lastName: recipient.lastName || ""
        }))
      }
      
      console.log("Creating campaign with payload:", campaignPayload)
      
      // Log scheduling details for debugging
      if (schedule.scheduleType === 'later') {
        console.log('Scheduling details:', {
          originalTime: schedule.scheduledAt,
          timezone: schedule.timezone,
          currentTime: new Date().toISOString()
        })
      }
      
      const response = await apiService.createCampaign(campaignPayload)
      
      if (response.success) {
        showSuccess('Campaign created successfully! Redirecting to dashboard...')
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        throw new Error(response.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error("Campaign creation error:", error)
      setError(error.message || 'Failed to create campaign')
      showError(error.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="new-campaign">
      <div className="new-campaign__header">
        <h1>Create New Campaign</h1>
        <p>Follow the steps below to set up your email campaign</p>
      </div>

      {/* Progress Steps */}
      <Card className="new-campaign__progress">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${
                index === currentStep ? "progress-step--active" : index < currentStep ? "progress-step--completed" : ""
              }`}
            >
              <div className="progress-step__circle">
                {index < currentStep ? <Check size={16} /> : <span>{index + 1}</span>}
              </div>
              <div className="progress-step__content">
                <div className="progress-step__title">{step.title}</div>
              </div>
              {index < steps.length - 1 && <div className="progress-step__connector"></div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="new-campaign__content">
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        
        <CurrentStepComponent
          data={campaignData[steps[currentStep].id]}
          onUpdate={updateCampaignData}
          campaignData={campaignData}
        />
      </Card>

      {/* Navigation */}
      <div className="new-campaign__navigation">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          <ChevronLeft size={16} />
          Previous
        </Button>

        <div className="new-campaign__step-info">
          Step {currentStep + 1} of {steps.length}
        </div>

        {currentStep === steps.length - 1 ? (
          <Button variant="success" size="large" onClick={createCampaign} disabled={loading}>
            {loading ? 'Creating Campaign...' : 'Start Campaign'}
          </Button>
        ) : (
          <Button variant="primary" onClick={nextStep}>
            Next
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default NewCampaign