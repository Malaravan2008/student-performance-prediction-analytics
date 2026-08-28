import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PerformanceTrendChart({ trends }) {
  const labels = (trends && trends.length > 0)
    ? trends.map(t => t.month)
    : ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  const testScores = trends?.map(t => t.avg_test_score) || [74, 76, 75, 73, 75];
  const attendance = trends?.map(t => t.avg_attendance) || [86, 85, 87, 84, 85];

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Attendance (%)',
        data: attendance,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
      },
      {
        label: 'Average Test Score (%)',
        data: testScores,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          font: { family: 'Inter', size: 11 },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        min: 40,
        max: 100,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          callback: (val) => `${val}%`,
          font: { family: 'Inter', size: 11 },
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
