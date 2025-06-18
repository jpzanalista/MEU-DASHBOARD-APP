const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco de dados (será criado na raiz do projeto)
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    // Cria a tabela de usuários se ela não existir
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT UNIQUE,
    password_reset_token TEXT UNIQUE,     -- Nova coluna
    password_reset_expires INTEGER        -- Nova coluna (timestamp em milissegundos)
    )`, (createErr) => {
    if (createErr) {
        console.error('Erro ao criar tabela de usuários:', createErr.message);
    } else {
        console.log('Tabela de usuários verificada/criada.');
    }
    });
  }
});

module.exports = db;