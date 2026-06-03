import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper: secure hashing
function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Helper: verify hashing
function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

// Helper: hash password if it's plain text
function hashPasswordIfNeeded(password) {
  if (!password) return null;
  if (password.includes(':') && password.split(':')[0].length === 32) {
    return password; // Already hashed
  }
  return hashPassword(password);
}

// Configuração de pasta estática do build React
app.use(express.static(path.join(__dirname, 'dist')));

// Helper to get MariaDB Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '30mariafn@',
  database: process.env.DB_NAME || 'flowai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Token validation middleware
async function tokenMiddleware(req, res, next) {
  if (req.path === '/health' || req.path === '/api-docs' || req.path === '/api/all-data' || req.path === '/api/login') {
    return next();
  }

  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização não fornecido ou inválido. Use Authorization: Bearer <token>' });
  }

  const token = authHeader.substring(7);
  try {
    // Check in usuarios
    const [users] = await pool.query('SELECT id FROM usuarios WHERE apiToken = ?', [token]);
    if (users.length > 0) {
      req.userId = users[0].id;
      req.userType = 'usuario';
      return next();
    }

    // Check in contatos
    const [contacts] = await pool.query('SELECT id FROM contatos WHERE apiToken = ?', [token]);
    if (contacts.length > 0) {
      req.userId = contacts[0].id;
      req.userType = 'contato';
      return next();
    }

    return res.status(401).json({ error: 'Token de API inválido.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao validar token.' });
  }
}

app.use(tokenMiddleware);

// Helper: safe JSON parsing
function safeParse(val, fallback = []) {
  if (!val) return fallback;
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch (e) {
    return fallback;
  }
}

// Helper: safe JSON stringifying
function safeStringify(val) {
  if (!val) return '[]';
  return typeof val === 'string' ? val : JSON.stringify(val);
}

// API Health Check
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', reason: err.message });
  }
});

