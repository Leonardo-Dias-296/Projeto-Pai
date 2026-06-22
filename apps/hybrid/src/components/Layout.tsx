import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    height: '100vh',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: 24,
    background: '#12141c',
  },
};
