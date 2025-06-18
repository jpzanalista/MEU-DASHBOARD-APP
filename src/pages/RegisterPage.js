import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; // Vamos criar este arquivo CSS depois

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Para mensagens de sucesso/erro
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Limpa mensagens anteriores
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/register', { // URL do seu backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // Ex: "Registro bem-sucedido. Verifique seu e-mail."
        // Opcional: Redirecionar após um tempo ou para uma página de "Verificar Email"
        // setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage(data.message || 'Erro ao registrar. Tente novamente.');
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
      <h2>Registrar Nova Conta</h2>
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
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <p className="auth-link-text">
        Já tem uma conta? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
}

export default RegisterPage;