import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { TYPE_META } from '../utils/scoring';
import { QUIZ_QUESTIONS, SURVEY_QUESTIONS } from '../data/questions';
import RadarChart from '../components/RadarChart';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PAGE_SIZE = 20;

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterOrg, setFilterOrg] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  // 로그인 처리
  const handleLogin = async () => {
    setAuthError('');
    const { data } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (data && data.value === password) {
      sessionStorage.setItem('adminAuth', 'true');
      setAuthed(true);
    } else {
      setAuthError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setAuthed(false);
    setPassword('');
  };

  // 데이터 로드
  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from('responses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filterOrg) query = query.ilike('organization', `%${filterOrg}%`);
    if (filterType) query = query.eq('result_type', filterType);
    if (filterDateFrom) query = query.gte('created_at', filterDateFrom + 'T00:00:00');
    if (filterDateTo) query = query.lte('created_at', filterDateTo + 'T23:59:59');

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (!error) {
      setResponses(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  // 전체 데이터 (KPI/차트용)
  const [allData, setAllData] = useState([]);
  const fetchAll = async () => {
    let query = supabase.from('responses').select('*');
    if (filterOrg) query = query.ilike('organization', `%${filterOrg}%`);
    if (filterType) query = query.eq('result_type', filterType);
    if (filterDateFrom) query = query.gte('created_at', filterDateFrom + 'T00:00:00');
    if (filterDateTo) query = query.lte('created_at', filterDateTo + 'T23:59:59');
    const { data } = await query;
    setAllData(data || []);
  };

  useEffect(() => {
    if (authed) {
      fetchData();
      fetchAll();
    }
  }, [authed, page, filterOrg, filterType, filterDateFrom, filterDateTo]);

  // KPI 계산
  const kpi = useMemo(() => {
    if (!allData.length) return { total: 0, today: 0, avgScore: 0, avgQuiz: 0, topType: '-' };
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = allData.filter(r => r.created_at?.slice(0, 10) === today).length;
    const avgScore = (allData.reduce((s, r) => s + (r.score_total || 0), 0) / allData.length).toFixed(1);
    const avgQuiz = ((allData.reduce((s, r) => s + (r.quiz_score || 0), 0) / allData.length / 10) * 100).toFixed(0);

    const typeCounts = {};
    allData.forEach(r => { typeCounts[r.result_type] = (typeCounts[r.result_type] || 0) + 1; });
    const topTypeKey = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topType = TYPE_META[topTypeKey]?.label || '-';

    return { total: allData.length, today: todayCount, avgScore, avgQuiz, topType };
  }, [allData]);

  // 유형별 분포
  const typeDistData = useMemo(() => {
    const counts = { beginner: 0, utilizer: 0, builder: 0, extender: 0, operator: 0 };
    allData.forEach(r => { if (counts[r.result_type] !== undefined) counts[r.result_type]++; });
    return {
      labels: Object.keys(counts).map(k => TYPE_META[k]?.label || k),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map(k => TYPE_META[k]?.color || '#666'),
        borderWidth: 0,
      }],
    };
  }, [allData]);

  // 영역별 평균
  const avgScores = useMemo(() => {
    if (!allData.length) return { basic: 0, utilize: 0, build: 0, extend: 0, operate: 0 };
    const n = allData.length;
    return {
      basic: +(allData.reduce((s, r) => s + (r.score_basic || 0), 0) / n).toFixed(1),
      utilize: +(allData.reduce((s, r) => s + (r.score_utilize || 0), 0) / n).toFixed(1),
      build: +(allData.reduce((s, r) => s + (r.score_build || 0), 0) / n).toFixed(1),
      extend: +(allData.reduce((s, r) => s + (r.score_extend || 0), 0) / n).toFixed(1),
      operate: +(allData.reduce((s, r) => s + (r.score_operate || 0), 0) / n).toFixed(1),
    };
  }, [allData]);

  // CSV 다운로드
  const handleExportCSV = () => {
    const headers = [
      '응시일시', '이름', '소속', '부서', '직급', '경력',
      ...Array.from({ length: 15 }, (_, i) => `q${i + 1}`),
      '질문형', '활용형', '구현형', '확장형', '운영형', '총점', '퀴즈점수', '판정유형',
    ];
    const rows = allData.map(r => [
      r.created_at?.slice(0, 19).replace('T', ' '),
      r.name, r.organization, r.department, r.job_level || '', r.experience_years || '',
      ...Array.from({ length: 15 }, (_, i) => r[`q${i + 1}`] ?? ''),
      r.score_basic, r.score_utilize, r.score_build, r.score_extend, r.score_operate,
      r.score_total, r.quiz_score, r.result_label || '',
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `진단결과_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 로그인 화면
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm glass-card-bright rounded-2xl p-8 glow-border">
          <h2 className="text-xl font-bold t-primary text-center mb-6">관리자 로그인</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호를 입력하세요"
            className="w-full px-4 py-3 rounded-lg theme-input text-sm focus:outline-none focus:border-indigo-500 mb-4"
          />
          {authError && <p className="text-xs text-red-400 mb-4">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl font-semibold text-white btn-gradient transition"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold t-primary">관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm glass-card t-secondary hover:bg-slate-600 transition"
          >
            로그아웃
          </button>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: '전체 응시자', value: kpi.total, suffix: '명' },
            { label: '오늘 응시자', value: kpi.today, suffix: '명' },
            { label: '평균 총점', value: kpi.avgScore, suffix: '/45' },
            { label: '퀴즈 정답률', value: kpi.avgQuiz, suffix: '%' },
            { label: '최다 유형', value: kpi.topType, suffix: '' },
          ].map((k, i) => (
            <div key={i} className="glass-card rounded-xl p-4 glow-border text-center">
              <div className="text-xs t-muted mb-1">{k.label}</div>
              <div className="text-2xl font-bold t-primary">
                {k.value}<span className="text-sm font-normal t-muted">{k.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 차트 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 glow-border">
            <h3 className="text-sm font-semibold t-secondary mb-4">유형별 분포</h3>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={typeDistData}
                options={{
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } },
                  },
                }}
              />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 glow-border">
            <h3 className="text-sm font-semibold t-secondary mb-4">영역별 평균 점수</h3>
            <RadarChart scores={avgScores} />
          </div>
        </div>

        {/* 필터 */}
        <div className="glass-card rounded-xl p-4 glow-border mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs t-muted mb-1">기관 검색</label>
              <input
                type="text"
                value={filterOrg}
                onChange={e => { setFilterOrg(e.target.value); setPage(0); }}
                placeholder="기관명"
                className="px-3 py-2 rounded-lg theme-input text-sm focus:outline-none focus:border-indigo-500 w-36"
              />
            </div>
            <div>
              <label className="block text-xs t-muted mb-1">유형 필터</label>
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(0); }}
                className="px-3 py-2 rounded-lg theme-input text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">전체</option>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs t-muted mb-1">시작일</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => { setFilterDateFrom(e.target.value); setPage(0); }}
                className="px-3 py-2 rounded-lg theme-input text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs t-muted mb-1">종료일</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => { setFilterDateTo(e.target.value); setPage(0); }}
                className="px-3 py-2 rounded-lg theme-input text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition"
            >
              CSV 다운로드
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="glass-card rounded-2xl glow-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['응시 일시', '이름', '소속', '부서', '총점', '퀴즈', '판정유형', '상세'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium t-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center t-muted">
                    <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : responses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center t-muted">데이터가 없습니다.</td>
                </tr>
              ) : (
                responses.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.06]/50 hover:bg-[var(--table-row-hover)]">
                    <td className="px-4 py-3 t-secondary whitespace-nowrap">
                      {r.created_at?.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="px-4 py-3 t-primary">{r.name}</td>
                    <td className="px-4 py-3 t-secondary">{r.organization}</td>
                    <td className="px-4 py-3 t-secondary">{r.department}</td>
                    <td className="px-4 py-3 t-primary font-medium">{r.score_total}</td>
                    <td className="px-4 py-3 t-primary">{r.quiz_score}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: (TYPE_META[r.result_type]?.color || '#666') + '20',
                          color: TYPE_META[r.result_type]?.color || '#999',
                        }}
                      >
                        {r.result_label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedRow(r)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-sm glass-card t-secondary disabled:opacity-30"
            >
              이전
            </button>
            <span className="px-3 py-1.5 text-sm t-muted">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-sm glass-card t-secondary disabled:opacity-30"
            >
              다음
            </button>
          </div>
        )}

        {/* 상세 모달 */}
        {selectedRow && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRow(null)}
          >
            <div
              className="glass-card-bright rounded-2xl glow-border max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold t-primary">응시자 상세 정보</h3>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="t-muted hover:text-white text-xl"
                >
                  &times;
                </button>
              </div>

              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ['이름', selectedRow.name],
                  ['소속', selectedRow.organization],
                  ['부서', selectedRow.department],
                  ['직급', selectedRow.job_level || '-'],
                  ['AI 경력', selectedRow.experience_years || '-'],
                  ['판정 유형', selectedRow.result_label],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[var(--tag-bg)] rounded-lg p-3">
                    <div className="text-xs t-muted">{label}</div>
                    <div className="text-sm t-primary font-medium">{val}</div>
                  </div>
                ))}
              </div>

              {/* 설문 점수 */}
              <h4 className="text-sm font-semibold t-secondary mb-3">설문 개별 점수</h4>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {SURVEY_QUESTIONS.map(q => (
                  <div key={q.id} className="bg-[var(--tag-bg)] rounded-lg p-2 text-center">
                    <div className="text-[10px] t-muted">Q{q.id}</div>
                    <div className="text-sm t-primary font-bold">{selectedRow[`q${q.id}`]}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2 mb-6 mt-3">
                {[
                  { label: '질문형', score: selectedRow.score_basic, color: '#3B82F6' },
                  { label: '활용형', score: selectedRow.score_utilize, color: '#10B981' },
                  { label: '구현형', score: selectedRow.score_build, color: '#8B5CF6' },
                  { label: '확장형', score: selectedRow.score_extend, color: '#F59E0B' },
                  { label: '운영형', score: selectedRow.score_operate, color: '#EF4444' },
                ].map(a => (
                  <div key={a.label} className="rounded-lg p-2 text-center" style={{ backgroundColor: a.color + '15' }}>
                    <div className="text-[10px]" style={{ color: a.color }}>{a.label}</div>
                    <div className="text-sm font-bold" style={{ color: a.color }}>{a.score}/9</div>
                  </div>
                ))}
              </div>
              <div className="text-right text-sm t-primary font-bold mb-6">
                총점: {selectedRow.score_total}/45
              </div>

              {/* 퀴즈 결과 */}
              <h4 className="text-sm font-semibold t-secondary mb-3">퀴즈 응답 ({selectedRow.quiz_score}/10)</h4>
              <div className="space-y-2 mb-4">
                {QUIZ_QUESTIONS.map(q => {
                  const userAns = selectedRow.quiz_answers?.[`q${q.id}`];
                  const isCorrect = userAns === q.answer;
                  return (
                    <div key={q.id} className="flex items-center gap-3 text-sm bg-[var(--tag-bg)] rounded-lg p-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isCorrect ? 'O' : 'X'}
                      </span>
                      <span className="t-muted text-xs w-20">{q.areaLabel.split(' — ')[0]}</span>
                      <span className="t-muted text-xs">
                        선택: <span className="t-primary">{userAns || '-'}</span>
                      </span>
                      <span className="t-muted text-xs">
                        정답: <span className="text-emerald-400">{q.answer}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
