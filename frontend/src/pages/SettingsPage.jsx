import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  ShieldCheck, 
  User, 
  Bell, 
  Lock, 
  CheckCircle2, 
  Save,
  Server
} from 'lucide-react';

export default function SettingsPage({ user }) {
  const [lowMax, setLowMax] = useState(39);
  const [medMax, setMedMax] = useState(69);
  const [highMin, setHighMin] = useState(70);
  const [saved, setSaved] = useState(false);

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings & Configuration</h1>
          <p className="page-description">
            Manage risk thresholds, algorithmic parameters, user profile preferences, and data privacy policies.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Risk Thresholds Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#2563eb" />
              <h3 className="card-title">Risk Scoring Thresholds</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
              Configurable
            </span>
          </div>

          <form onSubmit={handleSaveThresholds}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#065f46' }}>Low Risk Threshold (0% to Max)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="form-control"
                  value={lowMax}
                  onChange={(e) => setLowMax(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>Max % (Default: 39%)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#92400e' }}>Medium Risk Threshold (Low Max to Medium Max)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="40"
                  max="80"
                  className="form-control"
                  value={medMax}
                  onChange={(e) => setMedMax(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>Max % (Default: 69%)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#991b1b' }}>High Risk Threshold (Trigger &gt;= Min)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="50"
                  max="90"
                  className="form-control"
                  value={highMin}
                  onChange={(e) => setHighMin(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>Min % (Default: 70%)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <button type="submit" className="btn-primary">
                <Save size={16} />
                <span>Save Risk Parameters</span>
              </button>
              {saved && (
                <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Thresholds updated!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* User Profile & System Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* User Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#2563eb" />
                <h3 className="card-title">Faculty Profile</h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.full_name || 'Dr. Eleanor Vance'}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email || 'teacher@example.com'}</div>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>Role: {user?.role || 'Head Faculty'}</div>
              </div>
            </div>
          </div>

          {/* Data Privacy & Compliance Notice */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#10b981" />
                <h3 className="card-title">Data Privacy & Protection</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
              This system operates in compliance with student privacy standards. All demo cohort records are anonymized fictional profiles designed for academic risk research and early intervention prototyping.
            </p>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
              <Lock size={14} color="#64748b" />
              <span>Role-Based Access Control Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
