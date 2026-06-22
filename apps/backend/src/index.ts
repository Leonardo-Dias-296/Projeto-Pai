import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { ordemServicoRouter } from './routes/ordemServico';
import { veiculoRouter } from './routes/veiculo';
import { clienteRouter } from './routes/cliente';
import { placaRouter } from './routes/placa';

const app = express();

app.use(cors());
app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/placa', placaRouter);
app.use('/api/clientes', clienteRouter);
app.use('/api/veiculos', veiculoRouter);
app.use('/api/os', ordemServicoRouter);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Backend rodando em :${PORT}`));
