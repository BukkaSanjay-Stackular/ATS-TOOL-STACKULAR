import { Briefcase, MapPin, Clock, DollarSign, FileText } from 'lucide-react'
import { FormInput } from '../ui/FormInput'
import { FormSelect } from '../ui/FormSelect'
import { FieldLabel } from '../ui/FieldLabel'
import { SectionLabel } from '../ui/SectionLabel'
import { LOCATIONS, WORK_MODES, WORK_HOURS } from '../../constants/jd'
import type { JDFormState } from './types'

interface Props {
  form: JDFormState
  setField: <K extends keyof JDFormState>(key: K, value: JDFormState[K]) => void
  fieldErrors: Record<string, string>
}

export function JDFormFields({ form, setField, fieldErrors }: Props) {
  return (
    <>
      <SectionLabel icon={Briefcase} text="Role Details" />

      {/* Job Title */}
      <div style={{ marginBottom: '20px' }}>
        <FieldLabel required>Job Title</FieldLabel>
        <FormInput
          type="text"
          value={form.job_title}
          onChange={(e) => setField('job_title', e.target.value)}
          placeholder="e.g. Frontend Developer, Data Analyst"
          error={fieldErrors.job_title}
        />
      </div>

      {/* Intern-only: Duration */}
      {form.experience_level === 'intern' && (
        <div style={{ marginBottom: '20px' }}>
          <FieldLabel required>Duration</FieldLabel>
          <FormInput
            type="text"
            value={form.duration}
            onChange={(e) => setField('duration', e.target.value)}
            placeholder="e.g. 3 months, 6 months"
          />
        </div>
      )}

      {/* Location / Work Mode / Work Hours — 3 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}
      >
        <div>
          <FieldLabel required>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin style={{ width: '11px', height: '11px' }} />
              Location
            </span>
          </FieldLabel>
          <FormSelect value={form.location} onChange={(e) => setField('location', e.target.value)}>
            <option value="" disabled>Select</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </FormSelect>
        </div>

        <div>
          <FieldLabel required>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Briefcase style={{ width: '11px', height: '11px' }} />
              Work Mode
            </span>
          </FieldLabel>
          <FormSelect value={form.work_mode} onChange={(e) => setField('work_mode', e.target.value)}>
            <option value="" disabled>Select</option>
            {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </FormSelect>
        </div>

        <div>
          <FieldLabel required>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock style={{ width: '11px', height: '11px' }} />
              Work Hours
            </span>
          </FieldLabel>
          <FormSelect value={form.work_hours} onChange={(e) => setField('work_hours', e.target.value)}>
            <option value="" disabled>Select</option>
            {WORK_HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
          </FormSelect>
        </div>
      </div>

      {/* Compensation — varies by experience level */}
      {form.experience_level === 'intern' && (
        <>
          <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
          <SectionLabel icon={DollarSign} text="Compensation" />
          <div style={{ marginBottom: '20px' }}>
            <FieldLabel>Stipend / Salary INR</FieldLabel>
            <FormInput
              type="text"
              value={form.stipend_salary}
              onChange={(e) => setField('stipend_salary', e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>
        </>
      )}

      {form.experience_level === 'experienced' && (
        <>
          <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
          <SectionLabel icon={DollarSign} text="Compensation & Experience" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <FieldLabel>Salary INR</FieldLabel>
              <FormInput
                type="text"
                value={form.fulltime_offer_salary}
                onChange={(e) => setField('fulltime_offer_salary', e.target.value)}
                placeholder="e.g. 1200000"
              />
            </div>
            <div>
              <FieldLabel required>Experience Years</FieldLabel>
              <FormInput
                type="text"
                value={form.years_of_experience}
                onChange={(e) => setField('years_of_experience', e.target.value)}
                placeholder="e.g. 3+ years, 5–8 years"
              />
            </div>
          </div>
        </>
      )}

      {form.experience_level === 'fresher' && (
        <>
          <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
          <SectionLabel icon={DollarSign} text="Compensation" />
          <div style={{ marginBottom: '20px' }}>
            <FieldLabel>Full-Time Offer Salary INR</FieldLabel>
            <FormInput
              type="text"
              value={form.fulltime_offer_salary}
              onChange={(e) => setField('fulltime_offer_salary', e.target.value)}
              placeholder="e.g. 600000"
            />
          </div>
        </>
      )}

      {/* Role Description */}
      <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
      <SectionLabel icon={FileText} text="Role Description & Requirements" />
      <div style={{ marginBottom: '24px' }}>
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={form.roleDescription}
          onChange={(e) => setField('roleDescription', e.target.value)}
          rows={6}
          placeholder="Describe the role, responsibilities, and requirements..."
          style={{
            background: '#1a1d20',
            border: '1px solid #37373f',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 14px',
            width: '100%',
            outline: 'none',
            fontFamily: 'Sora, sans-serif',
            fontSize: '14px',
            resize: 'vertical',
            lineHeight: '1.7',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
        />
        <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '6px' }}>
          Be specific about responsibilities — the AI uses this to generate the full JD.
        </p>
      </div>
    </>
  )
}
