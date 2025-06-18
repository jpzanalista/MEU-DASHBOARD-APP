import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Vamos criar este CSS também

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // URL de incorporação do seu dashboard do Power BI
  const powerBiEmbedUrl = "https://app.powerbi.com/view?r=eyJrIjoiNzkxZDVkY2ItNmRhNC00ZWJlLWE0OWItN2YyZTBiZjM2NDY0IiwidCI6IjdmYjk3NDBiLWVkNGMtNGE3Ny1iOTMxLWZmNzMxNjRlZTM0ZSJ9";

  useEffect(() => {
    // Verifica se há um token de usuário no localStorage
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Se não houver token, redireciona para a página de login
      navigate('/login');
    } else {
      // Opcional: Se você quiser decodificar o token para pegar o email ou nome do usuário
      // Para decodificar JWT no frontend, você precisaria de uma biblioteca como 'jwt-decode'
      // Ou simplesmente assumir que o usuário está logado
      // Por simplicidade aqui, vamos apenas indicar que está logado.
      try {
        // Se você quiser o email do usuário do token, pode fazer algo como:
        // const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificação básica do JWT (não use para segurança)
        // setUserName(decodedToken.email || 'Usuário');
        setUserName('Usuário Autenticado'); // Placeholder
      } catch (e) {
        console.error("Erro ao decodificar token:", e);
        setUserName('Usuário Autenticado');
      }
    }
  }, [navigate]); // O useEffect roda quando o componente é montado ou quando 'navigate' muda

  const handleLogout = () => {
    localStorage.removeItem('userToken'); // Remove o token
    navigate('/login'); // Redireciona para o login
  };

  if (!localStorage.getItem('userToken')) {
    return null; // Não renderiza nada se não estiver logado, pois o useEffect já redirecionou
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bem-vindo(a), {userName}!</h1>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>
      <div className="dashboard-content">
        <h2>CRE 10 - Rede Estadual</h2>
        <iframe
          title="SAEMS-DADOS-HABILIDADES"
          width="100%"
          height="600"
          src={powerBiEmbedUrl}
          frameBorder="0"
          allowFullScreen={true}
        ></iframe>
        <p>Este é o seu dashboard privado, acessível apenas após o login.</p>
      </div>
    </div>
  );
}

export default DashboardPage;