import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; // Vamos criar este arquivo CSS depois

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', { // URL do seu backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userToken', data.token); // Armazena o token
        setMessage('Login bem-sucedido!');
        navigate('/dashboard'); // Redireciona para o dashboard
      } else {
        setMessage(data.message || 'Erro ao fazer login. Credenciais inválidas.');
      }
    } catch (error) {
      console.error('Erro de rede ou servidor:', error);
      setMessage('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
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
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      {/* Adicione este parágrafo abaixo do botão de login ou da mensagem de erro */}
      <p className="auth-link-text">
        <Link to="/forgot-password">Esqueceu sua senha?</Link>
      </p>
      <p className="auth-link-text">
        Não tem uma conta? <Link to="/register">Crie uma aqui</Link>
      </p>
    </div>
  );
}

export default LoginPage;