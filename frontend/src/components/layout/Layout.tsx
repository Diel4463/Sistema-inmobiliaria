import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Building2, Search, Users, LogOut,
  ChevronRight, Menu, X, Sun, Moon, History
} from 'lucide-react';
import { useState } from 'react';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/properties', icon: Building2, label: 'Inmuebles' },
    { to: '/search', icon: Search, label: 'Búsqueda Avanzada' },
    { to: '/activities', icon: History, label: 'Registros' },
    ...(isAdmin() ? [{ to: '/users', icon: Users, label: 'Usuarios' }] : []),
  ];

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Building2 size={20} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>InmoGest</span>
            <span className={styles.logoSub}>Gestión Inmobiliaria</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Menú Principal</span>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                <ChevronRight size={14} className={styles.navChevron} />
              </NavLink>
            ))}
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
          </div>
          <button 
            className={styles.themeBtn} 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={styles.topbarRight}>
            <button 
              className={styles.themeToggleTop} 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className={styles.topbarUser}>
              <span className={`badge badge-${user?.role === 'ADMIN' ? 'active' : user?.role === 'EDITOR' ? 'pending' : 'inactive'}`}>
                {user?.role}
              </span>
              {user?.fullName}
            </span>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
