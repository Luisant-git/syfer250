"use client"

import { useState } from "react"
import { Calendar, Clock, Play } from "lucide-react"
import Card from "../../../components/UI/Card/Card"

const ScheduleCampaign = ({ data, onUpdate }) => {
  const [scheduleType, setScheduleType] = useState(data.scheduleType || "immediate")
  const [startDate, setStartDate] = useState(data.startDate || "")
  const [startTime, setStartTime] = useState(data.startTime || "09:00")
  const [timezone, setTimezone] = useState(data.timezone || "UTC")
  const [sendingDays, setSendingDays] = useState(
    data.sendingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"],
  )
  const [sendingHours, setSendingHours] = useState(data.sendingHours || { start: "09:00", end: "17:00" })
  const [emailsPerDay, setEmailsPerDay] = useState(data.emailsPerDay || 50)

  const days = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ]

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
  ]

  const handleDayToggle = (dayId) => {
    const updatedDays = sendingDays.includes(dayId) ? sendingDays.filter((d) => d !== dayId) : [...sendingDays, dayId]
    setSendingDays(updatedDays)
    updateData({ sendingDays: updatedDays })
  }

  const updateData = (updates) => {
    const newData = {
      scheduleType,
      startDate,
      startTime,
      timezone,
      sendingDays,
      sendingHours,
      emailsPerDay,
      ...updates,
    }
    onUpdate(newData)
  }

  return (
    <div className="schedule-campaign">
      <div className="step-header">
        <h2>Schedule Campaign</h2>
        <p>Configure when and how your campaign should be sent</p>
      </div>

      <div className="schedule-grid">
        {/* Schedule Type */}
        <Card>
          <Card.Header>
            <h3>
              <Calendar size={20} /> Campaign Start
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="schedule-options">
              <label className="schedule-option">
                <input
                  type="radio"
                  name="scheduleType"
                  value="immediate"
                  checked={scheduleType === "immediate"}
                  onChange={(e) => {
                    setScheduleType(e.target.value)
                    updateData({ scheduleType: e.target.value })
                  }}
                />
                <div className="schedule-option__content">
                  <Play size={20} />
                  <div>
                    <strong>Start Immediately</strong>
                    <p>Begin sending as soon as campaign is created</p>
                  </div>
                </div>
              </label>

              <label className="schedule-option">
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scheduleType === "scheduled"}
                  onChange={(e) => {
                    setScheduleType(e.target.value)
                    updateData({ scheduleType: e.target.value })
                  }}
                />
                <div className="schedule-option__content">
                  <Clock size={20} />
                  <div>
                    <strong>Schedule for Later</strong>
                    <p>Set a specific date and time to start</p>
                  </div>
                </div>
              </label>
            </div>

            {scheduleType === "scheduled" && (
              <div className="schedule-details">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start-date">Start Date</label>
                    <input
                      type="date"
                      id="start-date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        updateData({ startDate: e.target.value })
                      }}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="start-time">Start Time</label>
                    <input
                      type="time"
                      id="start-time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value)
                        updateData({ startTime: e.target.value })
                      }}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value)
                      updateData({ timezone: e.target.value })
                    }}
                    className="form-select"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Sending Schedule */}
        <Card>
          <Card.Header>
            <h3>
              <Clock size={20} /> Sending Schedule
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="form-group">
              <label>Sending Days</label>
              <div className="day-selector">
                {days.map((day) => (
                  <label key={day.id} className="day-option">
                    <input
                      type="checkbox"
                      checked={sendingDays.includes(day.id)}
                      onChange={() => handleDayToggle(day.id)}
                    />
                    <span>{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start-hour">Start Time</label>
                <input
                  type="time"
                  id="start-hour"
                  value={sendingHours.start}
                  onChange={(e) => {
                    const newHours = { ...sendingHours, start: e.target.value }
                    setSendingHours(newHours)
                    updateData({ sendingHours: newHours })
                  }}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="end-hour">End Time</label>
                <input
                  type="time"
                  id="end-hour"
                  value={sendingHours.end}
                  onChange={(e) => {
                    const newHours = { ...sendingHours, end: e.target.value }
                    setSendingHours(newHours)
                    updateData({ sendingHours: newHours })
                  }}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emails-per-day">Emails per Day</label>
              <input
                type="number"
                id="emails-per-day"
                value={emailsPerDay}
                onChange={(e) => {
                  setEmailsPerDay(Number.parseInt(e.target.value))
                  updateData({ emailsPerDay: Number.parseInt(e.target.value) })
                }}
                min="1"
                max="1000"
                className="form-input"
              />
              <small className="form-help">Maximum number of emails to send per day</small>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Schedule Summary */}
      <Card className="schedule-summary">
        <Card.Header>
          <h3>Schedule Summary</h3>
        </Card.Header>
        <Card.Body>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Start:</strong>
              <span>
                {scheduleType === "immediate"
                  ? "Immediately after creation"
                  : `${startDate} at ${startTime} (${timezone})`}
              </span>
            </div>
            <div className="summary-item">
              <strong>Sending Days:</strong>
              <span>{sendingDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}</span>
            </div>
            <div className="summary-item">
              <strong>Sending Hours:</strong>
              <span>
                {sendingHours.start} - {sendingHours.end}
              </span>
            </div>
            <div className="summary-item">
              <strong>Daily Limit:</strong>
              <span>{emailsPerDay} emails per day</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ScheduleCampaign
