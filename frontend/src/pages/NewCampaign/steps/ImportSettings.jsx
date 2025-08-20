import React, { useState, useRef } from 'react';
import { Upload, Plus, X, FileText, Download } from 'lucide-react';
import Button from '../../../components/UI/Button/Button';

const ImportSettings = ({ data, onUpdate }) => {
  const [recipients, setRecipients] = useState((data && data.recipients) || []);
  const [newRecipient, setNewRecipient] = useState({ email: '', firstName: '', lastName: '' });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const addRecipient = () => {
    if (newRecipient.email && newRecipient.email.includes('@')) {
      const updatedRecipients = [...recipients, { ...newRecipient, id: Date.now() }];
      setRecipients(updatedRecipients);
      onUpdate({ recipients: updatedRecipients });
      setNewRecipient({ email: '', firstName: '', lastName: '' });
    }
  };

  // Initialize data if not provided
  React.useEffect(() => {
    if (!data || !data.recipients) {
      onUpdate({ recipients: [] });
    }
  }, []);

  const removeRecipient = (id) => {
    const updatedRecipients = recipients.filter(r => r.id !== id);
    setRecipients(updatedRecipients);
    onUpdate({ recipients: updatedRecipients });
  };

  const processCSVFile = (file) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const emailIndex = headers.findIndex(h => h.includes('email'));
      const firstNameIndex = headers.findIndex(h => h.includes('first') || h.includes('fname'));
      const lastNameIndex = headers.findIndex(h => h.includes('last') || h.includes('lname'));
      
      const csvRecipients = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          return {
            id: Date.now() + index,
            email: values[emailIndex] || '',
            firstName: values[firstNameIndex] || '',
            lastName: values[lastNameIndex] || ''
          };
        })
        .filter(r => r.email && r.email.includes('@'));
      
      const updatedRecipients = [...recipients, ...csvRecipients];
      setRecipients(updatedRecipients);
      onUpdate({ recipients: updatedRecipients });
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processCSVFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/csv') {
      processCSVFile(files[0]);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 'email,firstName,lastName\njohn@example.com,John,Doe\njane@example.com,Jane,Smith';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-recipients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="import-settings">
      <h2>Import Recipients</h2>
      <p>Add recipients manually or upload a CSV file</p>

      {/* Manual Add */}
      <div className="manual-add" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Add Recipient Manually</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label>Email *</label>
            <input
              type="email"
              value={newRecipient.email}
              onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
              placeholder="email@example.com"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label>First Name</label>
            <input
              type="text"
              value={newRecipient.firstName}
              onChange={(e) => setNewRecipient({ ...newRecipient, firstName: e.target.value })}
              placeholder="John"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              value={newRecipient.lastName}
              onChange={(e) => setNewRecipient({ ...newRecipient, lastName: e.target.value })}
              placeholder="Doe"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <Button onClick={addRecipient} disabled={!newRecipient.email}>
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* CSV Upload */}
      <div className="csv-upload-container">
        <div className="csv-upload-header">
          <h3>Upload CSV File</h3>
          <p>Drag and drop your CSV file or click to browse</p>
        </div>
        
        <div 
          className={`csv-dropzone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="csv-dropzone-content">
            {isUploading ? (
              <>
                <div className="upload-spinner"></div>
                <p>Processing CSV file...</p>
              </>
            ) : (
              <>
                <Upload size={48} className="upload-icon" />
                <p className="upload-text">Drop your CSV file here or click to browse</p>
                <p className="upload-subtext">Supports CSV files with email, firstName, lastName columns</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="csv-help">
          <div className="csv-format">
            <FileText size={20} />
            <div>
              <strong>Required CSV Format:</strong>
              <p>email, firstName, lastName</p>
            </div>
          </div>
          <button className="download-sample" onClick={downloadSampleCSV}>
            <Download size={16} />
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* Recipients List */}
      <div className="recipients-list">
        <h3>Recipients ({recipients.length})</h3>
        {recipients.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No recipients added yet</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div>
                  <strong>{recipient.email}</strong>
                  {(recipient.firstName || recipient.lastName) && (
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {recipient.firstName} {recipient.lastName}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .csv-upload-container {
          margin-bottom: 2rem;
          background: rgba(248, 250, 252, 0.8);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(226, 232, 240, 0.5);
        }
        
        .csv-upload-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .csv-upload-header h3 {
          color: #334155;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .csv-upload-header p {
          color: #64748b;
          margin: 0;
        }
        
        .csv-dropzone {
          border: 3px dashed #cbd5e1;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.5);
          margin-bottom: 1.5rem;
        }
        
        .csv-dropzone:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: translateY(-2px);
        }
        
        .csv-dropzone.drag-over {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }
        
        .csv-dropzone.uploading {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          cursor: not-allowed;
        }
        
        .csv-dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .upload-icon {
          color: #667eea;
          opacity: 0.7;
        }
        
        .upload-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #334155;
          margin: 0;
        }
        
        .upload-subtext {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }
        
        .upload-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .csv-help {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .csv-format {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .csv-format svg {
          color: #667eea;
        }
        
        .csv-format strong {
          color: #334155;
          font-size: 0.9rem;
        }
        
        .csv-format p {
          color: #64748b;
          font-size: 0.8rem;
          margin: 0;
          font-family: monospace;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .download-sample {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .download-sample:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        @media (max-width: 768px) {
          .csv-help {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .csv-dropzone {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ImportSettings;