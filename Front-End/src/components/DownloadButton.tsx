import { useState } from 'react'
import { Download } from 'lucide-react'
import { getPdf } from '../services/jdApi'
import { useToast } from '../hooks/useToast'
import { ApiError } from '../types/api'

interface Props {
  draftId: string
  jobTitle: string
}

export function DownloadButton({ draftId, jobTitle }: Props) {
  const [downloading, setDownloading] = useState(false)
  const { showToast } = useToast()

  async function handleDownload() {
    setDownloading(true)
    try {
      const blob = await getPdf(draftId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${jobTitle.replace(/\s+/g, '_')}_JD.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Download failed, try again'
      showToast(msg, 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#e5e7eb',
        background: 'transparent',
        border: '1px solid #37373f',
        cursor: downloading ? 'not-allowed' : 'pointer',
        opacity: downloading ? 0.6 : 1,
        fontFamily: 'Sora, sans-serif',
      }}
      onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.borderColor = '#6b7280' }}
      onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.borderColor = '#37373f' }}
    >
      {downloading ? (
        <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <Download style={{ width: '13px', height: '13px' }} />
      )}
      {downloading ? 'Downloading...' : 'Download PDF'}
    </button>
  )
}
