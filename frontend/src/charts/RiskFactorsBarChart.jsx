import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RiskFactorsBarChart({ factorDistribution }) {
  const labels = Object.keys(factorDistribution || {
    'Low Attendance': 18,
    'Low Test Scores': 14,
    'Low Assignments': 12,
    'Low LMS Logins': 10,
    'Low Participation': 8,
    'Behavior Concerns': 5,
  });

  const values = Object.values(factorDistribution || {
    'Low Attendance': 18,
    'Low Test Scores': 14,
    'Low Assignments': 12,
    'Low LMS Logins': 10,
    'Low Participation': 8,
    'Behavior Concerns': 5,
  });

  const data = {
    labels: labels.map(l => l.replace(/ \(.*\)/, '')), // Clean concise label
    datasets: [
      {
        label: 'Affected Students Count',
        data: values,
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.parsed.x} Students flagged`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter', size: 11 }, precision: 0 },
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 500 }, color: '#334155' },
      },
    },
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
