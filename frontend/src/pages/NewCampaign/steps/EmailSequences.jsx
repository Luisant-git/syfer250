import React, { useState } from 'react';
import { Eye, Type, Bold, Italic, Link, List, Save, FileText, Plus } from 'lucide-react';
import Button from '../../../components/UI/Button/Button';

const EmailSequences = ({ data, onUpdate }) => {
  const [sequences, setSequences] = useState(data || [{ subject: '', content: '' }]);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [templates] = useState([
    { id: 1, name: 'Welcome Email', subject: 'Welcome to {{company}}!', content: 'Hi {{firstName}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nBest regards,\nThe Team' },
    { id: 2, name: 'Follow Up', subject: 'Following up on our conversation', content: 'Hi {{firstName}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nLet me know if you have any questions.\n\nBest regards,\n{{senderName}}' },
    { id: 3, name: 'Newsletter', subject: 'Monthly Newsletter - {{month}}', content: 'Hi {{firstName}},\n\nHere\'s what\'s new this month:\n\n- Feature updates\n- Company news\n- Upcoming events\n\nStay tuned!\n\nBest regards,\nThe Team' }
  ]);

  // Initialize data if not provided
  React.useEffect(() => {
    if (!data || data.length === 0) {
      onUpdate([{ subject: '', content: '' }]);
    }
  }, []);

  const updateSequence = (index, field, value) => {
    const updatedSequences = [...sequences];
    updatedSequences[index] = { ...updatedSequences[index], [field]: value };
    setSequences(updatedSequences);
    onUpdate(updatedSequences);
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('email-content');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = sequences[0]?.content || '';
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      updateSequence(0, 'content', before + variable + after);
    }
  };

  const applyTemplate = (template) => {
    updateSequence(0, 'subject', template.subject);
    updateSequence(0, 'content', template.content);
  };

  const variables = [
    { name: 'First Name', value: '{{firstName}}' },
    { name: 'Last Name', value: '{{lastName}}' },
    { name: 'Email', value: '{{email}}' },
    { name: 'Company', value: '{{company}}' },
    { name: 'Phone', value: '{{phone}}' },
    { name: 'Custom Field 1', value: '{{custom1}}' },
    { name: 'Custom Field 2', value: '{{custom2}}' }
  ];

  const renderPreviewContent = (content) => {
    return content
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john@example.com')
      .replace(/{{company}}/g, 'Acme Corp')
      .replace(/{{phone}}/g, '+1 (555) 123-4567')
      .replace(/{{custom1}}/g, 'Custom Value 1')
      .replace(/{{custom2}}/g, 'Custom Value 2');
  };

  return (
    <div className="email-sequences">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>Email Content</h2>
          <p>Create your email content with personalization and templates</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="small" onClick={() => setShowVariables(!showVariables)}>
            <Type size={16} />
            Variables
          </Button>
          <Button variant="outline" size="small" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={16} />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      {/* Email Templates */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} />
          Email Templates
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#ccc'}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{template.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{template.subject}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showVariables ? '1fr 300px' : '1fr', gap: '1rem' }}>
        {/* Email Form */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Subject Line *
            </label>
            <input
              type="text"
              value={sequences[0]?.subject || ''}
              onChange={(e) => updateSequence(0, 'subject', e.target.value)}
              placeholder="Enter email subject line (use {{firstName}} for personalization)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email Content *
            </label>
            <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
              {/* Simple Toolbar */}
              <div style={{ padding: '0.5rem', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', display: 'flex', gap: '0.5rem' }}>
                <button type="button" style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }} title="Bold">
                  <Bold size={16} />
                </button>
                <button type="button" style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }} title="Italic">
                  <Italic size={16} />
                </button>
                <button type="button" style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }} title="List">
                  <List size={16} />
                </button>
                <button type="button" style={{ padding: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }} title="Link">
                  <Link size={16} />
                </button>
              </div>
              <textarea
                id="email-content"
                value={sequences[0]?.content || ''}
                onChange={(e) => updateSequence(0, 'content', e.target.value)}
                placeholder="Enter your email content here...\n\nTip: Use variables like {{firstName}} to personalize your emails"
                rows={12}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              Character count: {(sequences[0]?.content || '').length} | Word count: {(sequences[0]?.content || '').split(' ').filter(word => word.length > 0).length}
            </div>
          </div>
        </div>

        {/* Variables Panel */}
        {showVariables && (
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Type size={16} />
              Personalization Variables
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Click to insert into email content:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {variables.map((variable, index) => (
                <button
                  key={index}
                  onClick={() => insertVariable(variable.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: 'bold' }}>{variable.name}</div>
                  <div style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace' }}>{variable.value}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} />
            Email Preview
          </h4>
          <div style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
              <strong>Subject:</strong> {sequences[0]?.subject ? renderPreviewContent(sequences[0].subject) : 'No subject'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {sequences[0]?.content ? renderPreviewContent(sequences[0].content) : 'No content'}
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
            Preview shows how the email will look with sample data (John Doe, john@example.com, etc.)
          </div>
        </div>
      )}

      {/* Email Statistics */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #c3e6c3' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d5a2d' }}>Email Analysis</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
          <div>
            <strong>Subject Length:</strong> {(sequences[0]?.subject || '').length} chars
            <div style={{ color: '#666', fontSize: '0.8rem' }}>Recommended: 30-50 chars</div>
          </div>
          <div>
            <strong>Content Length:</strong> {(sequences[0]?.content || '').length} chars
            <div style={{ color: '#666', fontSize: '0.8rem' }}>Recommended: 50-200 words</div>
          </div>
          <div>
            <strong>Variables Used:</strong> {(sequences[0]?.content || '').match(/{{\w+}}/g)?.length || 0}
            <div style={{ color: '#666', fontSize: '0.8rem' }}>More personalization = better engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSequences;