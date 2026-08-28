import React from 'react';

export default function StatCard({ label, value, icon: Icon, subtext, color = '#3b82f6', bgLight = '#eff6ff' }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrapper" style={{ backgroundColor: bgLight, color: color }}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div>
        <div className="stat-value" style={{ color: '#0f172a' }}>{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
}
