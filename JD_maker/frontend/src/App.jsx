import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  Document, Page, View, Text, StyleSheet, PDFDownloadLink, Svg, Path, Rect,
} from '@react-pdf/renderer';
import { Copy, FileText, Download } from 'lucide-react';

// ─── 1. Markdown → HTML (for ReactQuill preview) ─────────────────────────────

function markdownToHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inUl = false;

  const closeUl = () => { if (inUl) { html += '</ul>'; inUl = false; } };
  const inline = (t) => t
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('### ')) { closeUl(); html += `<h3>${inline(line.slice(4))}</h3>`; }
    else if (line.startsWith('## ')) { closeUl(); html += `<h2>${inline(line.slice(3))}</h2>`; }
    else if (line.startsWith('# ')) { closeUl(); html += `<h1>${inline(line.slice(2))}</h1>`; }
    else if (/^[-•*]\s/.test(line)) {
      if (!inUl) { html += '<ul>'; inUl = true; }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else if (/^\d+\.\s/.test(line)) {
      if (!inUl) { html += '<ul>'; inUl = true; }
      html += `<li>${inline(line.replace(/^\d+\.\s/, ''))}</li>`;
    } else if (line.trim() === '') {
      closeUl();
    } else {
      closeUl(); html += `<p>${inline(line)}</p>`;
    }
  }
  closeUl();
  return html;
}

// ─── 2. ReactQuill HTML → Structured Blocks (for PDF renderer) ───────────────

function getSegments(node) {
  const segments = [];
  const walk = (n) => {
    if (n.nodeType === 3 && n.textContent) {
      segments.push({ text: n.textContent, bold: false, italic: false });
    } else if (n.nodeType === 1) {
      const tag = n.tagName.toLowerCase();
      if (tag === 'strong' || tag === 'b') {
        segments.push({ text: n.textContent, bold: true, italic: false });
      } else if (tag === 'em' || tag === 'i') {
        segments.push({ text: n.textContent, bold: false, italic: true });
      } else {
        Array.from(n.childNodes).forEach(walk);
      }
    }
  };
  Array.from(node.childNodes).forEach(walk);
  return segments.length ? segments : [{ text: node.textContent || '', bold: false, italic: false }];
}

function htmlToBlocks(html) {
  if (!html || typeof document === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.querySelector('div');
  const blocks = [];

  const processNode = (node) => {
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    const text = node.textContent?.trim() || '';

    if (tag === 'h1') blocks.push({ type: 'h1', segments: getSegments(node) });
    else if (tag === 'h2') blocks.push({ type: 'h2', segments: getSegments(node) });
    else if (tag === 'h3') blocks.push({ type: 'h3', segments: getSegments(node) });
    else if (tag === 'p' && text) blocks.push({ type: 'p', segments: getSegments(node) });
    else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(node.querySelectorAll('li')).map(getSegments);
      if (items.length) blocks.push({ type: 'ul', items });
    } else if (tag === 'div' || tag === 'section' || tag === 'article') {
      Array.from(node.children).forEach(processNode);
    }
  };

  Array.from(container.children).forEach(processNode);
  return blocks;
}

// ─── 3. @react-pdf/renderer — PDF Template with Stackular Logo ───────────────

const pdf = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 50,
    color: '#000000',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: '#0F172A',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  h1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    marginBottom: 10,
  },
  h2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginTop: 14,
    marginBottom: 5,
  },
  h3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 4,
  },
  p: {
    marginBottom: 5,
    lineHeight: 1.6,
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    lineHeight: 1.6,
  },
  listText: {
    flex: 1,
    lineHeight: 1.6,
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique' },
});

const Segments = ({ segments, style }) => (
  <Text style={style}>
    {(segments || []).map((seg, i) => (
      <Text
        key={i}
        style={seg.bold ? pdf.bold : seg.italic ? pdf.italic : undefined}
      >
        {seg.text}
      </Text>
    ))}
  </Text>
);

const PdfLogo = () => (
  <View style={pdf.header}>
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {/* Two chevrons forming a "> >" shape, matching Stackular branding */}
      <Path
        d="M3 5 L11 12 L3 19"
        stroke="#2563EB"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M11 5 L19 12 L11 19"
        stroke="#1D4ED8"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
    <Text style={pdf.logoText}>STACKULAR</Text>
  </View>
);

const JDDocument = ({ blocks }) => (
  <Document>
    <Page size="A4" style={pdf.page}>
      <PdfLogo />
      <View style={pdf.divider} />

      {blocks.map((block, i) => {
        if (block.type === 'h1') {
          return <Segments key={i} segments={block.segments} style={pdf.h1} />;
        }
        if (block.type === 'h2') {
          return <Segments key={i} segments={block.segments} style={pdf.h2} />;
        }
        if (block.type === 'h3') {
          return <Segments key={i} segments={block.segments} style={pdf.h3} />;
        }
        if (block.type === 'p') {
          return <Segments key={i} segments={block.segments} style={pdf.p} />;
        }
        if (block.type === 'ul') {
          return (
            <View key={i}>
              {block.items.map((item, j) => (
                <View key={j} style={pdf.listRow}>
                  <Text style={pdf.bullet}>•  </Text>
                  <Segments segments={item} style={pdf.listText} />
                </View>
              ))}
            </View>
          );
        }
        return null;
      })}
    </Page>
  </Document>
);

