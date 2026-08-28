import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Eye, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { fetchRecommendations, updateRecommendationStatus } from '../services/api';

export default function RecommendationsPage({ onSelectStudent }) {
  const [recommendations, setRecommendations] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchRecommendations({
      priority: priorityFilter,
      status: statusFilter,
      search: search
    })
      .then(res => {
        setRecommendations(res || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [priorityFilter, statusFilter, search]);

  const handleStatusChange = async (recId, newStatus) => {
    try {
      await updateRecommendationStatus(recId, newStatus);
      setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Personalized Intervention Recommendations</h1>
          <p className="page-description">
            Tailored pedagogical and behavioral intervention strategies generated from multi-factor risk diagnostics.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadData}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              <Filter size={16} />
              <span>Filter Interventions:</span>
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{ width: '260px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name/ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Recommendations Table / Card list */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Risk Level</th>
                <th>Main Problem Diagnosed</th>
                <th style={{ width: '38%' }}>Recommended Intervention Strategy</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading intervention plans...
                  </td>
                </tr>
              ) : recommendations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No intervention recommendations match current filter criteria.
                  </td>
                </tr>
              ) : (
                recommendations.map((rec) => {
                  let priorityBg = '#f1f5f9';
                  let priorityColor = '#475569';
                  if (rec.priority === 'Urgent') { priorityBg = '#fee2e2'; priorityColor = '#991b1b'; }
                  else if (rec.priority === 'High') { priorityBg = '#fef3c7'; priorityColor = '#92400e'; }
                  else if (rec.priority === 'Medium') { priorityBg = '#e0f2fe'; priorityColor = '#0369a1'; }

                  return (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rec.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.student_id}</div>
                      </td>
                      <td>
                        <RiskBadge level={rec.risk_level} score={rec.risk_score} />
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>
                          {rec.main_problem}
                        </div>
                      </td>
                      <td>
                        <p style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.4 }}>
                          {rec.recommended_intervention}
                        </p>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: priorityBg,
                          color: priorityColor,
                          textTransform: 'uppercase'
                        }}>
                          {rec.priority}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                          value={rec.status}
                          onChange={(e) => handleStatusChange(rec.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          onClick={() => onSelectStudent(rec.student_id)}
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
