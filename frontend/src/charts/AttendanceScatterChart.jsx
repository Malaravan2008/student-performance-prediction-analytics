import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function AttendanceScatterChart({ scatterData, onSelectStudent }) {
  const lowData = [];
  const medData = [];
  const highData = [];

  (scatterData || []).forEach(item => {
    const point = {
      x: item.attendance,
      y: item.test_score,
      student_id: item.student_id,
      name: item.name,
      risk_score: item.risk_score,
      gpa: item.gpa,
      risk_level: item.risk_level
    };

    if (item.risk_level === 'High') highData.push(point);
    else if (item.risk_level === 'Medium') medData.push(point);
    else lowData.push(point);
  });

  const data = {
    datasets: [
      {
        label: 'Low Risk',
        data: lowData,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        pointRadius: 5,
        hoverRadius: 8,
      },
      {
        label: 'Medium Risk',
        data: medData,
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderColor: '#f59e0b',
        pointRadius: 5,
        hoverRadius: 8,
      },
      {
        label: 'High Risk',
        data: highData,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#ef4444',
        pointRadius: 6,
        hoverRadius: 9,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e, elements) => {
      if (elements && elements.length > 0 && onSelectStudent) {
        const el = elements[0];
        const point = data.datasets[el.datasetIndex].data[el.index];
        if (point?.student_id) {
          onSelectStudent(point.student_id);
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 10, font: { family: 'Inter', size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const raw = context.raw;
            return ` ${raw.name} (${raw.student_id}): Attendance ${raw.x}%, Test Score ${raw.y}% | Risk: ${raw.risk_score}%`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Attendance Percentage (%)',
          color: '#64748b',
          font: { family: 'Inter', size: 11, weight: 600 },
        },
        min: 40,
        max: 100,
        grid: { color: '#f1f5f9' },
      },
      y: {
        title: {
          display: true,
          text: 'Test Score (%)',
          color: '#64748b',
          font: { family: 'Inter', size: 11, weight: 600 },
        },
        min: 30,
        max: 100,
        grid: { color: '#f1f5f9' },
      },
    },
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Scatter data={data} options={options} />
    </div>
  );
}
