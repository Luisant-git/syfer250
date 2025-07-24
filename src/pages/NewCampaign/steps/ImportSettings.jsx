"use client"

import { useState } from "react"
import { Upload, FileSpreadsheet, Eye, Settings } from "lucide-react"
import Button from "../../../components/UI/Button/Button"
import Card from "../../../components/UI/Card/Card"

const ImportSettings = ({ data, onUpdate }) => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fieldMapping, setFieldMapping] = useState({
    email: "Email",
    firstName: "First Name",
    lastName: "Last Name",
    company: "Company",
  })

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedFile(file)
      setShowPreview(true)
      onUpdate({ ...data, file, fieldMapping })
    }
  }

  const sampleData = [
    { Email: "john@example.com", "First Name": "John", "Last Name": "Doe", Company: "Acme Corp" },
    { Email: "jane@example.com", "First Name": "Jane", "Last Name": "Smith", Company: "Tech Inc" },
    { Email: "bob@example.com", "First Name": "Bob", "Last Name": "Johnson", Company: "StartupXYZ" },
  ]

  return (
    <div className="import-settings">
      <div className="step-header">
        <h2>Import Settings</h2>
        <p>Upload your contact list and configure import options</p>
      </div>

      <div className="import-grid">
        {/* File Upload */}
        <Card>
          <Card.Header>
            <h3>
              <Upload size={20} /> Upload Contact List
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="file-upload">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="file-upload__area">
                <FileSpreadsheet size={48} />
                <div className="file-upload__text">
                  <strong>Click to upload</strong> or drag and drop
                  <br />
                  <small>Excel (.xlsx, .xls) or CSV files only</small>
                </div>
              </label>
              {uploadedFile && (
                <div className="file-upload__success">
                  <FileSpreadsheet size={20} />
                  <span>{uploadedFile.name}</span>
                  <Button variant="ghost" size="small" onClick={() => setShowPreview(!showPreview)}>
                    <Eye size={16} />
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Lead Options */}
        <Card>
          <Card.Header>
            <h3>
              <Settings size={20} /> Lead Options
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="form-group">
              <label>
                <input type="checkbox" defaultChecked />
                Skip duplicate emails
              </label>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" defaultChecked />
                Validate email addresses
              </label>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" />
                Remove bounced emails
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="list-name">List Name:</label>
              <input type="text" id="list-name" placeholder="Enter list name" className="form-input" />
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Preview */}
      {showPreview && uploadedFile && (
        <Card className="mt-4">
          <Card.Header>
            <h3>File Preview</h3>
          </Card.Header>
          <Card.Body>
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(sampleData[0]).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Field Mapping */}
      {uploadedFile && (
        <Card className="mt-4">
          <Card.Header>
            <h3>Field Mapping</h3>
          </Card.Header>
          <Card.Body>
            <div className="field-mapping">
              {Object.entries(fieldMapping).map(([field, value]) => (
                <div key={field} className="mapping-row">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <select
                    value={value}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, [field]: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select Column</option>
                    {Object.keys(sampleData[0]).map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default ImportSettings
