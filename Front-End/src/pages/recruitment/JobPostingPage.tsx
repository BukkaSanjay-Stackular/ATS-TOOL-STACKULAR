import { useState } from 'react'
import { UserPlus, Award, Sparkles, RotateCcw, Copy, Check } from 'lucide-react'
import { generateJD } from '../../services/jdService'
import type { HireType, GeneratedJD } from '../../types'

export default function JobPostingPage() {
  const [hireType, setHireType] = useState<HireType | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [experience, setExperience] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedJD, setGeneratedJD] = useState<GeneratedJD | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreateJD(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const jd = await generateJD({
      jobTitle,
      requiredSkills,
      ...(hireType === 'experienced' ? { experience } : {}),
    })
    setGeneratedJD(jd)
    setLoading(false)
  }

  function handleReset() {
    setHireType(null)
    setJobTitle('')
    setRequiredSkills('')
    setExperience('')
    setGeneratedJD(null)
    setCopied(false)
  }

  async function handleCopy() {
    if (!generatedJD) return
    await navigator.clipboard.writeText(generatedJD.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    background: '#1a1d20',
    border: '1px solid #37373f',
    color: '#fff',
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Job Posting
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
          Create a job description for your open position.
        </p>
      </div>

      {/* Hire Type Selection */}
      {!hireType && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#9ca3af' }}>
            Select hiring type to get started
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setHireType('fresher')}
              className="group flex flex-col items-start gap-3 p-6 rounded-2xl text-left transition-all"
              style={{ background: '#161719', border: '2px solid #37373f' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#1a1d20' }}
              >
                <UserPlus className="w-5 h-5" style={{ color: '#6ea8fe' }} />
              </div>
              <div>
                <p className="font-semibold text-white">Hire a Fresher</p>
                <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
                  Entry-level candidates with no prior experience requirement.
                </p>
              </div>
            </button>

            <button
              onClick={() => setHireType('experienced')}
              className="group flex flex-col items-start gap-3 p-6 rounded-2xl text-left transition-all"
              style={{ background: '#161719', border: '2px solid #37373f' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#1a1d20' }}
              >
                <Award className="w-5 h-5" style={{ color: '#1d2ba4' }} />
              </div>
              <div>
                <p className="font-semibold text-white">Hire Experienced</p>
                <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
                  Candidates with specific years of industry experience.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {hireType && !generatedJD && (
        <div
          className="rounded-2xl p-6"
          style={{ background: '#161719', border: '1px solid #37373f' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#1a1d20' }}
              >
                {hireType === 'fresher' ? (
                  <UserPlus className="w-4 h-4" style={{ color: '#6ea8fe' }} />
                ) : (
                  <Award className="w-4 h-4" style={{ color: '#1d2ba4' }} />
                )}
              </div>
              <h2 className="font-semibold text-white">
                {hireType === 'fresher' ? 'Hire a Fresher' : 'Hire an Experienced Candidate'}
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: '#9ca3af' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change
            </button>
          </div>

          <form onSubmit={handleCreateJD} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#e5e7eb' }}>
                Job Title <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Analyst"
                required
                className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none transition"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#e5e7eb' }}>
                Required Skills <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                required
                className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none transition"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
              />
              <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                Separate multiple skills with commas.
              </p>
            </div>

            {hireType === 'experienced' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#e5e7eb' }}>
                  Experience Required <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3+ years, 5-7 years"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg focus:outline-none transition"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#1d2ba4' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#12219e')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#1d2ba4')}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? 'Generating JD...' : 'Create JD'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generated JD */}
      {generatedJD && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#1a1d20' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#6ea8fe' }} />
              </div>
              <div>
                <p className="font-semibold text-white">Job Description Generated</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>{generatedJD.jobTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: '#9ca3af', border: '1px solid #37373f', background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" style={{ color: '#6ea8fe' }} />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: '#1d2ba4', border: '1px solid #1d2ba4', background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New JD
              </button>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: '#161719', border: '1px solid #37373f' }}
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ color: '#e5e7eb' }}>
              {generatedJD.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
