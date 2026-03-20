export default function DocumentDetail({ document, onClose }) {
  if (!document) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{document.document_type}</p>
            <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
              {document.original_filename}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Processed {new Date(document.processed_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Confidence + anomalies */}
        {(document.confidence != null || document.anomalies?.length > 0) && (
          <div className="px-6 pt-4 pb-2 flex flex-wrap gap-3">
            {document.confidence != null && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                document.confidence >= 0.8
                  ? 'bg-green-100 text-green-700'
                  : document.confidence >= 0.5
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                {Math.round(document.confidence * 100)}% confidence
              </span>
            )}
            {document.anomalies?.map((a, i) => (
              <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full">
                ⚠ {a}
              </span>
            ))}
          </div>
        )}

        {/* Extracted fields */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Extracted Data
          </h3>
          {document.extracted_data ? (
            <ExtractedFields data={document.extracted_data} />
          ) : (
            <p className="text-gray-400 text-sm">No data extracted.</p>
          )}
        </div>

        {/* Raw JSON toggle */}
        <RawJson data={document.extracted_data} />
      </div>
    </div>
  )
}

function ExtractedFields({ data }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 gap-2 text-sm">
          <span className="text-gray-500 font-medium capitalize col-span-1">
            {key.replace(/_/g, ' ')}
          </span>
          <span className="text-gray-800 col-span-2">
            <FieldValue value={value} />
          </span>
        </div>
      ))}
    </div>
  )
}

function FieldValue({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-300">—</span>
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => (
          <li key={i}>
            {typeof item === 'object' ? (
              <span className="text-xs text-gray-600">
                {Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(' · ')}
              </span>
            ) : String(item)}
          </li>
        ))}
      </ul>
    )
  }
  if (typeof value === 'object') {
    return (
      <ul className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <li key={k} className="text-xs text-gray-600">{k}: {String(v)}</li>
        ))}
      </ul>
    )
  }
  return <span>{String(value)}</span>
}

function RawJson({ data }) {
  return (
    <details className="border-t border-gray-100">
      <summary className="px-6 py-3 text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
        View raw JSON
      </summary>
      <pre className="px-6 pb-6 text-xs text-gray-600 overflow-x-auto bg-gray-50 rounded-b-2xl">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  )
}
