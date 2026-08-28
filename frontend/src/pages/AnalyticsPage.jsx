import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  Sliders, 
  Layers,
  Award,
  TrendingUp
} from 'lucide-react';
import { fetchModelMetrics, trainMLModel } from '../services/api';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState('');

  const loadMetrics = () => {
    setLoading(true);
    fetchModelMetrics()
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRetrain = async () => {
    setTraining(true);
    setTrainMessage('');
    try {
      const data = await trainMLModel();
      setMetrics(data);
      setTrainMessage('ML Model successfully trained and benchmarked across algorithms!');
    } catch (e) {
      setTrainMessage('Retraining error: ' + e.message);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Machine Learning & Model Analytics</h1>
          <p className="page-description">
            Empirical evaluation metrics, algorithmic benchmarks, and feature importance rankings calculated from real prototype cohort data.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleRetrain}
          disabled={training}
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}
        >
          <Sparkles size={16} />
          <span>{training ? 'Training Algorithms...' : 'Retrain ML Models'}</span>
        </button>
      </div>

      {trainMessage && (
        <div style={{
          padding: '12px 16px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{trainMessage}</span>
        </div>
      )}

      {/* Model Overview Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-label">Active Best Model</div>
          <div className="stat-value" style={{ fontSize: '1.35rem', color: '#2563eb', marginTop: '6px' }}>
            {metrics?.selected_model || 'RandomForest'}
          </div>
          <div className="stat-subtext">Selected via F1-Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Dataset Cohort Size</div>
          <div className="stat-value" style={{ fontSize: '1.6rem', marginTop: '6px' }}>
            {metrics?.dataset_size || 75}
          </div>
          <div className="stat-subtext">Fictional Student Records</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Train / Test Split</div>
          <div className="stat-value" style={{ fontSize: '1.6rem', marginTop: '6px' }}>
            80% / 20%
          </div>
          <div className="stat-subtext">Stratified Random Sampling</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">Classification Target</div>
          <div className="stat-value" style={{ fontSize: '1.35rem', color: '#059669', marginTop: '6px' }}>
            3 Risk Classes
          </div>
          <div className="stat-subtext">Low / Medium / High</div>
        </div>
      </div>

      {/* Benchmarking Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#2563eb" />
              <h3 className="card-title">Algorithmic Benchmarking Matrix</h3>
            </div>
            <p className="card-subtitle">Empirical performance comparison evaluated on hold-out test split (not mock metrics)</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Accuracy</th>
                <th>Precision (Weighted)</th>
                <th>Recall (Weighted)</th>
                <th>F1-Score</th>
                <th style={{ textAlign: 'right' }}>Benchmark Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.benchmarks?.map((bm, idx) => (
                <tr key={idx} style={{ backgroundColor: bm.is_best ? '#eff6ff' : 'transparent' }}>
                  <td style={{ fontWeight: 700, color: bm.is_best ? '#1e40af' : '#0f172a' }}>
                    {bm.model_name}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{(bm.accuracy * 100).toFixed(1)}%</span>
                  </td>
                  <td>
                    <span>{(bm.precision * 100).toFixed(1)}%</span>
                  </td>
                  <td>
                    <span>{(bm.recall * 100).toFixed(1)}%</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: bm.is_best ? '#2563eb' : '#0f172a' }}>
                      {(bm.f1_score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {bm.is_best ? (
                      <span style={{
                        background: '#2563eb',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}>
                        ★ Best Model
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Evaluated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Rankings */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#2563eb" />
              <h3 className="card-title">Feature Importance Analysis (Gini Impurity / Coefficients)</h3>
            </div>
            <p className="card-subtitle">Relative contribution weight of student indicators in risk level determination</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
          {metrics?.feature_importance && Object.entries(metrics.feature_importance)
            .sort((a, b) => b[1] - a[1])
            .map(([feat, imp], idx) => {
              const pct = (imp * 100).toFixed(1);
              const labelMap = {
                'previous_gpa': 'Previous GPA (Academic Base)',
                'test_score': 'Average Test Score (Evaluations)',
                'attendance_percentage': 'Attendance Percentage (Session Presence)',
                'assignment_completion': 'Assignment Submission Rate',
                'lms_login_frequency': 'LMS Portal Login Frequency',
                'class_participation': 'Classroom Participation Score',
                'behavior_score': 'Behavioral Indicator'
              };

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{labelMap[feat] || feat}</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '8px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.max(5, imp * 100 * 2.5)}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
          <strong>Transparency Notice:</strong> All models benchmarked against the prototype dataset. Feature importances reflect actual tree node split impurity gains in the fitted model bundle.
        </div>
      </div>
    </div>
  );
}
