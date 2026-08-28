// Dynamic API base — set VITE_API_BASE_URL in .env for production deployments.
// For local development, leave it unset to use Vite's proxy (/api).
const _rawBase = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = _rawBase
  ? `${_rawBase.replace(/\/$/, '')}/api`
  : '/api';

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchStudents({ search = '', risk_level = '', grade = '', sort_by = 'risk_score_desc', skip = 0, limit = 100 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (risk_level && risk_level !== 'all') params.append('risk_level', risk_level);
  if (grade && grade !== 'all') params.append('grade', grade);
  if (sort_by) params.append('sort_by', sort_by);
  params.append('skip', skip);
  params.append('limit', limit);

  const res = await fetch(`${API_BASE}/students?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch students list');
  return res.json();
}

export async function fetchStudentDetails(studentId) {
  const res = await fetch(`${API_BASE}/students/${studentId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for student ${studentId}`);
  return res.json();
}

export async function predictStudentRisk(formData) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  if (!res.ok) throw new Error('Prediction request failed');
  return res.json();
}

export async function fetchAlerts({ risk_level = '', status = '', skip = 0, limit = 100 } = {}) {
  const params = new URLSearchParams();
  if (risk_level && risk_level !== 'all') params.append('risk_level', risk_level);
  if (status && status !== 'all') params.append('status', status);
  params.append('skip', skip);
  params.append('limit', limit);

  const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchAlertStats() {
  const res = await fetch(`${API_BASE}/alerts/stats`);
  if (!res.ok) throw new Error('Failed to fetch alert stats');
  return res.json();
}

export async function updateAlertStatus(alertId, status) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update alert status');
  return res.json();
}

export async function fetchRecommendations({ priority = '', status = '', search = '', skip = 0, limit = 100 } = {}) {
  const params = new URLSearchParams();
  if (priority && priority !== 'all') params.append('priority', priority);
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);
  params.append('skip', skip);
  params.append('limit', limit);

  const res = await fetch(`${API_BASE}/recommendations?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchStudentRecommendation(studentId) {
  const res = await fetch(`${API_BASE}/recommendations/${studentId}`);
  if (!res.ok) throw new Error(`Failed to fetch recommendation for student ${studentId}`);
  return res.json();
}

export async function updateRecommendationStatus(recId, status) {
  const res = await fetch(`${API_BASE}/recommendations/${recId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update recommendation status');
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/model-metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function trainMLModel() {
  const res = await fetch(`${API_BASE}/train-model`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to train ML model');
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}
