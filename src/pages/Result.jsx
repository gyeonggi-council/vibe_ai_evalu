import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { QUIZ_QUESTIONS, SURVEY_AREAS } from '../data/questions';
import { TYPE_META } from '../utils/scoring';
import RadarChart from '../components/RadarChart';

export default function Result() {
  const navigate = useNavigate();
  const { result, quizAnswers } = useAssessment();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const meta = TYPE_META[result.resultType || result.result_type];
  const scores = result.scores || {
    basic: result.score_basic,
    utilize: result.score_utilize,
    build: result.score_build,
    extend: result.score_extend,
    operate: result.score_operate,
  };
  const totalScore = result.scores?.total || result.score_total;
  const quizScore = result.quizScore ?? result.quiz_score;
  const shareCode = result.share_code;

  const shareUrl = `${window.location.origin}/result/${shareCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyText = () => {
    const text = `[AI 바이브 코딩 역량 진단 결과]
유형: ${meta.emoji} ${meta.label}
설문 총점: ${totalScore}/45점
퀴즈 정답: ${quizScore}/10문항
결과 링크: ${shareUrl}`;
    navigator.clipboard.writeText(text);
  };

  const areaScoreData = [
    { key: 'basic', label: '질문형', color: '#3B82F6', score: scores.basic },
    { key: 'utilize', label: '활용형', color: '#10B981', score: scores.utilize },
    { key: 'build', label: '구현형', color: '#8B5CF6', score: scores.build },
    { key: 'extend', label: '확장형', color: '#F59E0B', score: scores.extend },
    { key: 'operate', label: '운영형', color: '#EF4444', score: scores.operate },
  ];

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* 상단: 유형 결과 */}
        <div
          className="text-center rounded-2xl overflow-hidden mb-8 border"
          style={{ borderColor: meta.color + '40', backgroundColor: meta.color + '10' }}
        >
          <div className="w-full max-h-64 overflow-hidden">
            <img
              src={meta.image}
              alt={meta.label}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="p-8">
            <p className="t-secondary text-sm leading-relaxed mb-6">{meta.description}</p>

            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className="text-3xl font-bold t-primary">{totalScore}</div>
                <div className="text-xs t-muted mt-1">설문 총점 / 45</div>
              </div>
              <div className="w-px bg-white/[0.06]" />
              <div>
                <div className="text-3xl font-bold t-primary">{quizScore}</div>
                <div className="text-xs t-muted mt-1">퀴즈 정답 / 10</div>
              </div>
            </div>
          </div>
        </div>

        {/* 중단: 레이더 차트 + 영역별 점수 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 glow-border">
            <h3 className="text-sm font-semibold t-secondary mb-4 text-center">영역별 점수</h3>
            <RadarChart
              scores={scores}
              bgColor={meta.color + '30'}
              borderColor={meta.color}
            />
          </div>

          <div className="space-y-3">
            {areaScoreData.map(a => (
              <div
                key={a.key}
                className="glass-card rounded-xl p-4 glow-border flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: a.color + '20', color: a.color }}
                >
                  {a.score}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium t-primary">{a.label}</div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full mt-1.5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(a.score / 9) * 100}%`, backgroundColor: a.color }}
                    />
                  </div>
                </div>
                <span className="text-xs t-muted">{a.score}/9</span>
              </div>
            ))}
          </div>
        </div>

        {/* 퀴즈 결과 */}
        <div className="glass-card rounded-2xl p-6 glow-border mb-8">
          <h3 className="text-sm font-semibold t-secondary mb-4">퀴즈 결과 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {QUIZ_QUESTIONS.map(q => {
              const userAnswer = quizAnswers[`q${q.id}`] || result.quiz_answers?.[`q${q.id}`];
              const isCorrect = userAnswer === q.answer;
              return (
                <div
                  key={q.id}
                  className={`rounded-lg p-3 text-center border ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-red-500/30 bg-red-500/10'
                  }`}
                >
                  <div className="text-xs t-muted mb-1">{q.areaLabel.split(' — ')[0]}</div>
                  <div className={`text-lg font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isCorrect ? 'O' : 'X'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추천 학습 경로 */}
        <div className="glass-card rounded-2xl p-6 glow-border mb-8">
          <h3 className="text-sm font-semibold t-secondary mb-3">추천 학습 경로</h3>
          <div className="text-sm t-muted bg-white/[0.03] rounded-lg p-3 mb-4">
            {meta.path}
          </div>
          <h3 className="text-sm font-semibold t-secondary mb-3">다음 행동 제안</h3>
          <ul className="space-y-2">
            {meta.nextActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm t-secondary">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* 공유 */}
        <div className="glass-card rounded-2xl p-6 glow-border mb-8">
          <h3 className="text-sm font-semibold t-secondary mb-4">결과 공유</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs t-muted">공유 코드:</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.06] t-primary font-mono font-bold tracking-wider">
              {shareCode}
            </span>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg text-sm font-medium btn-gradient text-white"
            >
              {copied ? '복사됨!' : '공유 링크 복사'}
            </button>
            <button
              onClick={handleCopyText}
              className="px-4 py-2 rounded-lg text-sm font-medium glass-card t-secondary hover:bg-white/[0.06]"
            >
              결과 텍스트 복사
            </button>
          </div>
        </div>

        {/* 다시 시작 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-sm t-muted hover:text-white transition underline"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
