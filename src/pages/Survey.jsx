import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { SURVEY_QUESTIONS, SURVEY_AREAS, SCORE_LABELS } from '../data/questions';
import ProgressBar from '../components/ProgressBar';

export default function Survey() {
  const navigate = useNavigate();
  const { surveyAnswers, updateSurveyAnswer, userInfo } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!userInfo.name) navigate('/', { replace: true });
  }, [userInfo.name, navigate]);

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

  const area = SURVEY_AREAS[currentStep];
  const areaQuestions = SURVEY_QUESTIONS.filter(q => q.area === area.key);
  const totalAnswered = Object.keys(surveyAnswers).length;

  const allAreaAnswered = areaQuestions.every(
    q => surveyAnswers[`q${q.id}`] !== undefined
  );

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      navigate('/quiz');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) { setCurrentStep(prev => prev - 1); window.scrollTo(0, 0); }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <span className="text-sm t-muted font-medium">1부 자가진단 설문</span>
          </div>
          <ProgressBar current={totalAnswered} total={15} label={`${totalAnswered}/15 문항 완료`} />
        </div>

        {/* 영역 스텝 도트 */}
        <div className="flex justify-center gap-2 mb-8">
          {SURVEY_AREAS.map((a, i) => (
            <button
              key={a.key}
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === currentStep
                  ? 'text-white scale-105'
                  : i < currentStep
                  ? 't-secondary opacity-60'
                  : 't-muted opacity-40'
              }`}
              style={i === currentStep ? { backgroundColor: a.color + '20', color: a.color, boxShadow: `0 0 12px ${a.color}20` } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: i <= currentStep ? a.color : 'rgba(255,255,255,0.1)' }} />
              <span className="hidden md:inline">{a.label}</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* 현재 영역 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: area.color }}>
            {area.label}
          </h2>
          <p className="text-xs t-muted">
            각 문항에 대해 자신의 경험 수준을 선택해주세요.
          </p>
        </div>

        {/* 척도 안내 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SCORE_LABELS.map(s => (
            <span key={s.value} className="text-[11px] t-muted bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
              {s.value}점 = {s.label}
            </span>
          ))}
        </div>

        {/* 문항 */}
        <div className="space-y-5">
          {areaQuestions.map((q) => {
            const key = `q${q.id}`;
            const selected = surveyAnswers[key];
            return (
              <div key={q.id} className="glass-card rounded-2xl p-5 md:p-6">
                <div className="flex gap-3 mb-4">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: area.color + '15', color: area.color }}
                  >
                    {q.id}
                  </span>
                  <p className="text-sm t-secondary leading-relaxed">{q.text}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SCORE_LABELS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateSurveyAnswer(q.id, s.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all border ${
                        selected === s.value
                          ? 'text-white border-transparent shadow-lg scale-[1.02]'
                          : 't-muted border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                      style={
                        selected === s.value
                          ? { backgroundColor: area.color, boxShadow: `0 4px 20px ${area.color}35` }
                          : {}
                      }
                    >
                      <span className="block text-lg font-bold mb-0.5">{s.value}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 이전/다음 버튼 */}
        <div className="flex justify-between mt-8 gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-xl font-medium t-secondary glass-card hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!allAreaAnswered}
            className="px-8 py-3 rounded-xl font-bold text-white btn-gradient disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {currentStep < 4 ? '다음 영역' : '2부 퀴즈로 이동'}
          </button>
        </div>
      </div>
    </div>
  );
}
