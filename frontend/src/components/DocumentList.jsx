import { deleteDocument } from '../services/api'

const STATUS_STYLES = {
  done: 'bg-green-100 text-green-700',
  processing: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700',
}

const TYPE_STYLES = {
  invoice: 'bg-blue-100 text-blue-700',
  contract: 'bg-purple-100 text-purple-700',
  report: 'bg-indigo-100 text-indigo-700',
  receipt: 'bg-teal-100 text-teal-700',
  form: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-600',
}

function Badge({ label, styles }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles}`}>
      {label}
    </span>
  )
}

export default function DocumentList({ documents, onSelect, onDelete }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No documents yet.</p>
        <p className="text-sm mt-1">Upload a PDF above to get started.</p>
      </div>
    )
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this document?')) return
    try {
      await deleteDocument(id)
      onDelete(id)
    } catch {
      alert('Failed to delete document.')
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Filename</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              onClick={() => doc.status === 'done' && onSelect(doc)}
              className={`bg-white transition-colors ${doc.status === 'done' ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
            >
              <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">
                {doc.original_filename}
              </td>
              <td className="px-4 py-3">
                {doc.document_type
                  ? <Badge label={doc.document_type} styles={TYPE_STYLES[doc.document_type] || TYPE_STYLES.other} />
                  : <span className="text-gray-400">—</span>
                }
              </td>
              <td className="px-4 py-3">
                <Badge label={doc.status} styles={STATUS_STYLES[doc.status]} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={(e) => handleDelete(e, doc.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0h8" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
