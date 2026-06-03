import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DEFAULT_USUARIOS = [
  { id: 'master1', nome: 'M.O publicidade', email: 'master@flowai.com', telefone: '', whatsapp: '', cargo: 'Master Admin', role: 'agencia', agenciaId: 'ag1', password: 'after2026', apiToken: 'flowai_tk_master_admin_default_integration_key' }
];

const DEFAULT_AUTOMACOES = [
  { id: 'au1', agenciaId: 'ag1', evento: 'aprovacao', acao: 'notificar_designer', ativa: true },
  { id: 'au2', agenciaId: 'ag1', evento: 'aprovacao', acao: 'atualizar_kanban', ativa: true },
  { id: 'au3', agenciaId: 'ag1', evento: 'aprovacao', acao: 'enviar_confirmacao', ativa: true },
  { id: 'au4', agenciaId: 'ag1', evento: 'prazo_vencido', acao: 'cobrar_whatsapp', ativa: true },
  { id: 'au5', agenciaId: 'ag1', evento: 'prazo_vencido', acao: 'escalonar_responsaveis', ativa: true }
];

// Helper: secure hashing
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

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
    const db = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    console.log('[INITDB] Conectado ao banco. Criando tabelas de forma idempotente...');

    // 1. Usuarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefone VARCHAR(50),
        whatsapp VARCHAR(50),
        cargo VARCHAR(100),
        role VARCHAR(50) NOT NULL,
        agenciaId VARCHAR(50) NOT NULL,
        clienteId VARCHAR(50),
        fotoUrl LONGTEXT,
        password VARCHAR(255),
        apiToken VARCHAR(255)
      );
    `);

    // 2. Clientes
    await db.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id VARCHAR(50) PRIMARY KEY,
        agenciaId VARCHAR(50) NOT NULL,
        razaoSocial VARCHAR(255) NOT NULL,
        nomeFantasia VARCHAR(255) NOT NULL,
        cnpj VARCHAR(50),
        segmento VARCHAR(100),
        endereco VARCHAR(255),
        telefones VARCHAR(100),
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        nivelEngajamento VARCHAR(50) DEFAULT 'excelente',
        tempoMedioResposta DOUBLE DEFAULT 0.0,
        atrasosContados INT DEFAULT 0,
        aprovacoesContadas INT DEFAULT 0,
        calendarioIcs VARCHAR(255),
        logoUrl LONGTEXT
      );
    `);

    // 3. Contatos
    await db.query(`
      CREATE TABLE IF NOT EXISTS contatos (
        id VARCHAR(50) PRIMARY KEY,
        clienteId VARCHAR(50) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        telefone VARCHAR(50),
        whatsapp VARCHAR(50),
        email VARCHAR(255) UNIQUE NOT NULL,
        prioridadeEscalonamento INT DEFAULT 1,
        acessos LONGTEXT,
        fotoUrl LONGTEXT,
        password VARCHAR(255),
        apiToken VARCHAR(255)
      );
    `);

    // 4. Demandas
    await db.query(`
      CREATE TABLE IF NOT EXISTS demandas (
        id VARCHAR(50) PRIMARY KEY,
        clienteId VARCHAR(50) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(100) NOT NULL,
        responsavelId VARCHAR(50) NOT NULL,
        prioridade VARCHAR(50) NOT NULL,
        prazo VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        criadoEm VARCHAR(100) NOT NULL,
        anexos LONGTEXT,
        tempoUltimaRespostaCliente DOUBLE DEFAULT 0.0,
        slaEstourado TINYINT DEFAULT 0,
        aprovadoresIds LONGTEXT
      );
    `);

    // 5. Comentarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id VARCHAR(50) PRIMARY KEY,
        demandaId VARCHAR(50) NOT NULL,
        usuarioId VARCHAR(50) NOT NULL,
        usuarioNome VARCHAR(255) NOT NULL,
        usuarioRole VARCHAR(50) NOT NULL,
        conteudo TEXT NOT NULL,
        criadoEm VARCHAR(100) NOT NULL,
        anexos LONGTEXT
      );
    `);

    // 6. Historicos
    await db.query(`
      CREATE TABLE IF NOT EXISTS historicos (
        id VARCHAR(50) PRIMARY KEY,
        demandaId VARCHAR(50) NOT NULL,
        usuarioNome VARCHAR(255) NOT NULL,
        acao VARCHAR(255) NOT NULL,
        detalhes TEXT,
        tipo VARCHAR(50) NOT NULL,
        criadoEm VARCHAR(100) NOT NULL
      );
    `);

    // 7. Aprovacoes
    await db.query(`
      CREATE TABLE IF NOT EXISTS aprovacoes (
        id VARCHAR(50) PRIMARY KEY,
        demandaId VARCHAR(50) NOT NULL,
        arquivoUrl LONGTEXT NOT NULL,
        arquivoNome VARCHAR(255) NOT NULL,
        arquivoTipo VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        usuarioNome VARCHAR(255),
        dataHora VARCHAR(100),
        ipAddress VARCHAR(100),
        observacao TEXT
      );
    `);

    // 8. Mensagens Whatsapp
    await db.query(`
      CREATE TABLE IF NOT EXISTS mensagens_whatsapp (
        id VARCHAR(50) PRIMARY KEY,
        clienteId VARCHAR(50) NOT NULL,
        demandaId VARCHAR(50),
        direcao VARCHAR(20) NOT NULL,
        conteudo TEXT NOT NULL,
        midiaUrl LONGTEXT,
        midiaTipo VARCHAR(100),
        processadaPorIA TINYINT DEFAULT 0,
        intencaoIA VARCHAR(50),
        criadoEm VARCHAR(100) NOT NULL
      );
    `);

    // 9. Automacoes
    await db.query(`
      CREATE TABLE IF NOT EXISTS automacoes (
        id VARCHAR(50) PRIMARY KEY,
        agenciaId VARCHAR(50) NOT NULL,
        evento VARCHAR(100) NOT NULL,
        acao VARCHAR(100) NOT NULL,
        ativa TINYINT DEFAULT 1
      );
    `);

    // 10. Itens Planejamento
    await db.query(`
      CREATE TABLE IF NOT EXISTS itens_planejamento (
        id VARCHAR(50) PRIMARY KEY,
        clienteId VARCHAR(50) NOT NULL,
        mes VARCHAR(20) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        canal VARCHAR(100) NOT NULL,
        dataPostagem VARCHAR(50) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        prioridade VARCHAR(50) NOT NULL,
        responsavelId VARCHAR(50) NOT NULL,
        aprovadoresIds LONGTEXT,
        demandaGeradaId VARCHAR(50)
      );
    `);

    // Ensure apiToken and password columns exist in usuarios (defensive migrations for existing tables)
    try {
      await db.query('ALTER TABLE usuarios ADD COLUMN apiToken VARCHAR(255)');
      console.log('[INITDB] Migração: Adicionada coluna apiToken em usuarios.');
    } catch (e) {
      // ignore
    }
    try {
      await db.query('ALTER TABLE usuarios ADD COLUMN password VARCHAR(255)');
      console.log('[INITDB] Migração: Adicionada coluna password em usuarios.');
    } catch (e) {
      // ignore
    }

    // Ensure apiToken and password columns exist in contatos (defensive migrations for existing tables)
    try {
      await db.query('ALTER TABLE contatos ADD COLUMN apiToken VARCHAR(255)');
      console.log('[INITDB] Migração: Adicionada coluna apiToken em contatos.');
    } catch (e) {
      // ignore
    }
    try {
      await db.query('ALTER TABLE contatos ADD COLUMN password VARCHAR(255)');
      console.log('[INITDB] Migração: Adicionada coluna password em contatos.');
    } catch (e) {
      // ignore
    }

    // Ensure default master admin user has correct password and token if table already exists
    try {
      const encryptedDefaultPass = hashPassword('after2026');
      await db.query(`
        UPDATE usuarios 
        SET apiToken = COALESCE(apiToken, 'flowai_tk_master_admin_default_integration_key'),
            password = COALESCE(password, ?)
        WHERE id = 'master1'
      `, [encryptedDefaultPass]);
      console.log('[INITDB] Migração: Usuário master1 garantido com password e token válidos.');
    } catch (e) {
      console.log('[INITDB] Erro ao garantir dados do usuário master1:', e.message);
    }

    console.log('[INITDB] Tabelas verificadas. Inserindo dados iniciais (seeds) se necessário...');

    // Seed Usuarios
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM usuarios');
    if (userRows[0].count === 0) {
      for (const u of DEFAULT_USUARIOS) {
        const encryptedPass = hashPassword(u.password);
        await db.query(
          'INSERT INTO usuarios (id, nome, email, telefone, whatsapp, cargo, role, agenciaId, password, apiToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [u.id, u.nome, u.email, u.telefone, u.whatsapp, u.cargo, u.role, u.agenciaId, encryptedPass, u.apiToken]
        );
      }
      console.log('[INITDB] Seed: Usuário master inserido com senha criptografada e token de integração.');
    }

    // Seed Automacoes
    const [autoRows] = await db.query('SELECT COUNT(*) as count FROM automacoes');
    if (autoRows[0].count === 0) {
      for (const a of DEFAULT_AUTOMACOES) {
        await db.query(
          'INSERT INTO automacoes (id, agenciaId, evento, acao, ativa) VALUES (?, ?, ?, ?, ?)',
          [a.id, a.agenciaId, a.evento, a.acao, a.ativa ? 1 : 0]
        );
      }
      console.log('[INITDB] Seed: Automações iniciais inseridas.');
    }

    await db.end();
    console.log('[INITDB] Banco de dados inicializado com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('[INITDB] Erro crítico ao inicializar o banco:', error);
    process.exit(1);
  }
}

init();
