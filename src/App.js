import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // <--- NOVA IMPORTAÇÃO
import ResetPasswordPage from './pages/ResetPasswordPage';   // <--- NOVA IMPORTAÇÃO
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ROTAS DE RECUPERAÇÃO DE SENHA */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* <--- NOVA ROTA */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />   {/* <--- NOVA ROTA */}

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;