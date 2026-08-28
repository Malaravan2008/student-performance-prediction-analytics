import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Activity, 
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Eye
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import RiskDistributionChart from '../charts/RiskDistributionChart';
import PerformanceTrendChart from '../charts/PerformanceTrendChart';
import AttendanceScatterChart from '../charts/AttendanceScatterChart';
import RiskFactorsBarChart from '../charts/RiskFactorsBarChart';
import { fetchDashboardSummary, fetchStudents } from '../services/api';

export default function DashboardPage({ onSelectStudent, onNavigateTab }) {
  const [summary, setSummary] = useState(null);
  const [highRiskStudents, setHighRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchDashboardSummary(),
      fetchStudents({ risk_level: 'High', limit: 6 })
    ])
      .then(([summaryData, studentsData]) => {
        if (isMounted) {
          setSummary(summaryData);
          setHighRiskStudents(studentsData.students || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="content-area" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#3b82f6' }}>Loading Analytics & Insights...</div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>Aggregating student risk vectors and empirical ML model inference...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <div style={{ padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b' }}>
          <strong>Error connecting to Backend:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Dashboard</h1>
          <p className="page-description">
            Early identification of at-risk students with real-time ML risk scoring and targeted interventions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => onNavigateTab('students')}>
            <Users size={16} />
            <span>View All Students</span>
          </button>
          <button className="btn-primary" onClick={() => onNavigateTab('prediction')}>
            <Sparkles size={16} />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* Primary Stat Cards Grid */}
      <div className="stat-grid">
        <StatCard
          label="Total Students"
          value={summary?.total_students || 0}
          icon={Users}
          subtext="Active Cohort (Grades 9-12)"
          color="#2563eb"
          bgLight="#eff6ff"
        />
        <StatCard
          label="Low Risk Cohort"
          value={summary?.low_risk_count || 0}
          icon={ShieldCheck}
          subtext="On-track & steady"
          color="#10b981"
          bgLight="#ecfdf5"
        />
        <StatCard
          label="Medium Risk Cohort"
          value={summary?.medium_risk_count || 0}
          icon={AlertTriangle}
          subtext="Early warning watch"
          color="#f59e0b"
          bgLight="#fffbeb"
        />
        <StatCard
          label="High Risk (Action Needed)"
          value={summary?.high_risk_count || 0}
          icon={ShieldAlert}
          subtext="Requires prompt intervention"
          color="#ef4444"
          bgLight="#fef2f2"
        />
        <StatCard
          label="Cohort Avg Attendance"
          value={`${summary?.average_attendance || 0}%`}
          icon={Clock}
          subtext="Benchmark: >= 80%"
          color="#3b82f6"
          bgLight="#eff6ff"
        />
        <StatCard
          label="Cohort Avg GPA"
          value={`${summary?.average_gpa || 0} / 4.0`}
          icon={TrendingUp}
          subtext="Across all subjects"
          color="#8b5cf6"
          bgLight="#f5f3ff"
        />
      </div>

      {/* Row 1 Charts: Risk Distribution & 5-Month Performance Trend */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Risk Distribution</h3>
              <p className="card-subtitle">Breakdown of students by ML calculated risk level</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <RiskDistributionChart riskDistribution={summary?.risk_distribution} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Performance & Attendance Trend</h3>
              <p className="card-subtitle">5-month aggregate term progression (Nov - Mar)</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <PerformanceTrendChart trends={summary?.performance_trends} />
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Scatter Plot & Risk Factors Bar Chart */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Attendance vs. Academic Performance</h3>
              <p className="card-subtitle">Click on any student node to open detailed explainable insights</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <AttendanceScatterChart 
              scatterData={summary?.attendance_vs_performance} 
              onSelectStudent={onSelectStudent}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Key Risk Factor Prevalence</h3>
              <p className="card-subtitle">Top contributing root causes identified across the cohort</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <RiskFactorsBarChart factorDistribution={summary?.risk_factor_distribution} />
          </div>
        </div>
      </div>

      {/* Priority Section: Students Requiring Immediate Attention (High Risk) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#ef4444" />
              <h3 className="card-title" style={{ color: '#991b1b' }}>Students Requiring Attention (High Risk Priority)</h3>
            </div>
            <p className="card-subtitle">Students whose composite risk score has crossed the critical threshold (&gt;= 70%)</p>
          </div>
          <button 
            className="btn-secondary" 
            onClick={() => onNavigateTab('students')}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <span>View All Filtered</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Attendance</th>
                <th>GPA</th>
                <th>Test Score</th>
                <th>Assignments</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskStudents.map((stu) => (
                <tr key={stu.student_id}>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{stu.student_id}</td>
                  <td style={{ fontWeight: 600 }}>{stu.name}</td>
                  <td>{stu.grade}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: stu.attendance_percentage < 75 ? '#ef4444' : '#0f172a' }}>
                      {stu.attendance_percentage}%
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: stu.previous_gpa < 2.5 ? '#ef4444' : '#0f172a' }}>
                      {stu.previous_gpa.toFixed(2)}
                    </span>
                  </td>
                  <td>{stu.test_score}%</td>
                  <td>{stu.assignment_completion}%</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>{stu.risk_score}%</div>
                  </td>
                  <td>
                    <RiskBadge level={stu.risk_level} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '5px 12px', fontSize: '0.8rem', background: '#2563eb' }}
                      onClick={() => onSelectStudent(stu.student_id)}
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
