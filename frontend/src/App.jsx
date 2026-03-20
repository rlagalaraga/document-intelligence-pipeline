import { useState, useEffect } from 'react'
import { getDocuments, getStats, exportDocuments } from './services/api'
import { useAuth } from './context/AuthContext'
import UploadZone from './components/UploadZone'
import DocumentList from './components/DocumentList'
import DocumentDetail from './components/DocumentDetail'
import StatsBar from './components/StatsBar'

export default function App() {
  const { user, logout } = useAuth()
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([getDocuments(), getStats()])
      setDocuments(docsRes.data)
      setStats(statsRes.data)
    } catch {
      setError('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev])
    getStats().then(({ data }) => setStats(data))
  }

  const handleDelete = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    if (selectedDoc?.id === id) setSelectedDoc(null)
    getStats().then(({ data }) => setStats(data))
  }

  const handleExport = async () => {
    const { data } = await exportDocuments()
    const url = URL.createObjectURL(new Blob([data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'documents.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Document Intelligence</h1>
            <p className="text-sm text-gray-400 mt-0.5">AI-powered business document extraction</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-full">
              Powered by Claude AI
            </span>
            <span className="text-sm text-gray-500">{user?.username}</span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <StatsBar stats={stats} />

        <UploadZone onUploadComplete={handleUploadComplete} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Documents
          </h2>
          <button
            onClick={handleExport}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <DocumentList
            documents={documents}
            onSelect={setSelectedDoc}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Detail modal */}
      {selectedDoc && (
        <DocumentDetail
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  )
}
