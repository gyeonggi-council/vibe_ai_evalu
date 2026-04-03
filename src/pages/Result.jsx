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
  const shareText = `[AI 바이브 코딩 역량 진단 결과] ${meta.emoji} ${meta.label} | 설문 ${totalScore}/45점, 퀴즈 ${quizScore}/10`;

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
            <p className="t-secondary text-base leading-relaxed mb-6">{meta.description}</p>

            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-4xl font-bold t-primary">{totalScore}</div>
                <div className="text-sm t-muted mt-1">설문 총점 / 45</div>
              </div>
              <div className="w-px bg-white/[0.06]" />
              <div>
                <div className="text-4xl font-bold t-primary">{quizScore}</div>
                <div className="text-sm t-muted mt-1">퀴즈 정답 / 10</div>
              </div>
            </div>
          </div>
        </div>

        {/* 중단: 레이더 차트 + 영역별 점수 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 glow-border">
            <h3 className="text-base font-bold t-primary mb-4 text-center">영역별 점수</h3>
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
                  <div className="text-base font-semibold t-primary">{a.label}</div>
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
          <h3 className="text-base font-bold t-primary mb-4">퀴즈 결과 요약</h3>
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
          <h3 className="text-base font-bold t-primary mb-3">추천 학습 경로</h3>
          <div className="text-sm t-muted bg-white/[0.03] rounded-lg p-3 mb-4">
            {meta.path}
          </div>
          <h3 className="text-base font-bold t-primary mb-3">다음 행동 제안</h3>
          <ul className="space-y-2">
            {meta.nextActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-base t-secondary">
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
          <h3 className="text-base font-bold t-primary mb-5">결과 공유하기</h3>

          {/* SNS 공유 버튼 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <button
              onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl glass-card hover:bg-indigo-500/[0.08] hover:scale-[1.03] hover:border-indigo-400/30 transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#2AABEE"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.13.833.942z"/></svg>
              <span className="text-sm font-medium t-secondary">텔레그램</span>
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl glass-card hover:bg-indigo-500/[0.08] hover:scale-[1.03] hover:border-indigo-400/30 transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.018 1.792-4.687 4.533-4.687 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.93-1.956 1.886v2.276h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              <span className="text-sm font-medium t-secondary">페이스북</span>
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl glass-card hover:bg-indigo-500/[0.08] hover:scale-[1.03] hover:border-indigo-400/30 transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="t-primary"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span className="text-sm font-medium t-secondary">X (트위터)</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl glass-card hover:bg-indigo-500/[0.08] hover:scale-[1.03] hover:border-indigo-400/30 transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="t-primary"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              <span className="text-sm font-medium t-secondary">{copied ? '복사됨!' : '링크 복사'}</span>
            </button>
          </div>

          {/* 결과 저장 */}
          <button
            onClick={handleCopyText}
            className="w-full py-3 rounded-xl text-sm font-medium glass-card t-secondary hover:bg-indigo-500/[0.06] hover:scale-[1.01] transition-all duration-200"
          >
            결과 텍스트 복사하여 저장하기
          </button>
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
