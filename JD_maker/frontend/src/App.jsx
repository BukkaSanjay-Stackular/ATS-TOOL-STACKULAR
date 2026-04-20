import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Download, Copy, RefreshCw, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

function App() {
  const [formData, setFormData] = useState({
    role_title: '',
    department: '',
    employment_type: 'Full-Time',
    duration: '',
    location: '',
    work_mode: 'Hybrid',
    working_hours: '',
    compensation: '',
    full_time_offer_details: '',
    responsibilities: '',
    required_skills: '',
    nice_to_have_skills: '',
    who_can_apply: '',
    tone: 'Professional',
    additional_notes: ''
  });

  const [jdContent, setJdContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Convert Markdown response to HTML for Quill
        // Simplified mapping, assuming the LLM returns well formatted content
        const htmlContent = data.generated_jd
          .split('\n')
          .map(line => {
            if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
            if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
            if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
            if (line.trim() === '') return '<br/>';
            return `<p>${line}</p>`;
          })
          .join('')
          .replace(/<\/li><br\/><li>/g, '</li><li>') // Fix list breaks
          .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>') // Wrap lists
          .replace(/<\/ul><ul>/g, ''); // Combine adjacent lists
          
        setJdContent(htmlContent);
      } else {
        alert('Error generating JD: ' + data.detail);
      }
    } catch (error) {
      alert('Failed to connect to backend server: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('pdf-content');
    const opt = {
      margin:       [0.5, 0.5],
      filename:     `${formData.role_title || 'Job_Description'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById('pdf-content').innerText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="app-container">
      {/* Sidebar Form */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1><FileText size={24} /> Form Builder</h1>
        </div>
        
        <div className="sidebar-content">
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Role Title *</label>
              <input required type="text" name="role_title" className="form-control" value={formData.role_title} onChange={handleInputChange} placeholder="e.g. Senior Frontend Engineer" />
            </div>

            <div className="form-group">
              <label>Department / Team *</label>
              <input required type="text" name="department" className="form-control" value={formData.department} onChange={handleInputChange} placeholder="e.g. Product Engineering" />
            </div>

            <div className="form-group">
              <label>Employment Type</label>
              <select name="employment_type" className="form-control" value={formData.employment_type} onChange={handleInputChange}>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {formData.employment_type === 'Internship' && (
              <div className="form-group">
                <label>Duration</label>
                <input type="text" name="duration" className="form-control" value={formData.duration} onChange={handleInputChange} placeholder="e.g. 6 Months" />
              </div>
            )}

            <div className="form-group">
              <label>Location *</label>
              <input required type="text" name="location" className="form-control" value={formData.location} onChange={handleInputChange} placeholder="e.g. San Francisco, CA" />
            </div>

            <div className="form-group">
              <label>Work Mode</label>
              <select name="work_mode" className="form-control" value={formData.work_mode} onChange={handleInputChange}>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Compensation / Stipend</label>
              <input type="text" name="compensation" className="form-control" value={formData.compensation} onChange={handleInputChange} placeholder="e.g. $120k - $150k" />
            </div>

            <div className="form-group">
              <label>Key Responsibilities</label>
              <textarea name="responsibilities" className="form-control" value={formData.responsibilities} onChange={handleInputChange} placeholder="List 3-5 key duties"></textarea>
            </div>

            <div className="form-group">
              <label>Required Skills *</label>
              <textarea required name="required_skills" className="form-control" value={formData.required_skills} onChange={handleInputChange} placeholder="List core technical and soft skills"></textarea>
            </div>

            <div className="form-group">
              <label>Nice to Have Skills</label>
              <textarea name="nice_to_have_skills" className="form-control" value={formData.nice_to_have_skills} onChange={handleInputChange} placeholder="Bonus skills"></textarea>
            </div>

            <div className="form-group">
              <label>Company Tone</label>
              <select name="tone" className="form-control" value={formData.tone} onChange={handleInputChange}>
                <option value="Professional and Corporate">Professional & Corporate</option>
                <option value="Friendly, Energetic, and Modern">Friendly & Energetic</option>
                <option value="Technical and Deep-Dive">Technical Deep-Dive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Override / Additional Notes</label>
              <textarea name="additional_notes" className="form-control" value={formData.additional_notes} onChange={handleInputChange} placeholder="Any specific requirements for the LLM?"></textarea>
            </div>

            <button type="submit" className="btn" disabled={isGenerating}>
              {isGenerating ? <div className="spinner"></div> : 'Generate Job Description'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="editor-toolbar">
          <h2>JD Preview</h2>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={copyToClipboard} disabled={!jdContent}>
              <Copy size={16} /> Copy
            </button>
            <button className="btn" onClick={downloadPDF} disabled={!jdContent}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="editor-container">
          {jdContent ? (
            <div className="document-page">
              <div className="quill-wrapper">
                <ReactQuill 
                  theme="snow" 
                  value={jdContent} 
                  onChange={setJdContent} 
                  id="pdf-content"
                />
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>No Job Description Generated</h3>
              <p>Fill out the form on the left and click "Generate" to create a new, perfectly formatted Job Description.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
