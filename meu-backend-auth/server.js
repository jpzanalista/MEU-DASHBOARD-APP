require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid'); // Para gerar tokens únicos
const cors = require('cors'); // Para permitir requisições do seu frontend React
const db = require('./db'); // Importa a conexão com o banco de dados

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Para parsear o corpo das requisições JSON
app.use(cors()); // Permite que seu frontend React faça requisições

// Configuração do Nodemailer (para enviar e-mails)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Ou 'outlook', 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Rota para Solicitar Redefinição de Senha ---
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário para recuperação:', err.message);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
    if (!user) {
      // Para segurança, sempre retornar uma mensagem genérica,
      // para não informar se o e-mail existe ou não.
      return res.status(200).json({ message: 'Se o e-mail estiver registrado, um link de redefinição de senha será enviado.' });
    }

    // Gera um token de redefinição e define a expiração (ex: 1 hora)
    const resetToken = uuidv4();
    const expires = Date.now() + 3600000; // 1 hora a partir de agora em milissegundos

    db.run(
      'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
      [resetToken, expires, user.id],
      (updateErr) => {
        if (updateErr) {
          console.error('Erro ao atualizar token de redefinição:', updateErr.message);
          return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        // Envia o e-mail com o link de redefinição
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Redefinição de Senha - Projeto Faculdade',
          html: `
            <h2>Olá!</h2>
            <p>Você solicitou a redefinição de senha para sua conta.</p>
            <p>Por favor, clique no link abaixo para redefinir sua senha:</p>
            <a href="http://localhost:3000/reset-password?token=${resetToken}">Redefinir Senha</a>
            <p>Este link expirará em 1 hora.</p>
            <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Erro ao enviar e-mail de redefinição:', error);
            return res.status(500).json({ message: 'Falha ao enviar e-mail de redefinição de senha.' });
          }
          console.log('Email de redefinição enviado:', info.response);
          res.status(200).json({ message: 'Se o e-mail estiver registrado, um link de redefinição de senha será enviado.' });
        });
      }
    );
  });
});

// --- Rota para Redefinir a Senha ---
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
  }

  db.get('SELECT * FROM users WHERE password_reset_token = ?', [token], async (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário para redefinição:', err.message);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    // Verifica se o token expirou
    if (user.password_reset_expires < Date.now()) {
      return res.status(400).json({ message: 'Token expirado. Por favor, solicite um novo.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(
      'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [hashedPassword, user.id],
      (updateErr) => {
        if (updateErr) {
          console.error('Erro ao redefinir senha:', updateErr.message);
          return res.status(500).json({ message: 'Erro interno ao redefinir a senha.' });
        }
        res.status(200).json({ message: 'Senha redefinida com sucesso. Você pode fazer login agora.' });
      }
    );
  });
});

// 1. Rota de Registro
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a senha
    const verificationToken = uuidv4(); // Gera um token de verificação único

    db.run(
      'INSERT INTO users (email, password, verification_token) VALUES (?, ?, ?)',
      [email, hashedPassword, verificationToken],
      function(err) { // Use function para ter acesso a `this.lastID`
        if (err) {
          if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(409).json({ message: 'Este e-mail já está registrado.' });
          }
          console.error('Erro ao registrar usuário:', err.message);
          return res.status(500).json({ message: 'Erro interno do servidor.' });
        }

        // Envia o e-mail de verificação
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Confirmação de Registro do seu Email - Equipe de Avaliação',
          html: `
            <h2>Olá!</h2>
            <p>Obrigado por se registrar.</p>
            <p>Por favor, clique no link abaixo para verificar seu e-mail:</p>
            <a href="http://localhost:${PORT}/api/verify-email?token=${verificationToken}">Verificar Email</a>
            <p>Se você não se registrou, por favor, ignore este e-mail.</p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Erro ao enviar e-mail de verificação:', error);
            // Mesmo com erro no email, o usuário já está registrado no DB,
            // mas podemos informar que o email falhou.
            return res.status(500).json({ message: 'Usuário registrado, mas falha ao enviar e-mail de verificação.' });
          }
          console.log('Link de verificação enviado para seu e-mail, por favor, verifique sua caixa de entrada:', info.response);
          res.status(201).json({ message: 'Registro bem-sucedido. Por favor, verifique seu e-mail para ativar sua conta.' });
        });
      }
    );
  } catch (err) {
    console.error('Erro no registro (bcrypt):', err);
    res.status(500).json({ message: 'Erro interno do servidor durante o hash da senha.' });
  }
});

// 2. Rota de Verificação de E-mail
app.get('/api/verify-email', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token de verificação ausente.');
  }

  db.get('SELECT * FROM users WHERE verification_token = ?', [token], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário para verificação:', err.message);
      return res.status(500).send('Erro interno do servidor.');
    }
    if (!user) {
      return res.status(404).send('Token de verificação inválido ou já utilizado.');
    }
    if (user.is_verified) {
      return res.status(200).send('Seu e-mail já foi verificado anteriormente. Você pode fazer login.');
    }

    db.run(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [user.id],
      (updateErr) => {
        if (updateErr) {
          console.error('Erro ao verificar usuário:', updateErr.message);
          return res.status(500).send('Erro interno ao verificar o e-mail.');
        }
        res.status(200).send('Seu e-mail foi verificado com sucesso! Agora você pode fazer login.');
        // Opcional: Redirecionar para a página de login do seu frontend
        // res.redirect('http://localhost:3000/login');
      }
    );
  });
});

// 3. Rota de Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário para login:', err.message);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Compara a senha fornecida com a senha hash no banco de dados
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // Verifica se o e-mail foi verificado
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Por favor, verifique seu e-mail antes de fazer login.' });
    }

    // Gera um token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login bem-sucedido!', token: token });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Para testar: abra seu navegador e vá para http://localhost:${PORT}`);
});