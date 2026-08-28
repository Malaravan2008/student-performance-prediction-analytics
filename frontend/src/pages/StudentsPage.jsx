import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Plus, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { fetchStudents } from '../services/api';

export default function StudentsPage({ onSelectStudent, onOpenPrediction, searchTerm, setSearchTerm }) {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [riskFilter, setRiskFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_score_desc');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchStudents({
      search: searchTerm,
      risk_level: riskFilter,
      grade: gradeFilter,
      sort_by: sortBy,
      limit: 100
    })
      .then(res => {
        setStudents(res.students || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, riskFilter, gradeFilter, sortBy]);

  return (
    <div className="content-area">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Cohort Directory</h1>
          <p className="page-description">
            Monitor academic progress, engagement indicators, and early warning risk classifications across all grades.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={loadData} title="Refresh directory">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary" onClick={onOpenPrediction}>
            <Sparkles size={16} />
            <span>Predict Risk for New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              <Filter size={16} />
              <span>Filters:</span>
            </div>

            {/* Risk Level Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>

            {/* Grade Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="all">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            {/* Sort Options */}
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="risk_score_desc">Sort: Highest Risk First</option>
              <option value="risk_score_asc">Sort: Lowest Risk First</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="attendance_asc">Sort: Lowest Attendance</option>
              <option value="gpa_asc">Sort: Lowest GPA</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{students.length}</strong> of <strong>{total}</strong> students
          </div>
        </div>
      </div>

      {/* Student Table Card */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Grade</th>
                <th>GPA (0-4.0)</th>
                <th>Attendance</th>
                <th>Test Score</th>
                <th>Assignments</th>
                <th>LMS Logins</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No students found matching current search and filter criteria.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.student_id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{stu.student_id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{stu.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Age {stu.age} • {stu.gender}</div>
                    </td>
                    <td>{stu.grade}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: stu.previous_gpa < 2.5 ? '#ef4444' : '#0f172a' }}>
                        {stu.previous_gpa.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: stu.attendance_percentage < 75 ? '#ef4444' : '#0f172a' }}>
                          {stu.attendance_percentage.toFixed(1)}%
                        </span>
                        <div className="progress-bar-bg" style={{ width: '60px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${stu.attendance_percentage}%`,
                              backgroundColor: stu.attendance_percentage < 75 ? '#ef4444' : '#10b981'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: stu.test_score < 65 ? '#f59e0b' : '#0f172a' }}>
                        {stu.test_score.toFixed(1)}%
                      </span>
                    </td>
                    <td>{stu.assignment_completion.toFixed(1)}%</td>
                    <td>{stu.lms_login_frequency} / mo</td>
                    <td>
                      <div style={{
                        fontWeight: 700,
                        color: stu.risk_score >= 70 ? '#ef4444' : (stu.risk_score >= 40 ? '#d97706' : '#059669')
                      }}>
                        {stu.risk_score.toFixed(1)}%
                      </div>
                    </td>
                    <td>
                      <RiskBadge level={stu.risk_level} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => onSelectStudent(stu.student_id)}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