// ─── 4. Main App Component ────────────────────────────────────────────────────

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
    additional_notes: '',
  });

  const [jdHtml, setJdHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Derive PDF blocks live from the Quill editor HTML
  // so the PDF always reflects whatever is currently in the editor
  const pdfBlocks = useMemo(() => htmlToBlocks(jdHtml), [jdHtml]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setJdHtml(markdownToHtml(data.generated_jd));
      } else {
        alert('Error generating JD: ' + data.detail);
      }
    } catch (error) {
      alert('Failed to connect to backend server: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = new DOMParser()
      .parseFromString(jdHtml, 'text/html')
      .body.textContent || '';
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filename = `${formData.role_title || 'Job_Description'}.pdf`;

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>
            {/* Inline Stackular Logo for the UI */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
              <path d="M3 5L11 12L3 19" stroke="#4F46E5" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 5L19 12L11 19" stroke="#6366F1" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            JD Form Builder
          </h1>
        </div>

        <div className="sidebar-content">
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Role Title *</label>
              <input required type="text" name="role_title" className="form-control"
                value={formData.role_title} onChange={handleInputChange}
                placeholder="e.g. AI/ML Intern – Agentic AI" />
            </div>

            <div className="form-group">
              <label>Department / Team *</label>
              <input required type="text" name="department" className="form-control"
                value={formData.department} onChange={handleInputChange}
                placeholder="e.g. Product Engineering" />
            </div>

            <div className="form-group">
              <label>Employment Type</label>
              <select name="employment_type" className="form-control"
                value={formData.employment_type} onChange={handleInputChange}>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {formData.employment_type === 'Internship' && (
              <div className="form-group">
                <label>Duration</label>
                <input type="text" name="duration" className="form-control"
                  value={formData.duration} onChange={handleInputChange}
                  placeholder="e.g. 6 Months" />
              </div>
            )}

            <div className="form-group">
              <label>Location *</label>
              <input required type="text" name="location" className="form-control"
                value={formData.location} onChange={handleInputChange}
                placeholder="e.g. Hyderabad, India" />
            </div>

            <div className="form-group">
              <label>Work Mode</label>
              <select name="work_mode" className="form-control"
                value={formData.work_mode} onChange={handleInputChange}>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label>Working Hours</label>
              <input type="text" name="working_hours" className="form-control"
                value={formData.working_hours} onChange={handleInputChange}
                placeholder="e.g. 11:00 AM – 8:00 PM" />
            </div>

            <div className="form-group">
              <label>Compensation / Stipend</label>
              <input type="text" name="compensation" className="form-control"
                value={formData.compensation} onChange={handleInputChange}
                placeholder="e.g. ₹35,000 / Month" />
            </div>

            <div className="form-group">
              <label>Full-Time Offer Details</label>
              <input type="text" name="full_time_offer_details" className="form-control"
                value={formData.full_time_offer_details} onChange={handleInputChange}
                placeholder="e.g. ₹50,000/Month based on performance" />
            </div>

            <div className="form-group">
              <label>Key Responsibilities</label>
              <textarea name="responsibilities" className="form-control"
                value={formData.responsibilities} onChange={handleInputChange}
                placeholder="List 3–5 key duties" />
            </div>

            <div className="form-group">
              <label>Required Skills *</label>
              <textarea required name="required_skills" className="form-control"
                value={formData.required_skills} onChange={handleInputChange}
                placeholder="Core technical and soft skills" />
            </div>

            <div className="form-group">
              <label>Nice to Have Skills</label>
              <textarea name="nice_to_have_skills" className="form-control"
                value={formData.nice_to_have_skills} onChange={handleInputChange}
                placeholder="Bonus / good-to-have skills" />
            </div>

            <div className="form-group">
              <label>Who Can Apply</label>
              <textarea name="who_can_apply" className="form-control"
                value={formData.who_can_apply} onChange={handleInputChange}
                placeholder="Target applicant profile" />
            </div>

            <div className="form-group">
              <label>Company Tone</label>
              <select name="tone" className="form-control"
                value={formData.tone} onChange={handleInputChange}>
                <option value="Professional and Corporate">Professional & Corporate</option>
                <option value="Friendly, Energetic, and Modern">Friendly & Energetic</option>
                <option value="Technical and Deep-Dive">Technical Deep-Dive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea name="additional_notes" className="form-control"
                value={formData.additional_notes} onChange={handleInputChange}
                placeholder="Any specific instructions for the LLM?" />
            </div>

            <button type="submit" className="btn" disabled={isGenerating}>
              {isGenerating ? <div className="spinner" /> : 'Generate Job Description'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="main-content">
        <div className="editor-toolbar">
          <h2>JD Preview</h2>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={copyToClipboard} disabled={!jdHtml}>
              <Copy size={15} /> Copy
            </button>

            {/* react-pdf PDFDownloadLink replaces html2pdf */}
            {jdHtml ? (
              <PDFDownloadLink
                document={<JDDocument blocks={pdfBlocks} />}
                fileName={filename}
                className="btn"
              >
                {({ loading }) =>
                  loading ? (
                    <><div className="spinner" /> Preparing…</>
                  ) : (
                    <><Download size={15} /> Download PDF</>
                  )
                }
              </PDFDownloadLink>
            ) : (
              <button className="btn" disabled>
                <Download size={15} /> Download PDF
              </button>
            )}
          </div>
        </div>

        <div className="editor-container">
          {jdHtml ? (
            <div className="document-page">
              {/* Always-visible Stackular logo header */}
              <div className="doc-brand-header">
                <div className="doc-brand-logo">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M3 5L11 12L3 19" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 5L19 12L11 19" stroke="#1D4ED8" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="doc-brand-name">STACKULAR</span>
                </div>
              </div>

              <div className="doc-brand-divider" />

              <div className="quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={jdHtml}
                  onChange={setJdHtml}
                />
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={56} style={{ marginBottom: '1rem', opacity: 0.35 }} />
              <h3>No Job Description Yet</h3>
              <p>Fill out the form and click "Generate Job Description" to create a formatted, downloadable JD.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;