import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { OrdemServico } from '@autocontrol/shared';

export function DashboardPage() {
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<OrdemServico[]>('/os')
      .then(setOsList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendentes = osList.filter((o) => o.statusPagamento === 'pendente');
  const totalReceber = pendentes.reduce((s, o) => s + o.total, 0);
  const osAbertas = osList.filter((o) => !['concluido', 'cancelado'].includes(o.status));

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: '700', marginBottom: 20 }}>Dashboard Financeiro</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card label="OS Abertas" value={osAbertas.length} />
        <Card label="A Receber" value={`R$ ${totalReceber.toFixed(2)}`} />
        <Card label="Pagas" value={osList.filter((o) => o.statusPagamento !== 'pendente').length} />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>OS Pendentes de Pagamento</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pendentes.map((os) => (
          <div key={os.id} style={{ background: '#181c27', border: '1px solid #252a38', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#f97316' }}>{os.numero}</strong>
              <strong>R$ {os.total.toFixed(2)}</strong>
            </div>
            {os.veiculo && (
              <div style={{ color: '#8b91a8', fontSize: 13, marginTop: 4 }}>
                {os.veiculo.marca} {os.veiculo.modelo} - {os.veiculo.placa}
              </div>
            )}
          </div>
        ))}
        {pendentes.length === 0 && <p style={{ color: '#8b91a8' }}>Nenhuma pendência.</p>}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: '#181c27', border: '1px solid #252a38', borderRadius: 12, padding: 20 }}>
      <div style={{ color: '#8b91a8', fontSize: 13, marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#e8eaf0', fontSize: 24, fontWeight: '700' }}>{value}</div>
    </div>
  );
}
