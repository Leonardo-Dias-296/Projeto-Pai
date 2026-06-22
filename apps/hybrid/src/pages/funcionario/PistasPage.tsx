import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import type { OrdemServico } from '@autocontrol/shared';

export function PistasPage() {
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get<OrdemServico[]>('/os')
      .then(setOsList)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p style={{ color: '#ef4444' }}>{erro}</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: '700', marginBottom: 20 }}>Pistas (Ordens de Serviço)</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {osList.map((os) => (
          <div
            key={os.id}
            style={{
              background: '#181c27',
              border: '1px solid #252a38',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ color: '#f97316' }}>{os.numero}</strong>
              <span style={{ color: '#8b91a8', fontSize: 13 }}>{os.status}</span>
            </div>
            {os.veiculo && (
              <div style={{ color: '#8b91a8', fontSize: 13 }}>
                {os.veiculo.marca} {os.veiculo.modelo} - {os.veiculo.placa}
              </div>
            )}
            <div style={{ color: '#8b91a8', fontSize: 13, marginTop: 4 }}>
              {os.veiculo?.cliente?.nome ?? 'Cliente não informado'}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13 }}>
              <span>Total: <strong style={{ color: '#e8eaf0' }}>R$ {os.total.toFixed(2)}</strong></span>
              <span>Pagamento: <strong style={{ color: '#e8eaf0' }}>{os.statusPagamento}</strong></span>
            </div>
          </div>
        ))}
        {osList.length === 0 && <p style={{ color: '#8b91a8' }}>Nenhuma OS encontrada.</p>}
      </div>
    </div>
  );
}
