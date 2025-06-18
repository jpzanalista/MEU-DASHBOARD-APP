import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Seu CSS global
import App from './App'; // O componente App, que agora será o roteador
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();