export default function StatsBar({ stats }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <StatCard label="Total Documents" value={stats.total} />
      <StatCard label="Processed" value={stats.done} color="text-green-600" />
      <StatCard label="Failed" value={stats.failed} color="text-red-500" />
      <StatCard
        label="Avg Confidence"
        value={stats.avg_confidence != null ? `${Math.round(stats.avg_confidence * 100)}%` : '—'}
        color="text-blue-600"
      />
    </div>
  )
}

function StatCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value ?? '—'}</p>
    </div>
  )
}
