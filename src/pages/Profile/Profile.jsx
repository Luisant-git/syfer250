"use client"

import { useState } from "react"
import { Save, Upload, User, Mail, Phone, MapPin, Building, Calendar } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import Card from "../../components/UI/Card/Card"
import "./Profile.scss"

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corporation",
    jobTitle: "Marketing Director",
    department: "Marketing",
    location: "New York, NY",
    timezone: "America/New_York",
    bio: "Experienced marketing professional with over 8 years in email marketing and campaign management.",
    website: "https://johndoe.com",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "@johndoe",
  })

  const [avatar, setAvatar] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`
  }

  return (
    <div className="profile">
      <div className="profile__header">
        <h1>Profile Settings</h1>
        <Button variant="primary" onClick={handleSave} loading={isSaving}>
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      <div className="profile__layout">
        {/* Profile Overview */}
        <Card className="profile-overview">
          <Card.Body>
            <div className="profile-overview__content">
              <div className="profile-avatar">
                <div className="profile-avatar__image">
                  {avatar ? (
                    <img src={avatar || "/placeholder.svg"} alt="Profile" />
                  ) : (
                    <div className="profile-avatar__placeholder">{getInitials()}</div>
                  )}
                </div>
                <div className="profile-avatar__actions">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="avatar-upload" className="btn btn--outline btn--small">
                    <Upload size={14} />
                    Change Photo
                  </label>
                </div>
              </div>

              <div className="profile-overview__info">
                <h2>
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="profile-overview__title">{profile.jobTitle}</p>
                <p className="profile-overview__company">{profile.company}</p>

                <div className="profile-overview__details">
                  <div className="detail-item">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={16} />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>Member since January 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Profile Form */}
        <div className="profile-form">
          {/* Personal Information */}
          <Card>
            <Card.Header>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <User size={20} />
  Personal Information
</h3>

            </Card.Header>
            <Card.Body>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group form-group--full">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Work Information */}
          <Card>
            <Card.Header>
              <h3>
                <Building size={20} />
                Work Information
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    value={profile.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    value={profile.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={profile.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Social Links */}
          <Card>
            <Card.Header>
              <h3>Social Links</h3>
            </Card.Header>
            <Card.Body>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    value={profile.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="form-input"
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <input
                    type="url"
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    className="form-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="twitter">Twitter</label>
                  <input
                    type="text"
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => handleInputChange("twitter", e.target.value)}
                    className="form-input"
                    placeholder="@username"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Account Statistics */}
          <Card>
            <Card.Header>
              <h3>Account Statistics</h3>
            </Card.Header>
            <Card.Body>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-item__value">24</div>
                  <div className="stat-item__label">Campaigns Created</div>
                </div>
                <div className="stat-item">
                  <div className="stat-item__value">12,847</div>
                  <div className="stat-item__label">Emails Sent</div>
                </div>
                <div className="stat-item">
                  <div className="stat-item__value">68.5%</div>
                  <div className="stat-item__label">Avg. Open Rate</div>
                </div>
                <div className="stat-item">
                  <div className="stat-item__value">1,247</div>
                  <div className="stat-item__label">Total Contacts</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
