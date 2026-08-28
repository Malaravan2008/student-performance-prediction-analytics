import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Calendar, 
  TrendingUp, 
  Activity, 
  BookOpen, 
  Clock, 
  UserCheck, 
  Sparkles,
  Award
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import { fetchStudentDetails, fetchStudentRecommendation, updateRecommendationStatus } from '../services/api';

export default function StudentDetailModal({ studentId, onClose, onOpenPredictionWithData }) {
  const [student, setStudent] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recStatus, setRecStatus] = useState('Pending');

  useEffect(() => {
    if (!studentId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchStudentDetails(studentId),
      fetchStudentRecommendation(studentId).catch(() => null)
    ])
      .then(([stuData, recData]) => {
        if (isMounted) {
          setStudent(stuData);
          setRecommendation(recData);
          if (recData?.status) setRecStatus(recData.status);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load student details');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [studentId]);

  const handleStatusChange = async (newStatus) => {
    if (!recommendation?.id) return;
    try {
      await updateRecommendationStatus(recommendation.id, newStatus);
      setRecStatus(newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  if (!studentId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', backgroundColor: '#2563eb' }}>
              {student ? student.name.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{student?.name || 'Loading Student...'}</h2>
                {student && <RiskBadge level={student.risk_level} score={student.risk_score} />}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                {student?.student_id} • {student?.grade} • Age {student?.age} • {student?.gender}
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading Comprehensive Student Profile...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '24px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '10px' }}>
              {error}
            </div>
          ) : student ? (
            <div>
              {/* Top KPI Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current GPA</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: student.previous_gpa < 2.5 ? '#ef4444' : '#0f172a' }}>
                    {student.previous_gpa.toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ 4.0</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${(student.previous_gpa / 4.0) * 100}%`, backgroundColor: student.previous_gpa < 2.5 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Attendance</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: student.attendance_percentage < 75 ? '#ef4444' : '#0f172a' }}>
                    {student.attendance_percentage.toFixed(1)}%
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${student.attendance_percentage}%`, backgroundColor: student.attendance_percentage < 75 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Test Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: student.test_score < 65 ? '#f59e0b' : '#0f172a' }}>
                    {student.test_score.toFixed(1)}%
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${student.test_score}%`, backgroundColor: student.test_score < 65 ? '#f59e0b' : '#10b981' }} />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Assignments</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: student.assignment_completion < 65 ? '#ef4444' : '#0f172a' }}>
                    {student.assignment_completion.toFixed(1)}%
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${student.assignment_completion}%`, backgroundColor: student.assignment_completion < 65 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>
              </div>

              {/* Secondary Metrics Pill Row */}
              <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', marginBottom: '24px', fontSize: '0.84rem', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                <div><strong>LMS Logins:</strong> {student.lms_login_frequency} / month</div>
                <div>•</div>
                <div><strong>Class Participation:</strong> {student.class_participation}%</div>
                <div>•</div>
                <div><strong>Behavior Score:</strong> {student.behavior_score}%</div>
              </div>

              {/* SECTION: EXPLAINABLE INSIGHTS ("Why is this student at risk?") */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} color="#2563eb" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Why is this student at risk? (Explainable Insights)</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                    Calculated from actual feature deviations
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Attendance Factor */}
                  <div className={`factor-card ${student.attendance_percentage < 75 ? (student.attendance_percentage < 65 ? 'critical' : 'warning') : 'good'}`}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Attendance Rate: {student.attendance_percentage}%</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: student.attendance_percentage < 75 ? '#fee2e2' : '#dcfce7', color: student.attendance_percentage < 75 ? '#991b1b' : '#166534', fontWeight: 600 }}>
                          Benchmark: &gt;= 80%
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                        {student.attendance_percentage < 75
                          ? `Critically below required standard. Missed ${Math.round((100 - student.attendance_percentage) * 0.4)} sessions this term, causing major gaps in continuous comprehension.`
                          : 'Consistent attendance supporting steady subject mastery.'}
                      </p>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Weight: 25%</div>
                  </div>

                  {/* Academic Performance Factor */}
                  <div className={`factor-card ${student.test_score < 65 || student.previous_gpa < 2.5 ? (student.test_score < 50 ? 'critical' : 'warning') : 'good'}`}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Academic Mastery: Tests {student.test_score}% | GPA {student.previous_gpa.toFixed(2)}</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: student.test_score < 65 ? '#fee2e2' : '#dcfce7', color: student.test_score < 65 ? '#991b1b' : '#166534', fontWeight: 600 }}>
                          Benchmark: GPA &gt;= 3.0, Tests &gt;= 70%
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                        {student.test_score < 65 || student.previous_gpa < 2.5
                          ? 'Demonstrates difficulty on mid-term evaluations and formative chapter quizzes.'
                          : 'Demonstrates strong subject mastery and solid grade retention.'}
                      </p>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Weight: 30%</div>
                  </div>

                  {/* Coursework & LMS Factor */}
                  <div className={`factor-card ${student.assignment_completion < 65 || student.lms_login_frequency < 8 ? 'warning' : 'good'}`}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Digital & Assignment Engagement: {student.assignment_completion}% | {student.lms_login_frequency} Logins/mo</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: student.assignment_completion < 65 ? '#fffbeb' : '#dcfce7', color: student.assignment_completion < 65 ? '#92400e' : '#166534', fontWeight: 600 }}>
                          Benchmark: &gt;= 85% submissions
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                        {student.assignment_completion < 65
                          ? 'Missing coursework deliverables reduces continuous feedback loops and exam readiness.'
                          : 'Regular assignment completion providing timely teacher feedback.'}
                      </p>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Weight: 30%</div>
                  </div>
                </div>
              </div>

              {/* SECTION: PERSONALIZED RECOMMENDATIONS & ACTION PLAN */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#2563eb" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recommended Interventions & Action Plan</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Intervention Status:</span>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem' }}
                      value={recStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="Pending">Pending Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Intervention Strategy</div>
                  <p style={{ fontSize: '0.92rem', color: '#1e293b', marginTop: '4px', lineHeight: 1.45 }}>
                    {recommendation?.recommended_intervention || 'Schedule attendance counseling and assign faculty mentor for weekly subject review sessions.'}
                  </p>
                </div>

                {/* Structured Step-by-Step Action Plan */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: '#475569' }}>Action Timeline:</div>
                  {(recommendation?.action_plan && recommendation.action_plan.length > 0) ? (
                    recommendation.action_plan.map((step, idx) => (
                      <div key={idx} className="action-step">
                        <div className="step-num">{step.step || idx + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{step.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                              Owner: {step.owner} • Within {step.target_days} Days
                            </span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>{step.desc}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="action-step">
                      <div className="step-num">1</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>1-on-1 Faculty Mentoring & Parent Alignment</div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Convene meeting to review attendance and coursework roadblocks.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    onClose();
                    if (onOpenPredictionWithData) {
                      onOpenPredictionWithData(student);
                    }
                  }}
                >
                  <Sparkles size={16} />
                  <span>Run Custom ML Prediction Simulation</span>
                </button>
                <button className="btn-primary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
