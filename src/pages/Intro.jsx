import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { TYPE_META } from '../utils/scoring';

const typeKeys = ['beginner', 'utilizer', 'builder', 'extender', 'operator'];

const inputClass = "w-full px-4 py-2.5 rounded-xl theme-input";

export default function Intro() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, resetAll } = useAssessment();
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { resetAll(); }, []);

  const handleChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!userInfo.name.trim()) errs.name = '이름을 입력해주세요.';
    if (!userInfo.organization.trim()) errs.organization = '소속 기관을 입력해주세요.';
    if (!userInfo.department.trim()) errs.department = '부서명을 입력해주세요.';
    if (!agreed) errs.agree = '개인정보 수집·이용에 동의해주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStart = () => {
    if (validate()) navigate('/survey');
  };

  return (
    <div className="min-h-screen px-4 py-10 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* 배지 */}
        <div className="text-center mb-8">
          <span className="inline-block px-5 py-2 rounded-full text-xs font-semibold tracking-[0.15em] badge-glow" style={{background:'var(--badge-bg)',color:'var(--badge-text)',border:'1px solid var(--badge-border)'}}>
            AI VIBE CODING ASSESSMENT · BETA
          </span>
        </div>

        {/* 제목 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold gradient-text mb-4 leading-tight">
            공무원 AI 바이브 코딩<br className="md:hidden" /> 역량 자가진단
          </h1>
          <p className="t-muted text-lg md:text-xl max-w-xl mx-auto">
            설문 15문항과 상황형 퀴즈 10문항으로<br className="md:hidden" /> 나의 AI 활용 역량을 진단합니다.
          </p>
        </div>

        {/* 5개 유형 카드 — 데스크탑에서 넓게 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-14">
          {typeKeys.map(key => {
            const meta = TYPE_META[key];
            return (
              <div
                key={key}
                className="glass-card rounded-2xl overflow-hidden text-center transition-all duration-300 hover:scale-[1.03] cursor-default group"
                style={{ borderColor: meta.color + '25' }}
              >
                <div className="w-full aspect-[16/10] overflow-hidden">
                  <img
                    src={meta.image}
                    alt={meta.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs md:text-sm t-muted leading-relaxed">{meta.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2열 레이아웃 — 데스크탑에서 폼 + 안내 나란히 */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-bright rounded-2xl p-6 md:p-10 glow-border">
            <h2 className="text-xl font-bold t-primary mb-1">응시자 정보 입력</h2>
            <p className="text-sm t-muted mb-6">필수 항목(*)을 입력하고 진단을 시작하세요.</p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* 이름 */}
              <div>
                <label className="block text-base t-secondary mb-1.5">
                  이름 <span className="text-indigo-400">*</span>
                </label>
                <input type="text" value={userInfo.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} placeholder="홍길동" />
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
              </div>

              {/* 소속 기관 */}
              <div>
                <label className="block text-base t-secondary mb-1.5">
                  소속 기관 <span className="text-indigo-400">*</span>
                </label>
                <input type="text" value={userInfo.organization} onChange={e => handleChange('organization', e.target.value)} className={inputClass} placeholder="OO부" />
                {errors.organization && <p className="text-xs text-rose-400 mt-1">{errors.organization}</p>}
              </div>

              {/* 부서명 */}
              <div>
                <label className="block text-base t-secondary mb-1.5">
                  부서명 <span className="text-indigo-400">*</span>
                </label>
                <input type="text" value={userInfo.department} onChange={e => handleChange('department', e.target.value)} className={inputClass} placeholder="디지털혁신과" />
                {errors.department && <p className="text-xs text-rose-400 mt-1">{errors.department}</p>}
              </div>

              {/* 직급 */}
              <div>
                <label className="block text-base t-secondary mb-1.5">직급 (선택)</label>
                <input type="text" value={userInfo.job_level} onChange={e => handleChange('job_level', e.target.value)} className={inputClass} placeholder="사무관" />
              </div>

              {/* AI 활용 경력 — 전체 폭 */}
              <div className="md:col-span-2">
                <label className="block text-base t-secondary mb-1.5">AI 활용 경력 (선택)</label>
                <select value={userInfo.experience_years} onChange={e => handleChange('experience_years', e.target.value)} className={inputClass}>
                  <option value="">선택하세요</option>
                  <option value="없음">없음</option>
                  <option value="1년 미만">1년 미만</option>
                  <option value="1~2년">1~2년</option>
                  <option value="3년 이상">3년 이상</option>
                </select>
              </div>
            </div>

            {/* 개인정보 동의 */}
            <div className="mt-5 pt-4 border-t border-white/[0.05]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => {
                    setAgreed(e.target.checked);
                    if (errors.agree) setErrors(prev => ({ ...prev, agree: null }));
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                />
                <span className="text-sm t-muted">
                  본 진단 결과는 교육 운영 및 연구 목적으로 활용됩니다.
                  <span className="text-indigo-400"> (필수)</span>
                </span>
              </label>
              {errors.agree && <p className="text-xs text-rose-400 mt-1 ml-7">{errors.agree}</p>}
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={handleStart}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-white btn-gradient text-base active:scale-[0.98]"
            >
              진단 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
