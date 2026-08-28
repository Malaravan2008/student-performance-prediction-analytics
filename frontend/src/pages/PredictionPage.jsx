import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Zap,
  Save,
  ArrowRight,
  TrendingDown,
  Clock,
  BookOpen
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { predictStudentRisk, fetchStudents } from '../services/api';

export default function PredictionPage({ initialStudentData, onStudentSaved }) {
  const [formData, setFormData] = useState({
    student_id: 'STU-9901',
    student_name: 'Alex Mercer',
    grade: 'Grade 10',
    age: 16,
    previous_gpa: 2.1,
    test_score: 52.0,
    attendance_percentage: 64.0,
    assignment_completion: 55.0,
    lms_login_frequency: 4.0,
    class_participation: 45.0,
    behavior_score: 68.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialStudentData) {
      setFormData({
        student_id: initialStudentData.student_id || 'STU-NEW',
        student_name: initialStudentData.name || 'Candidate Student',
        grade: initialStudentData.grade || 'Grade 10',
        age: initialStudentData.age || 16,
        previous_gpa: initialStudentData.previous_gpa || 3.0,
        test_score: initialStudentData.test_score || 75.0,
        attendance_percentage: initialStudentData.attendance_percentage || 85.0,
        assignment_completion: initialStudentData.assignment_completion || 80.0,
        lms_login_frequency: initialStudentData.lms_login_frequency || 12.0,
        class_participation: initialStudentData.class_participation || 70.0,
        behavior_score: initialStudentData.behavior_score || 85.0,
      });
    }
  }, [initialStudentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['student_id', 'student_name', 'grade'].includes(name) ? value : parseFloat(value) || 0
    }));
  };

  const handlePreset = (type) => {
    if (type === 'high') {
      setFormData({
        student_id: 'STU-HIGH-DEMO',
        student_name: 'Rohan Verma',
        grade: 'Grade 11',
        age: 17,
        previous_gpa: 1.85,
        test_score: 46.0,
        attendance_percentage: 58.0,
        assignment_completion: 42.0,
        lms_login_frequency: 3.0,
        class_participation: 38.0,
        behavior_score: 62.0,
      });
    } else if (type === 'medium') {
      setFormData({
        student_id: 'STU-MED-DEMO',
        student_name: 'Ananya Iyer',
        grade: 'Grade 10',
        age: 16,
        previous_gpa: 2.75,
        test_score: 67.0,
        attendance_percentage: 76.0,
        assignment_completion: 68.0,
        lms_login_frequency: 9.0,
        class_participation: 64.0,
        behavior_score: 78.0,
      });
    } else {
      setFormData({
        student_id: 'STU-LOW-DEMO',
        student_name: 'Priya Sharma',
        grade: 'Grade 12',
        age: 18,
        previous_gpa: 3.85,
        test_score: 93.0,
        attendance_percentage: 97.0,
        assignment_completion: 96.0,
        lms_login_frequency: 24.0,
        class_participation: 92.0,
        behavior_score: 98.0,
      });
    }
    setResult(null);
    setSaveSuccess(false);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await predictStudentRisk(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCohort = async () => {
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || '';
      const saveUrl = apiBase ? `${apiBase}/api/students` : '/api/students';
      const res = await fetch(saveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaveSuccess(true);
        if (onStudentSaved) onStudentSaved();
      } else {
        const d = await res.json();
        alert(d.detail || 'Could not save student');
      }
    } catch (e) {
      alert('Error saving student to database: ' + e.message);
    }
  };

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Interactive Risk Prediction</h1>
          <p className="page-description">
            Evaluate a student's academic and behavioral indicators using our trained Machine Learning classification model and explainability engine.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => handlePreset('high')} style={{ borderColor: '#fca5a5', color: '#991b1b' }}>
            ⚡ High Risk Preset
          </button>
          <button className="btn-secondary" onClick={() => handlePreset('medium')} style={{ borderColor: '#fde68a', color: '#92400e' }}>
            ⚡ Medium Risk Preset
          </button>
          <button className="btn-secondary" onClick={() => handlePreset('low')} style={{ borderColor: '#a7f3d0', color: '#065f46' }}>
            ⚡ Low Risk Preset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1.1fr 1.3fr' : '1fr', gap: '28px', alignItems: 'start' }}>
        {/* Prediction Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#2563eb" />
              <h3 className="card-title">Student Indicator Inputs</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
              Standardized Scale
            </span>
          </div>

          <form onSubmit={handlePredict}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grade / Class</label>
                <select
                  className="form-control"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Previous GPA (0.0 – 4.0 Scale)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="4.0"
                  required
                  className="form-control"
                  name="previous_gpa"
                  value={formData.previous_gpa}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Test Score (0 – 100%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  className="form-control"
                  name="test_score"
                  value={formData.test_score}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attendance Percentage (0 – 100%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  className="form-control"
                  name="attendance_percentage"
                  value={formData.attendance_percentage}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Completion (0 – 100%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  className="form-control"
                  name="assignment_completion"
                  value={formData.assignment_completion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">LMS Login Frequency (Logins/mo)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  className="form-control"
                  name="lms_login_frequency"
                  value={formData.lms_login_frequency}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class Participation (0 – 100%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  required
                  className="form-control"
                  name="class_participation"
                  value={formData.class_participation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Behavior Score (0 – 100%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  required
                  className="form-control"
                  name="behavior_score"
                  value={formData.behavior_score}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem' }}
              >
                <Sparkles size={18} />
                <span>{loading ? 'Evaluating Model Inference...' : 'PREDICT PERFORMANCE RISK'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Display */}
        {result && (
          <div>
            <div className="card" style={{
              border: result.risk_level === 'High' ? '2px solid #ef4444' : (result.risk_level === 'Medium' ? '2px solid #f59e0b' : '2px solid #10b981'),
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>
                    Prediction Assessment Result
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>
                    {result.student_name} ({result.student_id})
                  </h3>
                </div>
                <RiskBadge level={result.risk_level} score={result.risk_score} />
              </div>

              {/* Main Score Hero */}
              <div style={{
                background: result.risk_level === 'High' ? '#fef2f2' : (result.risk_level === 'Medium' ? '#fffbeb' : '#ecfdf5'),
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${result.risk_level === 'High' ? '#fecaca' : (result.risk_level === 'Medium' ? '#fde68a' : '#a7f3d0')}`
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Calculated Risk Score
                  </div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                    color: result.risk_level === 'High' ? '#ef4444' : (result.risk_level === 'Medium' ? '#d97706' : '#059669'),
                    lineHeight: 1.1,
                    marginTop: '4px'
                  }}>
                    {result.risk_score.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                    Model: <strong>{result.model_used}</strong> • Confidence: <strong>{Math.round((result.confidence || 0.9) * 100)}%</strong>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    background: result.risk_level === 'High' ? '#ef4444' : (result.risk_level === 'Medium' ? '#f59e0b' : '#10b981'),
                    color: 'white'
                  }}>
                    {result.risk_level.toUpperCase()} RISK
                  </div>
                  {result.probabilities && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                      P(High): {(result.probabilities.High * 100).toFixed(0)}% • P(Med): {(result.probabilities.Medium * 100).toFixed(0)}% • P(Low): {(result.probabilities.Low * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Explainable Insights Box */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <HelpCircle size={17} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Explainable Diagnosis ("Why is student at risk?"):</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                  {result.why_at_risk_explanation}
                </div>
              </div>

              {/* Key Factor Breakdown */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: '#475569' }}>
                  Root Factors Identified:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.factor_details?.map((f, i) => (
                    <div key={i} className={`factor-card ${f.status.toLowerCase()}`} style={{ padding: '10px 14px', margin: 0 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.factor}: {f.value}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({f.benchmark})</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{f.insight}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{f.contribution_weight}% Wt</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#1e40af', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Sparkles size={17} />
                  <span>Immediate Action Plan:</span>
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: '#1e3a8a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.recommended_actions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* Save / Log CTA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Logged automatically in system prediction logs
                </span>
                {saveSuccess ? (
                  <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Saved to Cohort!
                  </span>
                ) : (
                  <button className="btn-secondary" onClick={handleSaveToCohort}>
                    <Save size={15} />
                    <span>Save Student to Database</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
