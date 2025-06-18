import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css'; // Reutiliza o CSS de autenticação

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message); // Ex: "Se o e-mail estiver registrado, um link..."

    } catch (error) {
      console.error('Erro de rede ou servidor:', error);
      setMessage('Erro de conexão com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Recuperar Senha</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <p>Digite seu e-mail para receber um link de redefinição de senha.</p>
        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
        </button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <p className="auth-link-text">
        Lembrou da senha? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;