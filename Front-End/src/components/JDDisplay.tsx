import React from 'react'

interface JDDisplayProps {
  content: string
}

/**
 * JDDisplay Component
 * Parses and formats the generated JD for beautiful display
 * 
 * Input: Plain text JD with sections marked by headers like "## Section Name"
 * Output: Styled HTML with proper sections and formatting
 */
export function JDDisplay({ content }: JDDisplayProps) {
  // Parse the content into sections
  const sections = parseJDContent(content)

  return (
    <div
      style={{
        color: '#d1d5db',
        lineHeight: '1.8',
        fontSize: '14px'
      }}
    >
      {sections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: '32px' }}>
          {/* Section Header */}
          {section.title && (
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#6ea8fe',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                paddingBottom: '8px',
                borderBottom: '1px solid #374151'
              }}
            >
              {section.title}
            </h3>
          )}

          {/* Section Content */}
          <div>
            {section.lines.map((line, lineIdx) => {
              // Check if line is a bullet point
              const isBullet = line.trim().startsWith('•')

              return (
                <p
                  key={lineIdx}
                  style={{
                    margin: '8px 0',
                    paddingLeft: isBullet ? '24px' : '0',
                    marginLeft: isBullet ? '0' : '0'
                  }}
                >
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

interface ParsedSection {
  title: string
  lines: string[]
}

/**
 * Parse JD content into sections
 * Sections are marked by lines starting with "##"
 */
function parseJDContent(content: string): ParsedSection[] {
  const lines = content.split('\n')
  const sections: ParsedSection[] = []

  let currentSection: ParsedSection = {
    title: '',
    lines: []
  }

  for (const line of lines) {
    // Check if this is a section header (starts with ##)
    if (line.startsWith('##')) {
      // Save previous section if it has content
      if (currentSection.title || currentSection.lines.length > 0) {
        sections.push(currentSection)
      }

      // Start new section
      const title = line.replace(/^#+\s*/, '').trim()
      currentSection = {
        title,
        lines: []
      }
    } else if (line.trim()) {
      // Add non-empty line to current section
      currentSection.lines.push(line)
    } else if (currentSection.lines.length > 0) {
      // Keep empty lines between content
      currentSection.lines.push('')
    }
  }

  // Add last section
  if (currentSection.title || currentSection.lines.length > 0) {
    sections.push(currentSection)
  }

  return sections
}
