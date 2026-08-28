import React from 'react';
import { Search, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar({ searchTerm, setSearchTerm, onOpenPrediction, onOpenAlerts, alertCount = 0 }) {
  return (
    <header className="top-navbar">
      <div className="search-container">
        <Search size={18} color="#64748b" />
        <input
          type="text"
          className="search-input"
          placeholder="Search students by name or ID (e.g. Arun, STU-1002)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', fontWeight: 600, background: '#ecfdf5', padding: '5px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          ML Engine Active
        </div>

        <button 
          className="icon-btn" 
          onClick={onOpenAlerts} 
          title="Active Early Warning Alerts"
        >
          <Bell size={19} />
          {alertCount > 0 && <span className="icon-badge-dot" />}
        </button>

        <button className="btn-primary" onClick={onOpenPrediction}>
          <Sparkles size={16} />
          <span>Predict Risk</span>
        </button>
      </div>
    </header>
  );
}
