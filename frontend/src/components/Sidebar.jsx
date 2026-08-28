import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'prediction', label: 'Risk Prediction', icon: Sparkles },
    { id: 'alerts', label: 'Early Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'recommendations', label: 'Interventions', icon: ClipboardCheck },
    { id: 'analytics', label: 'Analytics & ML', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="app-title">EduPredict AI</h1>
          <p className="app-subtitle">Early Warning Analytics</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {Boolean(item.badge) && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar">
            {user?.full_name ? user.full_name.charAt(0) : 'T'}
          </div>
          <div>
            <div className="user-name">{user?.full_name || 'Dr. Eleanor Vance'}</div>
            <div className="user-role">{user?.role || 'Lead Faculty'}</div>
          </div>
        </div>
        <button 
          className="icon-btn" 
          onClick={onLogout} 
          title="Sign Out" 
          style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', color: '#64748b' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
