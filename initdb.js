import mysql from 'mysql2/promise';

async function init() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '30mariafn@';
  const database = process.env.DB_NAME || 'flowai';

  console.log(`[INITDB] Iniciando inicialização do banco em ${host}:${port}...`);

  try {
    // Conecta sem especificar o banco primeiro, para criá-lo caso não exista
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    console.log(`[INITDB] Conexão com MariaDB estabelecida. Criando banco '${database}' se não existir...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // Conecta diretamente ao banco de dados criado
    const dbConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    console.log('[INITDB] Conectado ao banco. Criando tabelas de forma idempotente...');
    
    // Cria tabela de auditoria/log se não existir
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insere um registro inicial se a tabela estiver vazia
    const [rows] = await dbConnection.query('SELECT COUNT(*) as count FROM system_logs');
    if (rows[0].count === 0) {
      await dbConnection.query("INSERT INTO system_logs (action, details) VALUES ('database_init', 'Banco de dados inicializado de forma idempotente.');");
      console.log('[INITDB] Registro de inicialização criado.');
    }

    await dbConnection.end();
    console.log('[INITDB] Banco de dados inicializado com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('[INITDB] Erro ao inicializar o banco:', error);
    process.exit(1);
  }
}

init();
