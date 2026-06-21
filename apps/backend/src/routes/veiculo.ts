import { Router, Request, Response } from 'express';

export const veiculoRouter = Router();

const veiculos: any[] = [];

veiculoRouter.get('/', (req: Request, res: Response) => {
  const { clienteId } = req.query as { clienteId?: string };
  return res.json(clienteId ? veiculos.filter((v) => v.clienteId === clienteId) : veiculos);
});

veiculoRouter.post('/', (req: Request, res: Response) => {
  const veiculo = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
  veiculos.push(veiculo);
  return res.status(201).json(veiculo);
});

veiculoRouter.get('/placa/:placa', (req: Request, res: Response) => {
  const v = veiculos.find(
    (v) => v.placa.toLowerCase() === req.params.placa.toLowerCase()
  );
  return v ? res.json(v) : res.status(404).json({ erro: 'Veículo não encontrado' });
});

veiculoRouter.get('/:id', (req: Request, res: Response) => {
  const v = veiculos.find((v) => v.id === req.params.id);
  return v ? res.json(v) : res.status(404).json({ erro: 'Veículo não encontrado' });
});
