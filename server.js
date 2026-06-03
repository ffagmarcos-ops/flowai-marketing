import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de pasta estática do build React
app.use(express.static(path.join(__dirname, 'dist')));

// Rota de saúde (Healthcheck)
app.get('/health', async (req, res) => {
  try {
    // Tenta uma consulta simples ao MariaDB para certificar que o banco está saudável
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '30mariafn@',
      database: process.env.DB_NAME || 'flowai'
    });
    await connection.query('SELECT 1');
    await connection.end();
    
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', reason: err.message });
  }
});

// Todas as outras rotas servem o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SERVER] Aplicação iniciada na porta ${PORT}`);
});
