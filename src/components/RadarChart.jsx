import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const AREA_LABELS = ['질문형', '활용형', '구현형', '확장형', '운영형'];

export default function RadarChart({ scores, maxScore = 9, bgColor = 'rgba(99,102,241,0.2)', borderColor = 'rgba(99,102,241,1)' }) {
  const data = {
    labels: AREA_LABELS,
    datasets: [
      {
        label: '영역별 점수',
        data: [
          scores.basic || 0,
          scores.utilize || 0,
          scores.build || 0,
          scores.extend || 0,
          scores.operate || 0,
        ],
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: maxScore,
        ticks: {
          stepSize: 3,
          color: '#94a3b8',
          backdropColor: 'transparent',
          font: { size: 13 },
        },
        grid: { color: 'rgba(99,102,241,0.08)' },
        angleLines: { color: 'rgba(99,102,241,0.08)' },
        pointLabels: {
          color: 'var(--text-secondary, #cbd5e1)',
          font: { size: 16, weight: '600' },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}/${maxScore}점`,
        },
      },
    },
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Radar data={data} options={options} />
    </div>
  );
}
