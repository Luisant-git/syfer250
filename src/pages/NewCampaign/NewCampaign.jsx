"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import ImportSettings from "./steps/ImportSettings"
import EmailSequences from "./steps/EmailSequences"
import SelectSender from "./steps/SelectSender"
import ScheduleCampaign from "./steps/ScheduleCampaign"
import CampaignSettings from "./steps/CampaignSettings"
import "./NewCampaign.scss"

const NewCampaign = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [campaignData, setCampaignData] = useState({
    importSettings: {},
    emailSequences: [],
    senderEmail: "",
    schedule: {},
    settings: {},
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
          <Button variant="success" size="large">
            Start Campaign
          </Button>
        ) : (
          <Button variant="primary" onClick={nextStep}>
            Next
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}

export default NewCampaign
