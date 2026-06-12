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

    // 11. Cronograma Projetos
    await db.query(`
      CREATE TABLE IF NOT EXISTS cronograma_projetos (
        id VARCHAR(50) PRIMARY KEY,
        clienteId VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        client_name VARCHAR(255),
        banner_url LONGTEXT,
        logo_url LONGTEXT,
        start_date VARCHAR(100),
        expected_delivery VARCHAR(100),
        status VARCHAR(50) DEFAULT 'aguardando',
        progress INT DEFAULT 0,
        color VARCHAR(50) DEFAULT '#2563EB',
        criadoEm VARCHAR(100) NOT NULL,
        visualizadoresIds LONGTEXT
      );
    `);

    // 12. Cronograma Etapas
    await db.query(`
      CREATE TABLE IF NOT EXISTS cronograma_etapas (
        id VARCHAR(50) PRIMARY KEY,
        projetoId VARCHAR(50) NOT NULL,
        step_order INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        percentage INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'aguardando',
        duration_days INT DEFAULT 15,
        expected_date VARCHAR(100),
        image_url LONGTEXT
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

    // Ensure visualizadoresIds exists in cronograma_projetos
    try {
      await db.query('ALTER TABLE cronograma_projetos ADD COLUMN visualizadoresIds LONGTEXT');
      console.log('[INITDB] Migração: Adicionada coluna visualizadoresIds em cronograma_projetos.');
    } catch (e) {
      // ignore
    }

    // Ensure default master admin user has correct password and token if table already exists
    try {
      const [rows] = await db.query("SELECT id FROM usuarios WHERE id = 'master1'");
      if (rows.length > 0) {
        const encryptedDefaultPass = hashPassword('after2026');
        await db.query(
          "UPDATE usuarios SET password = ?, apiToken = 'flowai_tk_master_admin_default_integration_key' WHERE id = 'master1'",
          [encryptedDefaultPass]
        );
        console.log('[INITDB] Migração: Usuário master1 atualizado com password criptografada e token de integração.');
      }
    } catch (e) {
      console.log('[INITDB] Erro ao garantir dados do usuário master1:', e.message);
    }

    // General migration: hash plain text passwords for all legacy users in database
    try {
      const [users] = await db.query("SELECT id, password FROM usuarios WHERE password IS NOT NULL AND password NOT LIKE '%:%'");
      for (const u of users) {
        const hashed = hashPassword(u.password);
        await db.query("UPDATE usuarios SET password = ? WHERE id = ?", [hashed, u.id]);
        console.log(`[INITDB] Migração: Criptografada senha legada do usuário: ${u.id}`);
      }
    } catch (e) {
      console.log('[INITDB] Erro ao migrar senhas de usuários:', e.message);
    }

    // General migration: hash plain text passwords for all legacy contatos in database
    try {
      const [contacts] = await db.query("SELECT id, password FROM contatos WHERE password IS NOT NULL AND password NOT LIKE '%:%'");
      for (const c of contacts) {
        const hashed = hashPassword(c.password);
        await db.query("UPDATE contatos SET password = ? WHERE id = ?", [hashed, c.id]);
        console.log(`[INITDB] Migração: Criptografada senha legada do contato: ${c.id}`);
      }
    } catch (e) {
      console.log('[INITDB] Erro ao migrar senhas de contatos:', e.message);
    }

    // General migration: ensure all legacy users and contacts have apiTokens
    try {
      const [users] = await db.query("SELECT id FROM usuarios WHERE apiToken IS NULL OR apiToken = ''");
      for (const u of users) {
        const token = 'flowai_tk_' + crypto.randomBytes(16).toString('hex');
        await db.query("UPDATE usuarios SET apiToken = ? WHERE id = ?", [token, u.id]);
        console.log(`[INITDB] Migração: Gerado token para usuário legado: ${u.id}`);
      }
    } catch (e) {
      console.log('[INITDB] Erro ao migrar tokens de usuários:', e.message);
    }

    try {
      const [contacts] = await db.query("SELECT id FROM contatos WHERE apiToken IS NULL OR apiToken = ''");
      for (const c of contacts) {
        const token = 'flowai_tk_' + crypto.randomBytes(16).toString('hex');
        await db.query("UPDATE contatos SET apiToken = ? WHERE id = ?", [token, c.id]);
        console.log(`[INITDB] Migração: Gerado token para contato legado: ${c.id}`);
      }
    } catch (e) {
      console.log('[INITDB] Erro ao migrar tokens de contatos:', e.message);
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

    // Seed Clientes (for demo and cronograma integration)
    const [clienteRows] = await db.query('SELECT COUNT(*) as count FROM clientes');
    if (clienteRows[0].count === 0) {
      await db.query(`
        INSERT INTO clientes (id, agenciaId, razaoSocial, nomeFantasia, cnpj, segmento, endereco, telefones, whatsapp, email, nivelEngajamento, tempoMedioResposta, atrasosContados, aprovacoesContadas, logoUrl)
        VALUES ('cli_aurea', 'ag1', 'Aurea Clube de Benefícios Ltda', 'Aurea Clube', '12.345.678/0001-90', 'Tecnologia', 'Av. Paulista, 1000', '11999999999', '11999999999', 'contato@aurea.com', 'excelente', 2.5, 0, 4, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120')
      `);
      console.log('[INITDB] Seed: Cliente padrão cli_aurea inserido.');
    }

    // Seed Contatos
    const [contatoRows] = await db.query('SELECT COUNT(*) as count FROM contatos');
    if (contatoRows[0].count === 0) {
      const encryptedPass = hashPassword('after2026');
      await db.query(`
        INSERT INTO contatos (id, clienteId, nome, cargo, telefone, whatsapp, email, prioridadeEscalonamento, acessos, password, apiToken)
        VALUES ('cont_aurea', 'cli_aurea', 'Ana da Aurea', 'Gestora de Projetos', '11999999999', '11999999999', 'admin', 1, '["Aprovações de Criativos", "Cronograma de Projetos", "Planejamento de Campanhas", "Calendário de Marketing"]', ?, 'flowai_tk_aurea_client_default_integration_key')
      `, [encryptedPass]);
      console.log('[INITDB] Seed: Contato padrão cont_aurea inserido.');
    }

    // Seed Cronograma Projetos & Etapas
    const [projRows] = await db.query('SELECT COUNT(*) as count FROM cronograma_projetos');
    if (projRows[0].count === 0) {
      const sDate = new Date();
      sDate.setDate(sDate.getDate() - 10);
      const start_date = sDate.toISOString().split('T')[0];
      
      const eDate = new Date(sDate);
      eDate.setDate(eDate.getDate() + 165);
      const expected_delivery = eDate.toISOString().split('T')[0];

      await db.query(`
        INSERT INTO cronograma_projetos (id, clienteId, name, slug, client_name, banner_url, logo_url, start_date, expected_delivery, status, progress, color, criadoEm)
        VALUES ('proj_aurea', 'cli_aurea', 'Aurea Clube de Benefícios', 'aurea-clube', 'Aurea', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120', ?, ?, 'andamento', 12, '#2563EB', ?)
      `, [start_date, expected_delivery, new Date().toISOString()]);

      const DEFAULT_CRONOGRAMA_STEPS = [
        { order: 1, name: 'Requisitos e Coleta de Dados', desc: 'Compreensão das necessidades e regras de negócio.', duration: 15, img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500' },
        { order: 2, name: 'Planejamento do Projeto', desc: 'Definição de prazos, milestones e arquitetura.', duration: 15, img: 'https://images.unsplash.com/photo-1507207611509-ec012433ff52?w=500' },
        { order: 3, name: 'Design UI/UX', desc: 'Prototipação das telas e fluxo de navegação.', duration: 15, img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500' },
        { order: 4, name: 'Aprovação do Design', desc: 'Validação visual com o cliente.', duration: 15, img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500' },
        { order: 5, name: 'Estruturação e Banco de Dados', desc: 'Setup de servidores, repositórios e banco de dados.', duration: 15, img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500' },
        { order: 6, name: 'Desenvolvimento Backend', desc: 'Criação das APIs, lógica de servidor e segurança.', duration: 15, img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500' },
        { order: 7, name: 'Desenvolvimento Frontend', desc: 'Construção da interface e integração com a API.', duration: 15, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500' },
        { order: 8, name: 'Testes Internos (QA)', desc: 'Testes de qualidade para garantir que não existam bugs.', duration: 15, img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=500' },
        { order: 9, name: 'Versão Beta para Cliente', desc: 'Disponibilização da versão Beta para o cliente validar.', duration: 15, img: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=500' },
        { order: 10, name: 'Ajustes Finais', desc: 'Correção de feedback gerado na versão Beta.', duration: 15, img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500' },
        { order: 11, name: 'Publicação nas Lojas', desc: 'Subida oficial do projeto para produção.', duration: 15, img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500' }
      ];

      let stepDate = new Date(start_date);
      for (const step of DEFAULT_CRONOGRAMA_STEPS) {
        stepDate.setDate(stepDate.getDate() + step.duration);
        const expectedDateStr = stepDate.toISOString().split('T')[0];

        let perc = 0;
        let status = 'aguardando';
        if (step.order === 1) { perc = 100; status = 'concluido'; }
        if (step.order === 2) { perc = 30; status = 'andamento'; }

        await db.query(`
          INSERT INTO cronograma_etapas (id, projetoId, step_order, name, description, percentage, status, duration_days, expected_date, image_url)
          VALUES (?, 'proj_aurea', ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'step_aurea_' + step.order,
          step.order,
          step.name,
          step.desc,
          perc,
          status,
          step.duration,
          expectedDateStr,
          step.img
        ]);
      }
      console.log('[INITDB] Seed: Projeto e 11 etapas padrão do cronograma inseridos.');
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
