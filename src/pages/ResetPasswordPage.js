import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Reutiliza o CSS de autenticação

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Pega o token da URL (ex: /reset-password?token=SEU_TOKEN)
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setMessage('Token de redefinição ausente na URL.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (!token) {
      setMessage('Token de redefinição inválido ou ausente.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message + ' Você será redirecionado para o login.');
        setTimeout(() => navigate('/login'), 3000); // Redireciona para login após sucesso
      } else {
        setMessage(data.message || 'Erro ao redefinir senha. Token inválido ou expirado.');
      }
    } catch (error) {
      console.error('Erro de rede ou servidor:', error);
      setMessage('Erro de conexão com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <h2>Redefinir Senha</h2>
        <p className="auth-message" style={{ color: 'red' }}>
          Token de redefinição ausente ou inválido.
        </p>
        <p className="auth-link-text">
          <Link to="/forgot-password">Solicitar novo link de redefinição</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="newPassword">Nova Senha:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}

export default ResetPasswordPage;