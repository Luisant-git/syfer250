import React, { useState, useRef } from 'react';
import { Upload, Plus, X, FileText, Download, Search, Filter, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../../components/UI/Button/Button';

const ImportSettings = ({ data, onUpdate }) => {
  const [recipients, setRecipients] = useState((data && data.recipients) || []);
  const [newRecipient, setNewRecipient] = useState({ email: '', firstName: '', lastName: '', company: '', phone: '' });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValid, setFilterValid] = useState('all');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addRecipient = () => {
    if (newRecipient.email && validateEmail(newRecipient.email)) {
      // Check for duplicates
      const isDuplicate = recipients.some(r => r.email.toLowerCase() === newRecipient.email.toLowerCase());
      if (isDuplicate) {
        alert('This email address is already in the recipient list.');
        return;
      }
      
      const updatedRecipients = [...recipients, { ...newRecipient, id: Date.now(), isValid: true }];
      setRecipients(updatedRecipients);
      onUpdate({ recipients: updatedRecipients });
      setNewRecipient({ email: '', firstName: '', lastName: '', company: '', phone: '' });
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
      const companyIndex = headers.findIndex(h => h.includes('company') || h.includes('organization'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
      
      const csvRecipients = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const email = values[emailIndex] || '';
          return {
            id: Date.now() + index,
            email: email,
            firstName: values[firstNameIndex] || '',
            lastName: values[lastNameIndex] || '',
            company: values[companyIndex] || '',
            phone: values[phoneIndex] || '',
            isValid: validateEmail(email)
          };
        })
        .filter(r => r.email);
      
      // Remove duplicates and merge with existing
      const existingEmails = recipients.map(r => r.email.toLowerCase());
      const newRecipients = csvRecipients.filter(r => !existingEmails.includes(r.email.toLowerCase()));
      const duplicates = csvRecipients.length - newRecipients.length;
      
      const updatedRecipients = [...recipients, ...newRecipients];
      setRecipients(updatedRecipients);
      onUpdate({ recipients: updatedRecipients });
      
      // Show validation summary
      const invalidCount = newRecipients.filter(r => !r.isValid).length;
      const errors = [];
      if (duplicates > 0) errors.push(`${duplicates} duplicate emails skipped`);
      if (invalidCount > 0) errors.push(`${invalidCount} invalid email addresses found`);
      setValidationErrors(errors);
      
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
    const csvContent = 'email,firstName,lastName,company,phone\njohn@example.com,John,Doe,Acme Corp,+1-555-123-4567\njane@example.com,Jane,Smith,Tech Inc,+1-555-987-6543\nbob@example.com,Bob,Johnson,StartupXYZ,+1-555-456-7890';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-recipients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = !searchTerm || 
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipient.company && recipient.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterValid === 'all' || 
      (filterValid === 'valid' && recipient.isValid) ||
      (filterValid === 'invalid' && !recipient.isValid);
    
    return matchesSearch && matchesFilter;
  });

  const toggleRecipientSelection = (id) => {
    setSelectedRecipients(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredRecipients.map(r => r.id);
    setSelectedRecipients(filteredIds);
  };

  const clearSelection = () => {
    setSelectedRecipients([]);
  };

  const bulkRemoveSelected = () => {
    const updatedRecipients = recipients.filter(r => !selectedRecipients.includes(r.id));
    setRecipients(updatedRecipients);
    onUpdate({ recipients: updatedRecipients });
    setSelectedRecipients([]);
  };

  const exportRecipients = () => {
    const csvContent = 'email,firstName,lastName,company,phone,isValid\n' + 
      recipients.map(r => `${r.email},${r.firstName || ''},${r.lastName || ''},${r.company || ''},${r.phone || ''},${r.isValid}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipients-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validCount = recipients.filter(r => r.isValid).length;
  const invalidCount = recipients.length - validCount;

  return (
    <div className="import-settings">
      <h2>Import Recipients</h2>
      <p>Add recipients manually or upload a CSV file with advanced validation</p>

      {/* Manual Add */}
      <div className="manual-add" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Add Recipient Manually</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label>Email *</label>
            <input
              type="email"
              value={newRecipient.email}
              onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
              placeholder="email@example.com"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: `1px solid ${newRecipient.email && !validateEmail(newRecipient.email) ? '#dc3545' : '#ccc'}`, 
                borderRadius: '4px' 
              }}
            />
            {newRecipient.email && !validateEmail(newRecipient.email) && (
              <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>Invalid email format</div>
            )}
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
          <div>
            <label>Company</label>
            <input
              type="text"
              value={newRecipient.company}
              onChange={(e) => setNewRecipient({ ...newRecipient, company: e.target.value })}
              placeholder="Acme Corp"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              type="tel"
              value={newRecipient.phone}
              onChange={(e) => setNewRecipient({ ...newRecipient, phone: e.target.value })}
              placeholder="+1-555-123-4567"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </div>
        <Button onClick={addRecipient} disabled={!newRecipient.email || !validateEmail(newRecipient.email)}>
          <Plus size={16} />
          Add Recipient
        </Button>
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
                <p className="upload-subtext">Supports CSV files with email, firstName, lastName, company, phone columns</p>
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
              <strong>Supported CSV Format:</strong>
              <p>email, firstName, lastName, company, phone</p>
            </div>
          </div>
          <button className="download-sample" onClick={downloadSampleCSV}>
            <Download size={16} />
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={16} color="#856404" />
            <strong style={{ color: '#856404' }}>Import Summary</strong>
          </div>
          {validationErrors.map((error, index) => (
            <div key={index} style={{ color: '#856404', fontSize: '0.9rem' }}>• {error}</div>
          ))}
        </div>
      )}

      {/* Recipients List */}
      <div className="recipients-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} />
              Recipients ({recipients.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={14} />
                {validCount} valid
              </span>
              {invalidCount > 0 && (
                <span style={{ color: '#dc3545', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={14} />
                  {invalidCount} invalid
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="small" onClick={exportRecipients} disabled={recipients.length === 0}>
              <Download size={14} />
              Export
            </Button>
            {selectedRecipients.length > 0 && (
              <Button variant="outline" size="small" onClick={() => setShowBulkActions(!showBulkActions)}>
                Actions ({selectedRecipients.length})
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        {recipients.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type="text"
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.5rem 0.5rem 2.5rem', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <select
              value={filterValid}
              onChange={(e) => setFilterValid(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="all">All Recipients</option>
              <option value="valid">Valid Only</option>
              <option value="invalid">Invalid Only</option>
            </select>
          </div>
        )}

        {/* Bulk Actions */}
        {showBulkActions && selectedRecipients.length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button variant="outline" size="small" onClick={selectAllFiltered}>
                Select All Filtered
              </Button>
              <Button variant="outline" size="small" onClick={clearSelection}>
                Clear Selection
              </Button>
              <Button variant="outline" size="small" onClick={bulkRemoveSelected} style={{ color: '#dc3545', borderColor: '#dc3545' }}>
                Remove Selected
              </Button>
            </div>
          </div>
        )}

        {recipients.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No recipients added yet</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            {filteredRecipients.map((recipient) => (
              <div
                key={recipient.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #eee',
                  backgroundColor: selectedRecipients.includes(recipient.id) ? '#e3f2fd' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(recipient.id)}
                  onChange={() => toggleRecipientSelection(recipient.id)}
                  style={{ marginRight: '0.75rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: recipient.isValid ? '#000' : '#dc3545' }}>{recipient.email}</strong>
                    {recipient.isValid ? (
                      <CheckCircle size={14} color="#28a745" />
                    ) : (
                      <AlertCircle size={14} color="#dc3545" />
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    {[recipient.firstName, recipient.lastName].filter(Boolean).join(' ')}
                    {recipient.company && ` • ${recipient.company}`}
                    {recipient.phone && ` • ${recipient.phone}`}
                  </div>
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
        
        {recipients.length > 0 && filteredRecipients.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No recipients match your search criteria</p>
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
          background:  #1393caff;
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
        
        .recipients-list {
          margin-top: 2rem;
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
          
          .manual-add > div {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ImportSettings;