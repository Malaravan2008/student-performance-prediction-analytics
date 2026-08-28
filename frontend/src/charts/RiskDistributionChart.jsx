import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RiskDistributionChart({ riskDistribution }) {
  const low = riskDistribution?.Low || 0;
  const medium = riskDistribution?.Medium || 0;
  const high = riskDistribution?.High || 0;
  const total = low + medium + high;

  const data = {
    labels: ['Low Risk (0-39%)', 'Medium Risk (40-69%)', 'High Risk (70-100%)'],
    datasets: [
      {
        data: [low, medium, high],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            family: 'Inter',
            size: 12,
            weight: 500,
          },
          color: '#475569',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.parsed || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${val} students (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
          {total}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Students
        </div>
      </div>
    </div>
  );
}
