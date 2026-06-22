import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { PapelUsuario } from '@autocontrol/shared';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const usuarios: { id: string; nome: string; email: string; senha: string; papel: PapelUsuario }[] = [
  {
    id: '1',
    nome: 'Financeiro',
    email: 'financeiro@autocontrol.com',
    senha: bcrypt.hashSync('123456', 10),
    papel: 'financeiro',
  },
  {
    id: '2',
    nome: 'Chefe de Oficina',
    email: 'chefe@autocontrol.com',
    senha: bcrypt.hashSync('123456', 10),
    papel: 'chefe',
  },
  {
    id: '3',
    nome: 'Mecânico',
    email: 'mecanico@autocontrol.com',
    senha: bcrypt.hashSync('123456', 10),
    papel: 'mecanico',
  },
];

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, senha } = req.body as { email: string; senha: string };

  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, papel: usuario.papel, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
  });
});

export function authMiddleware(req: Request, res: Response, next: () => void) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as any;
    (req as any).usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

export function papelMiddleware(...papeis: PapelUsuario[]) {
  return (req: Request, res: Response, next: () => void) => {
    const usuario = (req as any).usuario as { papel: PapelUsuario };
    if (!usuario || !papeis.includes(usuario.papel)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este papel' });
    }
    next();
  };
}
