/**
 * /api/os
 *
 * GET    /api/os               – lista paginada (filtros: status, placa, data)
 * POST   /api/os               – cria nova OS
 * GET    /api/os/:id           – detalhe com itens
 * PATCH  /api/os/:id/status    – muda status; ao mudar p/ 'concluido' dispara WhatsApp
 * PATCH  /api/os/:id/pagamento – atualiza status de pagamento
 *
 * POST   /api/os/:id/itens     – adiciona item à OS
 * PATCH  /api/os/:id/itens/:itemId – atualiza item (status, valores)
 */

import { Router, Request, Response } from 'express';
import type {
  CriarOSInput,
  CriarItemOSInput,
  AtualizarStatusOSInput,
  AtualizarPagamentoInput,
} from '@autocontrol/shared';

export const ordemServicoRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// MOCK em memória — substitua por queries ao PostgreSQL (ex: via Prisma/Drizzle)
// ─────────────────────────────────────────────────────────────────────────────
const db = {
  os: [] as any[],
  itens: [] as any[],
  veiculos: [] as any[],
  clientes: [] as any[],
};

let osCounter = 0;

function gerarNumeroOS() {
  return `OS-${String(++osCounter).padStart(5, '0')}`;
}

// ─── Lista de OS ──────────────────────────────────────────────────────────────
ordemServicoRouter.get('/', (req: Request, res: Response) => {
  const { status, placa, pagina = '1', porPagina = '20' } = req.query as Record<string, string>;

  let resultado = db.os.map((os) => ({
    ...os,
    veiculo: db.veiculos.find((v) => v.id === os.veiculoId),
    itens: db.itens.filter((i) => i.osId === os.id),
  }));

  if (status) resultado = resultado.filter((os) => os.status === status);
  if (placa)
    resultado = resultado.filter((os) =>
      os.veiculo?.placa.toLowerCase().includes(placa.toLowerCase())
    );

  const total = resultado.length;
  const p = Number(pagina);
  const pp = Number(porPagina);
  const data = resultado.slice((p - 1) * pp, p * pp);

  return res.json({ data, total, pagina: p, porPagina: pp });
});

// ─── Cria OS ──────────────────────────────────────────────────────────────────
ordemServicoRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as CriarOSInput;

  const os = {
    id: crypto.randomUUID(),
    numero: gerarNumeroOS(),
    ...body,
    status: 'aguardando_diagnostico',
    statusPagamento: 'pendente',
    totalMaoObra: 0,
    totalPecas: 0,
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.os.push(os);
  return res.status(201).json(os);
});

// ─── Detalhe OS ───────────────────────────────────────────────────────────────
ordemServicoRouter.get('/:id', (req: Request, res: Response) => {
  const os = db.os.find((o) => o.id === req.params.id);
  if (!os) return res.status(404).json({ erro: 'OS não encontrada' });

  const veiculo = db.veiculos.find((v) => v.id === os.veiculoId);
  const cliente = veiculo ? db.clientes.find((c) => c.id === veiculo.clienteId) : null;
  const itens = db.itens.filter((i) => i.osId === os.id);

  return res.json({ ...os, veiculo: veiculo ? { ...veiculo, cliente } : null, itens });
});

// ─── Atualiza status ──────────────────────────────────────────────────────────
ordemServicoRouter.patch('/:id/status', async (req: Request, res: Response) => {
  const os = db.os.find((o) => o.id === req.params.id);
  if (!os) return res.status(404).json({ erro: 'OS não encontrada' });

  const { status } = req.body as AtualizarStatusOSInput;
  os.status = status;
  os.updatedAt = new Date().toISOString();

  // ─── Disparo de WhatsApp ao concluir ────────────────────────────────────────
  if (status === 'concluido') {
    const veiculo = db.veiculos.find((v) => v.id === os.veiculoId);
    const cliente = veiculo ? db.clientes.find((c) => c.id === veiculo.clienteId) : null;
    const itensFeitos = db.itens
      .filter((i) => i.osId === os.id && i.status === 'concluido')
      .map((i) => i.descricao);

    if (cliente?.telefone) {
      await dispararWhatsApp(cliente.telefone, {
        nomeCliente: cliente.nome,
        placa: veiculo.placa,
        modelo: `${veiculo.marca} ${veiculo.modelo}`,
        servicos: itensFeitos,
        numeroOS: os.numero,
      }).catch((err) => console.error('[WhatsApp] falha no envio:', err));
    }
  }

  return res.json(os);
});

// ─── Atualiza pagamento ───────────────────────────────────────────────────────
ordemServicoRouter.patch('/:id/pagamento', (req: Request, res: Response) => {
  const os = db.os.find((o) => o.id === req.params.id);
  if (!os) return res.status(404).json({ erro: 'OS não encontrada' });

  const { statusPagamento } = req.body as AtualizarPagamentoInput;
  os.statusPagamento = statusPagamento;
  os.updatedAt = new Date().toISOString();

  return res.json(os);
});

// ─── Adiciona item à OS ───────────────────────────────────────────────────────
ordemServicoRouter.post('/:id/itens', (req: Request, res: Response) => {
  const os = db.os.find((o) => o.id === req.params.id);
  if (!os) return res.status(404).json({ erro: 'OS não encontrada' });

  const body = req.body as CriarItemOSInput;
  const item = {
    id: crypto.randomUUID(),
    osId: os.id,
    ...body,
    status: 'pendente',
    valorMaoObra: 0,
    valorPecas: 0,
    createdAt: new Date().toISOString(),
  };

  db.itens.push(item);
  return res.status(201).json(item);
});

// ─── Atualiza item ────────────────────────────────────────────────────────────
ordemServicoRouter.patch('/:id/itens/:itemId', (req: Request, res: Response) => {
  const item = db.itens.find(
    (i) => i.id === req.params.itemId && i.osId === req.params.id
  );
  if (!item) return res.status(404).json({ erro: 'Item não encontrado' });

  Object.assign(item, req.body);
  if (req.body.status === 'concluido') item.concluidoEm = new Date().toISOString();

  // Recalcula totais da OS
  const os = db.os.find((o) => o.id === req.params.id)!;
  const todosItens = db.itens.filter((i) => i.osId === os.id);
  os.totalMaoObra = todosItens.reduce((s: number, i: any) => s + (i.valorMaoObra ?? 0), 0);
  os.totalPecas = todosItens.reduce((s: number, i: any) => s + (i.valorPecas ?? 0), 0);
  os.total = os.totalMaoObra + os.totalPecas;

  return res.json(item);
});

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp via Meta Cloud API (templates pré-aprovados)
// ─────────────────────────────────────────────────────────────────────────────
async function dispararWhatsApp(
  telefone: string,
  dados: {
    nomeCliente: string;
    placa: string;
    modelo: string;
    servicos: string[];
    numeroOS: string;
  }
) {
  const listaServicos = dados.servicos
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');

  /**
   * Template "servico_concluido" pré-aprovado na Meta:
   *   "Olá {{1}}, seu veículo {{2}} ({{3}}) está pronto!
   *    Serviços realizados:\n{{4}}\n
   *    Ref: {{5}}"
   */
  const payload = {
    messaging_product: 'whatsapp',
    to: telefone,
    type: 'template',
    template: {
      name: 'servico_concluido',
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: dados.nomeCliente },
            { type: 'text', text: dados.placa },
            { type: 'text', text: dados.modelo },
            { type: 'text', text: listaServicos },
            { type: 'text', text: dados.numeroOS },
          ],
        },
      ],
    },
  };

  const resp = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`WhatsApp API ${resp.status}: ${err}`);
  }

  return resp.json();
}
