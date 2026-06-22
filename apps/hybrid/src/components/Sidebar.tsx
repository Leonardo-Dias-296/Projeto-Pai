import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linksPorPapel: Record<string, { to: string; label: string }[]> = {
  financeiro: [
    { to: '/financeiro', label: 'Dashboard' },
  ],
  chefe: [
    { to: '/funcionario/pistas', label: 'Pistas' },
  ],
  mecanico: [
    { to: '/funcionario/pistas', label: 'Pistas' },
  ],
};

export function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const links = usuario ? linksPorPapel[usuario.papel] ?? [] : [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside style={styles.aside}>
      <div style={styles.header}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 21h10" />
          <path d="M12 14v4" />
        </svg>
        <span style={styles.title}>AutoControl</span>
      </div>

      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{usuario?.nome}</div>
          <div style={styles.userPapel}>{usuario?.papel}</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sair
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  aside: {
    width: 240,
    background: '#181c27',
    borderRight: '1px solid #252a38',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px',
    borderBottom: '1px solid #252a38',
  },
  title: {
    color: '#e8eaf0',
    fontSize: 16,
    fontWeight: '700',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  link: {
    display: 'block',
    padding: '10px 14px',
    borderRadius: 8,
    color: '#8b91a8',
    fontSize: 14,
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  linkActive: {
    background: '#f9731615',
    color: '#f97316',
    fontWeight: '600',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #252a38',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  userInfo: {},
  userName: {
    color: '#e8eaf0',
    fontSize: 13,
    fontWeight: '600',
  },
  userPapel: {
    color: '#8b91a8',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #252a38',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#8b91a8',
    fontSize: 13,
    cursor: 'pointer',
  },
};
