// ─── Enums ────────────────────────────────────────────────────────────────────

export type PapelUsuario = 'mecanico' | 'chefe' | 'financeiro' | 'admin';

export type StatusOS =
  | 'aguardando_diagnostico'
  | 'em_reparo'
  | 'aguardando_aprovacao'
  | 'aprovado'
  | 'concluido'
  | 'cancelado';

export type StatusPagamento = 'pendente' | 'pago' | 'parcelado';

export type NivelCombustivel = 'vazio' | 'quarto' | 'meio' | 'cheio';

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  nome: string;
  telefone: string; // formato: 5511999999999
  cpf?: string;
  email?: string;
  createdAt: string;
}

export interface Veiculo {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  createdAt: string;
}

export interface OrdemServico {
  id: string;
  numero: string; // ex: OS-00258
  veiculoId: string;
  veiculo?: Veiculo & { cliente: Cliente };
  kmEntrada: number;
  nivelCombustivel: NivelCombustivel;
  relatoCliente?: string;
  status: StatusOS;
  statusPagamento: StatusPagamento;
  totalMaoObra: number;
  totalPecas: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  itens?: ItemOS[];
}

export interface ItemOS {
  id: string;
  osId: string;
  descricao: string;
  tipo: 'defeito' | 'reparo' | 'revisao';
  status: 'pendente' | 'em_andamento' | 'concluido';
  responsavel?: string;
  concluidoEm?: string;
  valorMaoObra: number;
  valorPecas: number;
}

// ─── DTOs de entrada ──────────────────────────────────────────────────────────

export interface CriarOSInput {
  veiculoId: string;
  kmEntrada: number;
  nivelCombustivel: NivelCombustivel;
  relatoCliente?: string;
}

export interface CriarItemOSInput {
  descricao: string;
  tipo: ItemOS['tipo'];
}

export interface AtualizarStatusOSInput {
  status: StatusOS;
}

export interface AtualizarPagamentoInput {
  statusPagamento: StatusPagamento;
}

// ─── Respostas paginadas ──────────────────────────────────────────────────────

export interface Pagina<T> {
  data: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