// ── SWAGGER OPENAPI SPECIFICATION ──────────────────────────────────────────
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'M.O FLOW API',
    version: '1.0.0',
    description: 'API SaaS para Gestão de Demandas de Marketing, CRM, Central de WhatsApp, Portais de Aprovação e Planejador Mensal.',
  },
  servers: [
    { url: '/api', description: 'Servidor Local Proxy' }
  ],
  paths: {
    '/all-data': {
      get: {
        summary: 'Obter todos os dados do sistema',
        description: 'Retorna todas as tabelas (usuarios, clientes, contatos, demandas, comentarios, historicos, aprovacoes, mensagens de whatsapp, automacoes, planejador) em uma chamada única para inicialização rápida da aplicação.',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/demandas': {
      post: {
        summary: 'Criar uma nova demanda no Kanban',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } }
        },
        responses: { 201: { description: 'Criado' } }
      }
    },
    '/demandas/{id}': {
      put: {
        summary: 'Atualizar uma demanda existente',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Atualizado' } }
      },
      delete: {
        summary: 'Excluir uma demanda do sistema',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Excluído' } }
      }
    },
    '/itens-planejamento': {
      post: {
        summary: 'Cadastrar post programado no planejador de marketing',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 201: { description: 'Criado' } }
      }
    },
    '/itens-planejamento/{id}': {
      put: {
        summary: 'Atualizar post planejado',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Atualizado' } },
      },
      delete: {
        summary: 'Excluir post planejado',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Excluído' } }
      }
    },
    '/comentarios': {
      post: {
        summary: 'Adicionar comentário a uma demanda',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 201: { description: 'Adicionado' } }
      }
    },
    '/aprovacoes': {
      post: {
        summary: 'Registrar histórico de aprovação de arte',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 201: { description: 'Registrado' } }
      }
    },
    '/contatos/{id}': {
      put: {
        summary: 'Atualizar dados de um contato de cliente',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Contato atualizado' } }
      }
    },
    '/usuarios/{id}': {
      put: {
        summary: 'Atualizar dados de um usuário da agência',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Usuário atualizado' } }
      }
    },
    '/login': {
      post: {
        summary: 'Autenticar usuário ou contato',
        description: 'Verifica as credenciais (ID ou E-mail + Senha) com PBKDF2 e retorna o perfil com seu apiToken.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, id: { type: 'string' }, password: { type: 'string' } } } } }
        },
        responses: {
          200: { description: 'Autenticado com sucesso' },
          401: { description: 'Credenciais inválidas' }
        }
      }
    },
    '/usuarios/{id}/token': {
      post: {
        summary: 'Regenerar Token de API de um usuário da agência',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Token regenerado com sucesso' } }
      }
    },
    '/contatos/{id}/token': {
      post: {
        summary: 'Regenerar Token de API de um contato de cliente',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Token regenerado com sucesso' } }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'flowai_tk_'
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── API ROUTES FOR DATA FETCHING ───────────────────────────────────────────

// Fetch All Database Records in a Single Query
app.get('/api/all-data', async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    const [clientes] = await pool.query('SELECT * FROM clientes');
    const [contatosRaw] = await pool.query('SELECT * FROM contatos');
    const [demandasRaw] = await pool.query('SELECT * FROM demandas');
    const [comentariosRaw] = await pool.query('SELECT * FROM comentarios');
    const [historicos] = await pool.query('SELECT * FROM historicos');
    const [aprovacoes] = await pool.query('SELECT * FROM aprovacoes');
    const [mensagensWhatsapp] = await pool.query('SELECT * FROM mensagens_whatsapp');
    const [automacoes] = await pool.query('SELECT * FROM automacoes');
    const [itensPlanejamentoRaw] = await pool.query('SELECT * FROM itens_planejamento');

    // Parse JSON columns
    const contatos = contatosRaw.map(c => ({ ...c, acessos: safeParse(c.acessos) }));
    const demandas = demandasRaw.map(d => ({
      ...d,
      anexos: safeParse(d.anexos),
      aprovadoresIds: safeParse(d.aprovadoresIds),
      slaEstourado: d.slaEstourado === 1
    }));
    const comentarios = comentariosRaw.map(co => ({ ...co, anexos: safeParse(co.anexos) }));
    const itensPlanejamento = itensPlanejamentoRaw.map(it => ({
      ...it,
      aprovadoresIds: safeParse(it.aprovadoresIds)
    }));

    res.json({
      usuarios,
      clientes,
      contatos,
      demandas,
      comentarios,
      historicos,
      aprovacoes,
      mensagensWhatsapp,
      automacoes,
      itensPlanejamento
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Demand
app.post('/api/demandas', async (req, res) => {
  try {
    const d = req.body;
    await pool.query(`
      INSERT INTO demandas (id, clienteId, titulo, descricao, categoria, responsavelId, prioridade, prazo, status, criadoEm, anexos, tempoUltimaRespostaCliente, slaEstourado, aprovadoresIds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      d.id, d.clienteId, d.titulo, d.descricao || '', d.categoria, d.responsavelId,
      d.prioridade, d.prazo, d.status, d.criadoEm, safeStringify(d.anexos),
      d.tempoUltimaRespostaCliente || 0, d.slaEstourado ? 1 : 0, safeStringify(d.aprovadoresIds)
    ]);
    res.status(201).json({ status: 'created', id: d.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Demand
app.put('/api/demandas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    await pool.query(`
      UPDATE demandas 
      SET clienteId = ?, titulo = ?, descricao = ?, categoria = ?, responsavelId = ?, prioridade = ?, prazo = ?, status = ?, criadoEm = ?, anexos = ?, tempoUltimaRespostaCliente = ?, slaEstourado = ?, aprovadoresIds = ?
      WHERE id = ?
    `, [
      d.clienteId, d.titulo, d.descricao || '', d.categoria, d.responsavelId,
      d.prioridade, d.prazo, d.status, d.criadoEm, safeStringify(d.anexos),
      d.tempoUltimaRespostaCliente || 0, d.slaEstourado ? 1 : 0, safeStringify(d.aprovadoresIds),
      id
    ]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Demand
app.delete('/api/demandas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM demandas WHERE id = ?', [id]);
    await pool.query('DELETE FROM comentarios WHERE demandaId = ?', [id]);
    await pool.query('DELETE FROM aprovacoes WHERE demandaId = ?', [id]);
    await pool.query('DELETE FROM historicos WHERE demandaId = ?', [id]);
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Planning Item
app.post('/api/itens-planejamento', async (req, res) => {
  try {
    const it = req.body;
    await pool.query(`
      INSERT INTO itens_planejamento (id, clienteId, mes, titulo, descricao, canal, dataPostagem, categoria, prioridade, responsavelId, aprovadoresIds, demandaGeradaId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      it.id, it.clienteId, it.mes, it.titulo, it.descricao || '', it.canal,
      it.dataPostagem, it.categoria, it.prioridade, it.responsavelId,
      safeStringify(it.aprovadoresIds), it.demandaGeradaId || null
    ]);
    res.status(201).json({ status: 'created', id: it.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Planning Item
app.put('/api/itens-planejamento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const it = req.body;
    await pool.query(`
      UPDATE itens_planejamento 
      SET clienteId = ?, mes = ?, titulo = ?, descricao = ?, canal = ?, dataPostagem = ?, categoria = ?, prioridade = ?, responsavelId = ?, aprovadoresIds = ?, demandaGeradaId = ?
      WHERE id = ?
    `, [
      it.clienteId, it.mes, it.titulo, it.descricao || '', it.canal,
      it.dataPostagem, it.categoria, it.prioridade, it.responsavelId,
      safeStringify(it.aprovadoresIds), it.demandaGeradaId || null,
      id
    ]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Planning Item
app.delete('/api/itens-planejamento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM itens_planejamento WHERE id = ?', [id]);
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Comment
app.post('/api/comentarios', async (req, res) => {
  try {
    const c = req.body;
    await pool.query(`
      INSERT INTO comentarios (id, demandaId, usuarioId, usuarioNome, usuarioRole, conteudo, criadoEm, anexos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [c.id, c.demandaId, c.usuarioId, c.usuarioNome, c.usuarioRole, c.conteudo, c.criadoEm, safeStringify(c.anexos)]);
    res.status(201).json({ status: 'created', id: c.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add History
app.post('/api/historicos', async (req, res) => {
  try {
    const h = req.body;
    await pool.query(`
      INSERT INTO historicos (id, demandaId, usuarioNome, acao, detalhes, tipo, criadoEm)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [h.id, h.demandaId, h.usuarioNome, h.acao, h.detalhes, h.tipo, h.criadoEm]);
    res.status(201).json({ status: 'created', id: h.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save WhatsApp Message
app.post('/api/mensagens-whatsapp', async (req, res) => {
  try {
    const m = req.body;
    await pool.query(`
      INSERT INTO mensagens_whatsapp (id, clienteId, demandaId, direcao, conteudo, midiaUrl, midiaTipo, processadaPorIA, intencaoIA, criadoEm)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [m.id, m.clienteId, m.demandaId || null, m.direcao, m.conteudo, m.midiaUrl || null, m.midiaTipo || null, m.processadaPorIA ? 1 : 0, m.intencaoIA || null, m.criadoEm]);
    res.status(201).json({ status: 'created', id: m.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Approval Request/Response
app.post('/api/aprovacoes', async (req, res) => {
  try {
    const a = req.body;
    await pool.query(`
      INSERT INTO aprovacoes (id, demandaId, arquivoUrl, arquivoNome, arquivoTipo, status, usuarioNome, dataHora, ipAddress, observacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      a.id, a.demandaId, a.arquivoUrl, a.arquivoNome, a.arquivoTipo, a.status,
      a.usuarioNome || null, a.dataHora || null, a.ipAddress || null, a.observacao || null
    ]);
    res.status(201).json({ status: 'created', id: a.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/aprovacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const a = req.body;
    await pool.query(`
      UPDATE aprovacoes
      SET status = ?, usuarioNome = ?, dataHora = ?, ipAddress = ?, observacao = ?
      WHERE id = ?
    `, [a.status, a.usuarioNome, a.dataHora, a.ipAddress, a.observacao, id]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: User or Contact Login
app.post('/api/login', async (req, res) => {
  const { email, id, password } = req.body;
  try {
    if (id) {
      // Login by ID (for agency dropdown list in frontend)
      const [users] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
      if (users.length > 0) {
        const user = users[0];
        if (verifyPassword(password, user.password)) {
          return res.json({ success: true, type: 'usuario', user });
        }
      }
    } else if (email) {
      const emailLower = email.trim().toLowerCase();
      // Login by email (for client login email+password form)
      const [contacts] = await pool.query('SELECT * FROM contatos WHERE email = ?', [emailLower]);
      if (contacts.length > 0) {
        const contact = contacts[0];
        if (verifyPassword(password, contact.password)) {
          return res.json({ success: true, type: 'contato', contact });
        }
      }
      // Check agency users just in case
      const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [emailLower]);
      if (users.length > 0) {
        const user = users[0];
        if (verifyPassword(password, user.password)) {
          return res.json({ success: true, type: 'usuario', user });
        }
      }
    }
    return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Token Regeneration Endpoints
app.post('/api/usuarios/:id/token', async (req, res) => {
  try {
    const { id } = req.params;
    const newToken = 'flowai_tk_' + crypto.randomBytes(16).toString('hex');
    await pool.query('UPDATE usuarios SET apiToken = ? WHERE id = ?', [newToken, id]);
    res.json({ apiToken: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contatos/:id/token', async (req, res) => {
  try {
    const { id } = req.params;
    const newToken = 'flowai_tk_' + crypto.randomBytes(16).toString('hex');
    await pool.query('UPDATE contatos SET apiToken = ? WHERE id = ?', [newToken, id]);
    res.json({ apiToken: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Agency User (Foto/Profile change)
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const u = req.body;
    const encryptedPass = hashPasswordIfNeeded(u.password);
    await pool.query(`
      UPDATE usuarios
      SET nome = ?, email = ?, telefone = ?, whatsapp = ?, cargo = ?, role = ?, fotoUrl = ?, password = ?
      WHERE id = ?
    `, [u.nome, u.email, u.telefone, u.whatsapp, u.cargo, u.role, u.fotoUrl || null, encryptedPass, id]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const u = req.body;
    const encryptedPass = hashPasswordIfNeeded(u.password);
    const apiToken = u.apiToken || ('flowai_tk_' + crypto.randomBytes(16).toString('hex'));
    await pool.query(`
      INSERT INTO usuarios (id, nome, email, telefone, whatsapp, cargo, role, agenciaId, fotoUrl, password, apiToken)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [u.id, u.nome, u.email, u.telefone, u.whatsapp, u.cargo, u.role, u.agenciaId, u.fotoUrl || null, encryptedPass, apiToken]);
    res.status(201).json({ status: 'created', id: u.id, apiToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Client Contacts API
app.post('/api/contatos', async (req, res) => {
  try {
    const c = req.body;
    const encryptedPass = hashPasswordIfNeeded(c.password);
    const apiToken = c.apiToken || ('flowai_tk_' + crypto.randomBytes(16).toString('hex'));
    await pool.query(`
      INSERT INTO contatos (id, clienteId, nome, cargo, telefone, whatsapp, email, prioridadeEscalonamento, acessos, fotoUrl, password, apiToken)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      c.id, c.clienteId, c.nome, c.cargo, c.telefone, c.whatsapp, c.email,
      c.prioridadeEscalonamento || 1, safeStringify(c.acessos), c.fotoUrl || null, encryptedPass, apiToken
    ]);
    res.status(201).json({ status: 'created', id: c.id, apiToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contatos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    const encryptedPass = hashPasswordIfNeeded(c.password);
    await pool.query(`
      UPDATE contatos
      SET clienteId = ?, nome = ?, cargo = ?, telefone = ?, whatsapp = ?, email = ?, prioridadeEscalonamento = ?, acessos = ?, fotoUrl = ?, password = ?
      WHERE id = ?
    `, [
      c.clienteId, c.nome, c.cargo, c.telefone, c.whatsapp, c.email,
      c.prioridadeEscalonamento || 1, safeStringify(c.acessos), c.fotoUrl || null, encryptedPass,
      id
    ]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRM Companies (Clientes) API
app.post('/api/clientes', async (req, res) => {
  try {
    const c = req.body;
    await pool.query(`
      INSERT INTO clientes (id, agenciaId, razaoSocial, nomeFantasia, cnpj, segmento, endereco, telefones, whatsapp, email, nivelEngajamento, tempoMedioResposta, atrasosContados, aprovacoesContadas, calendarioIcs, logoUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      c.id, c.agenciaId, c.razaoSocial, c.nomeFantasia, c.cnpj || '', c.segmento || '',
      c.endereco || '', c.telefones || '', c.whatsapp || '', c.email || '',
      c.nivelEngajamento || 'excelente', c.tempoMedioResposta || 0,
      c.atrasosContados || 0, c.aprovacoesContadas || 0, c.calendarioIcs || null, c.logoUrl || null
    ]);
    res.status(201).json({ status: 'created', id: c.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    await pool.query(`
      UPDATE clientes
      SET agenciaId = ?, razaoSocial = ?, nomeFantasia = ?, cnpj = ?, segmento = ?, endereco = ?, telefones = ?, whatsapp = ?, email = ?, nivelEngajamento = ?, tempoMedioResposta = ?, atrasosContados = ?, aprovacoesContadas = ?, calendarioIcs = ?, logoUrl = ?
      WHERE id = ?
    `, [
      c.agenciaId, c.razaoSocial, c.nomeFantasia, c.cnpj || '', c.segmento || '',
      c.endereco || '', c.telefones || '', c.whatsapp || '', c.email || '',
      c.nivelEngajamento || 'excelente', c.tempoMedioResposta || 0,
      c.atrasosContados || 0, c.aprovacoesContadas || 0, c.calendarioIcs || null, c.logoUrl || null,
      id
    ]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Automations
app.put('/api/automacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const a = req.body;
    await pool.query(`
      UPDATE automacoes
      SET ativa = ?
      WHERE id = ?
    `, [a.ativa ? 1 : 0, id]);
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Todas as outras rotas servem o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SERVER] Aplicação iniciada na porta ${PORT}`);
});
