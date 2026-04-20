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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Job Posting</h1>
        <p className="text-slate-500 text-sm mt-1">Create a job description for your open position.</p>
      </div>

      {/* Hire Type Selection */}
      {!hireType && (
        <div>
          <p className="text-sm font-medium text-slate-600 mb-3">Select hiring type to get started</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setHireType('fresher')}
              className="group flex flex-col items-start gap-3 p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Hire a Fresher</p>
                <p className="text-sm text-slate-500 mt-0.5">Entry-level candidates with no prior experience requirement.</p>
              </div>
            </button>

            <button
              onClick={() => setHireType('experienced')}
              className="group flex flex-col items-start gap-3 p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-amber-100 group-hover:bg-amber-200 rounded-xl flex items-center justify-center transition-colors">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Hire Experienced</p>
                <p className="text-sm text-slate-500 mt-0.5">Candidates with specific years of industry experience.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {hireType && !generatedJD && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {hireType === 'fresher' ? (
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
              )}
              <h2 className="font-semibold text-slate-800">
                {hireType === 'fresher' ? 'Hire a Fresher' : 'Hire an Experienced Candidate'}
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change
            </button>
          </div>

          <form onSubmit={handleCreateJD} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer, Data Analyst"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Required Skills <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-xs text-slate-400 mt-1">Separate multiple skills with commas.</p>
            </div>

            {hireType === 'experienced' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Experience Required <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3+ years, 5-7 years"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  hireType === 'fresher'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
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
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Job Description Generated</p>
                <p className="text-xs text-slate-400">{generatedJD.jobTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New JD
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm leading-relaxed">
              {generatedJD.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
