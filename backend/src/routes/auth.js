const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';

// Cadastro de novo usuário
router.post('/cadastro', async (req, res) => {
  try {
    const { email, senha, nome, tipo } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ erro: 'Email, senha e nome são obrigatórios' });
    }

    if (!['admin', 'funcionario', 'usuario'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo de usuário inválido' });
    }

    // Verificar se email já existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo usuário
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          email,
          senha_hash: senhaHash,
          nome,
          tipo: tipo || 'usuario'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Gerar JWT
    const token = jwt.sign(
      { id: data.id, email: data.email, tipo: data.tipo, nome: data.nome },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      token,
      usuario: {
        id: data.id,
        email: data.email,
        nome: data.nome,
        tipo: data.tipo
      }
    });
  } catch (erro) {
    console.error('Erro ao cadastrar:', erro);
    res.status(500).json({ erro: erro.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Usuário desativado' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo
      }
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ erro: erro.message });
  }
});

// Middleware para verificar token
router.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
});

// Verificar token (validar se ainda é válido)
router.get('/verificar', (req, res) => {
  res.json({ valido: true, usuario: req.usuario });
});

module.exports = router;
