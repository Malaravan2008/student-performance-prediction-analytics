import React from 'react';

export default function RiskBadge({ level, score }) {
  const normalizedLevel = (level || 'Low').toLowerCase();
  
  let badgeClass = 'badge-low';
  if (normalizedLevel.includes('high')) badgeClass = 'badge-high';
  else if (normalizedLevel.includes('med')) badgeClass = 'badge-medium';

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {level} Risk {score !== undefined && score !== null ? `(${score}%)` : ''}
    </span>
  );
}
