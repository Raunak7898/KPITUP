import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectBoardPage from './pages/ProjectBoardPage';
import TeamPage from './pages/TeamPage';
import MyTasksPage from './pages/MyTasksPage';
import MembersPage from './pages/MembersPage';
import ProjectsPage from './pages/ProjectsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import BacklogPage from './pages/BacklogPage';
import ReportsPage from './pages/ReportsPage';
import CalendarPage from './pages/RoadmapPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SettingsPage from './pages/SettingsPage';
import { useStore } from './store';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        
        <Route path="/project/:id" element={
          <PrivateRoute>
            <ProjectBoardPage />
          </PrivateRoute>
        } />
        
        <Route path="/project/:id/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
        
        <Route path="/admin" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
        <Route path="/my-tasks" element={<PrivateRoute><MyTasksPage /></PrivateRoute>} />
        <Route path="/members" element={<PrivateRoute><MembersPage /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/activities" element={<PrivateRoute><ActivitiesPage /></PrivateRoute>} />
        <Route path="/backlog" element={<PrivateRoute><BacklogPage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
        <Route path="/roadmap" element={<Navigate to="/calendar" replace />} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
