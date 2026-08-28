import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Eye, 
  RefreshCw,
  BellRing
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { fetchAlerts, updateAlertStatus, fetchAlertStats } from '../services/api';

export default function AlertsPage({ onSelectStudent }) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    Promise.all([
      fetchAlerts({ risk_level: riskFilter, status: statusFilter }),
      fetchAlertStats()
    ])
      .then(([alertsData, statsData]) => {
        setAlerts(alertsData || []);
        setStats(statsData || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAlerts();
  }, [riskFilter, statusFilter]);

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Early Warning Alerts</h1>
          <p className="page-description">
            Automated notifications triggered when a student crosses critical academic, attendance, or engagement thresholds.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadAlerts}>
          <RefreshCw size={16} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '22px' }}>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value" style={{ fontSize: '1.6rem', marginTop: '4px' }}>{stats?.total_alerts || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label" style={{ color: '#991b1b' }}>New / Unread</div>
          <div className="stat-value" style={{ fontSize: '1.6rem', color: '#ef4444', marginTop: '4px' }}>{stats?.new_alerts || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label" style={{ color: '#92400e' }}>Under Review</div>
          <div className="stat-value" style={{ fontSize: '1.6rem', color: '#f59e0b', marginTop: '4px' }}>{stats?.reviewed_alerts || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
          <div className="stat-label" style={{ color: '#065f46' }}>Resolved</div>
          <div className="stat-value" style={{ fontSize: '1.6rem', color: '#10b981', marginTop: '4px' }}>{stats?.resolved_alerts || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            <Filter size={16} />
            <span>Filter Alerts:</span>
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk Alerts</option>
            <option value="Medium">Medium Risk Alerts</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="New">Status: New</option>
            <option value="Reviewed">Status: Reviewed</option>
            <option value="Resolved">Status: Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading alert triggers...
          </div>
        ) : alerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No Active Alerts</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>All student performance metrics are currently within normal baseline thresholds.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isHigh = alert.risk_level === 'High';
            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  padding: '20px',
                  marginBottom: '0px',
                  borderLeft: `5px solid ${isHigh ? '#ef4444' : '#f59e0b'}`,
                  backgroundColor: alert.status === 'Resolved' ? '#f8fafc' : '#ffffff',
                  opacity: alert.status === 'Resolved' ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <RiskBadge level={alert.risk_level} score={alert.risk_score} />
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: alert.status === 'New' ? '#fee2e2' : (alert.status === 'Reviewed' ? '#fef3c7' : '#dcfce7'),
                        color: alert.status === 'New' ? '#991b1b' : (alert.status === 'Reviewed' ? '#92400e' : '#166534')
                      }}>
                        {alert.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        ID: {alert.student_id}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      {alert.title}
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45, marginBottom: '12px' }}>
                      {alert.message}
                    </p>

                    {/* Reasons Tags */}
                    {alert.reasons && alert.reasons.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {alert.reasons.map((r, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => onSelectStudent(alert.student_id)}
                    >
                      <Eye size={14} />
                      <span>View Student</span>
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {alert.status !== 'Reviewed' && alert.status !== 'Resolved' && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleStatusChange(alert.id, 'Reviewed')}
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {alert.status !== 'Resolved' && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#059669', borderColor: '#a7f3d0' }}
                          onClick={() => handleStatusChange(alert.id, 'Resolved')}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
