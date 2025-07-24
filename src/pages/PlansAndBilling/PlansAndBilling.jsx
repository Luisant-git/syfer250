"use client"

import { useState } from "react"
import { Check, CreditCard, Download, Calendar, AlertCircle, Crown, Zap, Star } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import "./PlansAndBilling.scss"

const PlansAndBilling = () => {
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [currentPlan, setCurrentPlan] = useState("pro")

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: Star,
      price: { monthly: 29, yearly: 290 },
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 1,000 contacts",
        "5,000 emails per month",
        "Basic email templates",
        "Email tracking",
        "Basic analytics",
        "Email support",
      ],
      limitations: ["No advanced automation", "Limited integrations"],
      popular: false,
    },
    {
      id: "pro",
      name: "Professional",
      icon: Zap,
      price: { monthly: 79, yearly: 790 },
      description: "Best for growing businesses",
      features: [
        "Up to 10,000 contacts",
        "50,000 emails per month",
        "Advanced email templates",
        "Email sequences",
        "Advanced analytics",
        "A/B testing",
        "Priority support",
        "API access",
      ],
      limitations: [],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Crown,
      price: { monthly: 199, yearly: 1990 },
      description: "For large organizations with advanced needs",
      features: [
        "Unlimited contacts",
        "Unlimited emails",
        "Custom templates",
        "Advanced automation",
        "Custom integrations",
        "Dedicated account manager",
        "Phone support",
        "Custom reporting",
        "White-label options",
      ],
      limitations: [],
      popular: false,
    },
  ]

  const billingHistory = [
    {
      id: 1,
      date: "2024-01-01",
      description: "Professional Plan - Monthly",
      amount: 79.0,
      status: "paid",
      invoice: "INV-2024-001",
    },
    {
      id: 2,
      date: "2023-12-01",
      description: "Professional Plan - Monthly",
      amount: 79.0,
      status: "paid",
      invoice: "INV-2023-012",
    },
    {
      id: 3,
      date: "2023-11-01",
      description: "Professional Plan - Monthly",
      amount: 79.0,
      status: "paid",
      invoice: "INV-2023-011",
    },
    {
      id: 4,
      date: "2023-10-01",
      description: "Starter Plan - Monthly",
      amount: 29.0,
      status: "paid",
      invoice: "INV-2023-010",
    },
  ]

  const paymentMethods = [
    {
      id: 1,
      type: "card",
      brand: "Visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 2,
      type: "card",
      brand: "Mastercard",
      last4: "5555",
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
    },
  ]

  const currentPlanData = plans.find((plan) => plan.id === currentPlan)
  const nextBillingDate = "February 1, 2024"
  const nextBillingAmount = currentPlanData?.price[billingCycle] || 0

  const handlePlanChange = (planId) => {
    if (planId !== currentPlan) {
      if (confirm(`Are you sure you want to change to the ${plans.find((p) => p.id === planId)?.name} plan?`)) {
        setCurrentPlan(planId)
        alert("Plan changed successfully!")
      }
    }
  }

  const downloadInvoice = (invoice) => {
    // Simulate invoice download
    alert(`Downloading invoice ${invoice}`)
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: "status-badge status-badge--success",
      pending: "status-badge status-badge--warning",
      failed: "status-badge status-badge--danger",
    }
    return statusClasses[status] || "status-badge status-badge--secondary"
  }

  return (
    <div className="plans-billing">
      <div className="plans-billing__header">
        <h1>Plans & Billing</h1>
        <p>Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Overview */}
      <Card className="current-plan">
        <Card.Header>
          <h2>Current Plan</h2>
        </Card.Header>
        <Card.Body>
          <div className="current-plan__content">
            <div className="current-plan__info">
              <div className="plan-badge">
                <currentPlanData.icon size={20} />
                <span>{currentPlanData.name}</span>
              </div>
              <div className="plan-details">
                <div className="plan-price">
                  ${nextBillingAmount}/{billingCycle === "monthly" ? "month" : "year"}
                </div>
                <div className="plan-description">{currentPlanData.description}</div>
              </div>
            </div>
            <div className="current-plan__billing">
              <div className="billing-info">
                <div className="billing-item">
                  <Calendar size={16} />
                  <span>Next billing: {nextBillingDate}</span>
                </div>
                <div className="billing-item">
                  <CreditCard size={16} />
                  <span>Amount: ${nextBillingAmount}</span>
                </div>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Plan Selection */}
      <Card>
        <Card.Header>
          <div className="plans-header">
            <h2>Choose Your Plan</h2>
            <div className="billing-toggle">
              <button className={billingCycle === "monthly" ? "active" : ""} onClick={() => setBillingCycle("monthly")}>
                Monthly
              </button>
              <button className={billingCycle === "yearly" ? "active" : ""} onClick={() => setBillingCycle("yearly")}>
                Yearly
                <span className="discount-badge">Save 17%</span>
              </button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${plan.popular ? "plan-card--popular" : ""} ${currentPlan === plan.id ? "plan-card--current" : ""}`}
              >
                {plan.popular && <div className="plan-card__badge">Most Popular</div>}

                <div className="plan-card__header">
                  <div className="plan-card__icon">
                    <plan.icon size={24} />
                  </div>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>

                <div className="plan-card__price">
                  <span className="price-amount">${plan.price[billingCycle]}</span>
                  <span className="price-period">/{billingCycle === "monthly" ? "month" : "year"}</span>
                  {billingCycle === "yearly" && (
                    <div className="price-savings">Save ${plan.price.monthly * 12 - plan.price.yearly}/year</div>
                  )}
                </div>

                <div className="plan-card__features">
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <Check size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.limitations.length > 0 && (
                    <div className="plan-limitations">
                      <h4>Limitations:</h4>
                      <ul>
                        {plan.limitations.map((limitation, index) => (
                          <li key={index}>
                            <AlertCircle size={16} />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="plan-card__action">
                  {currentPlan === plan.id ? (
                    <Button variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button variant={plan.popular ? "primary" : "outline"} onClick={() => handlePlanChange(plan.id)}>
                      {currentPlan === "starter" && plan.id !== "starter" ? "Upgrade" : "Change Plan"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Payment Methods */}
      <Card>
        <Card.Header>
          <div className="section-header">
            <h2>Payment Methods</h2>
            <Button variant="outline" size="small">
              <CreditCard size={16} />
              Add Payment Method
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method">
                <div className="payment-method__info">
                  <div className="payment-method__icon">
                    <CreditCard size={20} />
                  </div>
                  <div className="payment-method__details">
                    <div className="payment-method__brand">
                      {method.brand} •••• {method.last4}
                    </div>
                    <div className="payment-method__expiry">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  </div>
                  {method.isDefault && <span className="payment-method__default">Default</span>}
                </div>
                <div className="payment-method__actions">
                  {!method.isDefault && (
                    <Button variant="ghost" size="small">
                      Set as Default
                    </Button>
                  )}
                  <Button variant="ghost" size="small">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Billing History */}
      <Card>
        <Card.Header>
          <div className="section-header">
            <h2>Billing History</h2>
            <Button variant="outline" size="small">
              <Download size={16} />
              Download All
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="billing-history">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="billing-item">
                <div className="billing-item__info">
                  <div className="billing-item__date">{new Date(bill.date).toLocaleDateString()}</div>
                  <div className="billing-item__description">{bill.description}</div>
                  <div className="billing-item__invoice">Invoice: {bill.invoice}</div>
                </div>
                <div className="billing-item__amount">${bill.amount.toFixed(2)}</div>
                <div className="billing-item__status">
                  <span className={getStatusBadge(bill.status)}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </span>
                </div>
                <div className="billing-item__actions">
                  <Button variant="ghost" size="small" onClick={() => downloadInvoice(bill.invoice)}>
                    <Download size={14} />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <Card.Header>
          <h2>Current Usage</h2>
        </Card.Header>
        <Card.Body>
          <div className="usage-stats">
            <div className="usage-stat">
              <div className="usage-stat__header">
                <span>Contacts</span>
                <span>2,847 / 10,000</span>
              </div>
              <div className="usage-stat__bar">
                <div className="usage-stat__fill" style={{ width: "28.47%" }}></div>
              </div>
            </div>

            <div className="usage-stat">
              <div className="usage-stat__header">
                <span>Emails This Month</span>
                <span>12,450 / 50,000</span>
              </div>
              <div className="usage-stat__bar">
                <div className="usage-stat__fill" style={{ width: "24.9%" }}></div>
              </div>
            </div>

            <div className="usage-stat">
              <div className="usage-stat__header">
                <span>API Calls</span>
                <span>1,234 / Unlimited</span>
              </div>
              <div className="usage-stat__bar">
                <div className="usage-stat__fill" style={{ width: "12.34%" }}></div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default PlansAndBilling
