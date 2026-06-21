import { Router, Request, Response } from 'express';

export const clienteRouter = Router();

const clientes: any[] = [];

clienteRouter.get('/', (_req, res) => res.json(clientes));

clienteRouter.post('/', (req: Request, res: Response) => {
  const cliente = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
  clientes.push(cliente);
  return res.status(201).json(cliente);
});

clienteRouter.get('/:id', (req: Request, res: Response) => {
  const c = clientes.find((c) => c.id === req.params.id);
  return c ? res.json(c) : res.status(404).json({ erro: 'Cliente não encontrado' });
});

clienteRouter.patch('/:id', (req: Request, res: Response) => {
  const c = clientes.find((c) => c.id === req.params.id);
  if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
  Object.assign(c, req.body);
  return res.json(c);
});
