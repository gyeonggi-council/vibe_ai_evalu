export default function ProgressBar({ current, total, label }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm t-muted">{label}</span>
          <span className="text-sm t-muted">{current}/{total}</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full overflow-hidden" style={{background:'var(--progress-track)'}}>
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 ease-out progress-glow"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
