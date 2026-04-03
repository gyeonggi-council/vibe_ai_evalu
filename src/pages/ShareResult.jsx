import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TYPE_META } from '../utils/scoring';
import { QUIZ_QUESTIONS } from '../data/questions';
import RadarChart from '../components/RadarChart';

export default function ShareResult() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResult() {
      const { data: row, error: dbError } = await supabase
        .from('responses')
        .select('*')
        .eq('share_code', code)
        .maybeSingle();

      if (dbError) {
        setError('결과를 불러오는 중 오류가 발생했습니다.');
      } else if (!row) {
        setError('해당 공유 코드의 결과를 찾을 수 없습니다.');
      } else {
        setData(row);
      }
      setLoading(false);
    }
    fetchResult();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😥</div>
          <p className="t-secondary mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition"
          >
            나도 응시하기
          </button>
        </div>
      </div>
    );
  }

  const meta = TYPE_META[data.result_type];
  const scores = {
    basic: data.score_basic,
    utilize: data.score_utilize,
    build: data.score_build,
    extend: data.score_extend,
    operate: data.score_operate,
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* 응시자 정보 */}
        <div className="text-center mb-6">
          <span className="inline-block px-5 py-2 rounded-full text-base font-medium bg-white/[0.06] t-secondary mb-4">
            {data.name} · {data.organization}
          </span>
        </div>

        {/* 유형 결과 */}
        <div
          className="text-center rounded-2xl overflow-hidden mb-8 border"
          style={{ borderColor: meta.color + '40', backgroundColor: meta.color + '10' }}
        >
          <div className="w-full max-h-72 overflow-hidden">
            <img src={meta.image} alt={meta.label} className="w-full h-full object-cover object-center" />
          </div>
          <div className="p-8">
            <p className="t-secondary text-lg leading-relaxed mb-6">{meta.description}</p>
            <div className="flex justify-center gap-10">
              <div>
                <div className="text-5xl font-bold t-primary">{data.score_total}</div>
                <div className="text-base t-muted mt-2">설문 / 45</div>
              </div>
              <div className="w-px bg-white/[0.06]" />
              <div>
                <div className="text-5xl font-bold t-primary">{data.quiz_score}</div>
                <div className="text-base t-muted mt-2">퀴즈 / 10</div>
              </div>
            </div>
          </div>
        </div>

        {/* 레이더 차트 */}
        <div className="glass-card rounded-2xl p-6 glow-border mb-8">
          <h3 className="text-xl font-bold t-primary mb-4 text-center">영역별 점수</h3>
          <RadarChart scores={scores} bgColor={meta.color + '30'} borderColor={meta.color} />
        </div>

        {/* 나도 응시하기 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="px-10 py-4 rounded-xl font-bold text-white text-lg btn-gradient"
          >
            나도 응시하기
          </button>
        </div>
      </div>
    </div>
  );
}
