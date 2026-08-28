import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import StudentDetailModal from './components/StudentDetailModal';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import PredictionPage from './pages/PredictionPage';
import AlertsPage from './pages/AlertsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import { fetchAlertStats } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edu_user');
    return saved ? JSON.parse(saved) : {
      email: 'teacher@example.com',
      full_name: 'Dr. Eleanor Vance',
      role: 'Head Teacher / Counselor'
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [predictionStudentData, setPredictionStudentData] = useState(null);
  const [alertCount, setAlertCount] = useState(0);

  const refreshAlertCount = () => {
    fetchAlertStats()
      .then(stats => {
        setAlertCount(stats?.new_alerts || 0);
      })
      .catch(() => setAlertCount(0));
  };

  useEffect(() => {
    if (user) {
      refreshAlertCount();
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('edu_user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edu_user');
  };

  const handleOpenStudentDetail = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleOpenPredictionWithData = (student) => {
    setPredictionStudentData(student);
    setActiveTab('prediction');
  };

  // If not logged in, render Login screen
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alertCount}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Application Area */}
      <div className="main-wrapper">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            if (activeTab !== 'students') {
              setActiveTab('students');
            }
          }}
          onOpenPrediction={() => {
            setPredictionStudentData(null);
            setActiveTab('prediction');
          }}
          onOpenAlerts={() => setActiveTab('alerts')}
          alertCount={alertCount}
        />

        {/* View Routing */}
        <main>
          {activeTab === 'dashboard' && (
            <DashboardPage
              onSelectStudent={handleOpenStudentDetail}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              onSelectStudent={handleOpenStudentDetail}
              onOpenPrediction={() => {
                setPredictionStudentData(null);
                setActiveTab('prediction');
              }}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === 'prediction' && (
            <PredictionPage
              initialStudentData={predictionStudentData}
              onStudentSaved={() => {
                refreshAlertCount();
              }}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage onSelectStudent={handleOpenStudentDetail} />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsPage onSelectStudent={handleOpenStudentDetail} />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'settings' && <SettingsPage user={user} />}
        </main>
      </div>

      {/* Student Details & Explainable Insights Modal */}
      {selectedStudentId && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onOpenPredictionWithData={handleOpenPredictionWithData}
        />
      )}
    </div>
  );
}
