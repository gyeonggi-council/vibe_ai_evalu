import { TYPE_META } from '../utils/scoring';

export default function TypeCard({ typeKey, compact = false }) {
  const meta = TYPE_META[typeKey];
  if (!meta) return null;

  if (compact) {
    return (
      <div
        className="rounded-xl p-4 border text-left"
        style={{ borderColor: meta.color + '40', backgroundColor: meta.color + '10' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{meta.emoji}</span>
          <span className="font-semibold text-white text-sm">{meta.label}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{meta.description}</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 border text-center"
      style={{ borderColor: meta.color + '60', backgroundColor: meta.color + '15' }}
    >
      <div className="text-5xl mb-3">{meta.emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2">{meta.label}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{meta.description}</p>
      <div className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3">
        <div className="font-medium text-slate-300 mb-1">추천 학습 경로</div>
        {meta.path}
      </div>
    </div>
  );
}
