import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(email, senha);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
            <path d="M7 21h10" />
            <path d="M12 14v4" />
          </svg>
          <h1 style={styles.title}>AutoControl</h1>
          <p style={styles.subtitle}>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {erro && <div style={styles.erro}>{erro}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.hint}>
          Demo: financeiro@autocontrol.com / chefe@autocontrol.com / mecanico@autocontrol.com — senha: 123456
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f1117',
    padding: 16,
  },
  card: {
    background: '#181c27',
    border: '1px solid #252a38',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#e8eaf0',
    fontSize: 24,
    fontWeight: '700',
    margin: '8px 0 4px',
  },
  subtitle: {
    color: '#8b91a8',
    fontSize: 14,
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    color: '#8b91a8',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    background: '#0f1117',
    border: '1px solid #252a38',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#e8eaf0',
    fontSize: 15,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    background: '#f97316',
    border: 'none',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: 8,
  },
  erro: {
    background: '#ef444420',
    border: '1px solid #ef444440',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#ef4444',
    fontSize: 13,
  },
  hint: {
    color: '#3a4055',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 1.5,
  },
};
