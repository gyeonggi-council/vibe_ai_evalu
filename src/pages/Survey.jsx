import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { SURVEY_QUESTIONS, SCORE_LABELS } from '../data/questions';
import ProgressBar from '../components/ProgressBar';

export default function Survey() {
  const navigate = useNavigate();
  const { surveyAnswers, updateSurveyAnswer, userInfo } = useAssessment();

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

  const totalAnswered = Object.keys(surveyAnswers).length;
  const allAnswered = SURVEY_QUESTIONS.every(q => surveyAnswers[`q${q.id}`] !== undefined);

  const handleNext = () => {
    navigate('/quiz');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 sticky top-0 z-10 py-3 app-bg">
          <div className="text-center mb-3">
            <h2 className="text-lg md:text-xl font-bold t-primary">1부 자가진단 설문</h2>
          </div>
          <ProgressBar current={totalAnswered} total={15} label={`${totalAnswered}/15 문항 완료`} />
        </div>

        {/* 척도 안내 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SCORE_LABELS.map(s => (
            <span key={s.value} className="text-xs t-muted glass-card px-3 py-1.5 rounded-full">
              <strong>{s.value}점</strong> = {s.label}
            </span>
          ))}
        </div>

        {/* 전체 15문항 */}
        <div className="space-y-5">
          {SURVEY_QUESTIONS.map((q) => {
            const key = `q${q.id}`;
            const selected = surveyAnswers[key];
            return (
              <div key={q.id} className="glass-card rounded-2xl p-5 md:p-6">
                <div className="flex gap-3 mb-5">
                  <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-500/15 text-indigo-500">
                    {q.id}
                  </span>
                  <p className="text-base t-primary leading-relaxed font-medium">{q.text}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {SCORE_LABELS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateSurveyAnswer(q.id, s.value)}
                      className={`py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer
                        ${selected === s.value
                          ? 'text-white border-transparent shadow-lg scale-[1.03]'
                          : 't-muted border-white/[0.06] bg-white/[0.02] hover:scale-[1.05] hover:border-indigo-400/30 hover:bg-indigo-500/[0.06] hover:shadow-md'
                        }`}
                      style={
                        selected === s.value
                          ? { backgroundColor: '#6366f1', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }
                          : {}
                      }
                    >
                      <span className="block text-xl font-bold mb-0.5">{s.value}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleNext}
            disabled={!allAnswered}
            className="px-10 py-3.5 rounded-xl font-bold text-white text-base btn-gradient disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            2부 퀴즈로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
