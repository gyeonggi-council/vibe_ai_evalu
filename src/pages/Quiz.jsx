import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { QUIZ_QUESTIONS } from '../data/questions';
import { calcScores, determineType, calcQuizScore, generateShareCode, TYPE_META } from '../utils/scoring';
import { supabase } from '../lib/supabase';
import ProgressBar from '../components/ProgressBar';

export default function Quiz() {
  const navigate = useNavigate();
  const { userInfo, surveyAnswers, quizAnswers, updateQuizAnswer, setResult } = useAssessment();
  const [currentQ, setCurrentQ] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userInfo.name) navigate('/', { replace: true });
  }, [userInfo.name, navigate]);

  // 브라우저 뒤로가기 방지
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      if (window.confirm('진단을 처음부터 다시 시작하시겠습니까?')) {
        navigate('/', { replace: true });
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const q = QUIZ_QUESTIONS[currentQ];
  const selectedAnswer = quizAnswers[`q${q.id}`];
  const isLast = currentQ === QUIZ_QUESTIONS.length - 1;

  const handleSelect = (option) => {
    updateQuizAnswer(q.id, option);
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentQ(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      const scores = calcScores(surveyAnswers);
      const resultType = determineType(scores, surveyAnswers);
      const quizScore = calcQuizScore(quizAnswers, QUIZ_QUESTIONS);
      const meta = TYPE_META[resultType];

      // share_code 생성 (중복 방지 시도)
      let shareCode;
      let attempts = 0;
      while (attempts < 5) {
        shareCode = generateShareCode();
        const { data: existing } = await supabase
          .from('responses')
          .select('id')
          .eq('share_code', shareCode)
          .maybeSingle();
        if (!existing) break;
        attempts++;
      }

      const row = {
        name: userInfo.name,
        organization: userInfo.organization,
        department: userInfo.department,
        job_level: userInfo.job_level || null,
        experience_years: userInfo.experience_years || null,
        ...Object.fromEntries(
          Array.from({ length: 15 }, (_, i) => [`q${i + 1}`, surveyAnswers[`q${i + 1}`] ?? 0])
        ),
        score_basic: scores.basic,
        score_utilize: scores.utilize,
        score_build: scores.build,
        score_extend: scores.extend,
        score_operate: scores.operate,
        score_total: scores.total,
        quiz_answers: quizAnswers,
        quiz_score: quizScore,
        result_type: resultType,
        result_label: meta.label,
        share_code: shareCode,
      };

      const { data, error: dbError } = await supabase
        .from('responses')
        .insert([row])
        .select()
        .single();

      if (dbError) throw dbError;

      setResult({
        ...data,
        scores,
        quizScore,
        resultType,
      });

      navigate('/result', { replace: true });
    } catch (err) {
      console.error('Save failed:', JSON.stringify(err, null, 2), err?.message, err?.code, err?.details, err?.hint);
      // 로컬 백업
      try {
        const scores = calcScores(surveyAnswers);
        const resultType = determineType(scores, surveyAnswers);
        const quizScore = calcQuizScore(quizAnswers, QUIZ_QUESTIONS);
        localStorage.setItem('assessment_backup', JSON.stringify({
          userInfo, surveyAnswers, quizAnswers, scores, resultType, quizScore,
          timestamp: new Date().toISOString(),
        }));
      } catch (_) {}
      setError('저장에 실패했습니다. 데이터가 로컬에 백업되었습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  // 퀴즈 9번 오류 코드 렌더링
  const renderQuestionText = (text) => {
    if (text.includes('ModuleNotFoundError') || text.includes('Error:')) {
      const parts = text.split('\n');
      return (
        <div>
          {parts.map((part, i) => {
            const trimmed = part.trim();
            if (trimmed.startsWith('ModuleNotFoundError') || trimmed.startsWith('Error:')) {
              return (
                <code key={i} className="block my-2 px-3 py-2 bg-slate-900 rounded-lg text-red-400 text-xs font-mono">
                  {trimmed}
                </code>
              );
            }
            return <span key={i}>{part}{i < parts.length - 1 && <br />}</span>;
          })}
        </div>
      );
    }
    return text;
  };

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="text-center mb-3">
            <h2 className="text-lg md:text-xl font-bold t-primary">2부 상황형 확인</h2>
          </div>
          <ProgressBar
            current={currentQ + 1}
            total={10}
            label={`${currentQ + 1}/10 문항`}
          />
        </div>

        {/* 문항 */}
        <div className="glass-card-bright rounded-2xl p-6 md:p-8 mb-6 glow-border">
          <div className="text-base t-primary leading-relaxed mb-6 font-medium">
            {renderQuestionText(q.text)}
          </div>

          {/* 선택지 */}
          <div className="space-y-3">
            {Object.entries(q.options).map(([key, text]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-base ${
                  selectedAnswer === key
                    ? 'border-indigo-400/50 bg-indigo-500/15 t-primary shadow-lg shadow-indigo-500/10 scale-[1.01]'
                    : 'border-white/[0.06] bg-white/[0.02] t-secondary hover:border-indigo-400/30 hover:bg-indigo-500/[0.06] hover:scale-[1.01] hover:shadow-md'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mr-3 ${
                  selectedAnswer === key
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/[0.08] t-muted'
                }`}>
                  {key}
                </span>
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* 이전/다음 버튼 */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentQ === 0}
            className="px-6 py-3 rounded-xl font-medium t-secondary glass-card hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            이전
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || saving}
              className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  저장 중...
                </span>
              ) : '결과 확인'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="px-8 py-3 rounded-xl font-bold text-white btn-gradient disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
