import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, FolderOpen, Users, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

interface Stats {
  properties: { total: number; active: number; sold: number; pending: number; inactive: number };
  totalFiles: number;
  totalExpedientes: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    api.get('/reports/stats').then((res) => {
      setStats(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.loading}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const statCards = [
    {
      label: 'Total Inmuebles',
      value: stats?.properties.total || 0,
      icon: Building2,
      color: 'blue',
      sub: `${stats?.properties.active || 0} activos`,
    },
    {
      label: 'Documentos',
      value: stats?.totalFiles || 0,
      icon: FileText,
      color: 'purple',
      sub: 'Archivos subidos',
    },
    {
      label: 'Expedientes',
      value: stats?.totalExpedientes || 0,
      icon: FolderOpen,
      color: 'teal',
      sub: 'Expedientes totales',
    },
    {
      label: 'Usuarios',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'amber',
      sub: 'Usuarios activos',
    },
  ];

  const statusItems = [
    { label: 'Activos', value: stats?.properties.active || 0, cls: 'active' },
    { label: 'Vendidos', value: stats?.properties.sold || 0, cls: 'sold' },
    { label: 'Pendientes', value: stats?.properties.pending || 0, cls: 'pending' },
    { label: 'Inactivos', value: stats?.properties.inactive || 0, cls: 'inactive' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Bienvenido, {user?.fullName} — {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/properties/new" className={styles.newBtn}>
          <Plus size={16} />
          Nuevo Inmueble
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={`${styles.statCard} ${styles[`card_${card.color}`]}`}>
            <div className={styles.statIcon}>
              <card.icon size={20} />
            </div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{card.value.toLocaleString()}</span>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statSub}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        {/* Status breakdown */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <TrendingUp size={16} />
            <h3>Estado de Inmuebles</h3>
          </div>
          <div className={styles.statusList}>
            {statusItems.map((item) => {
              const pct = stats?.properties.total
                ? Math.round((item.value / stats.properties.total) * 100)
                : 0;
              return (
                <div key={item.label} className={styles.statusRow}>
                  <span className={`badge badge-${item.cls}`}>{item.label}</span>
                  <div className={styles.statusBar}>
                    <div
                      className={`${styles.statusFill} ${styles[`fill_${item.cls}`]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={styles.statusCount}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <ArrowRight size={16} />
            <h3>Acciones Rápidas</h3>
          </div>
          <div className={styles.actionList}>
            <Link to="/properties" className={styles.actionItem}>
              <Building2 size={16} />
              <div>
                <span>Ver todos los inmuebles</span>
                <small>Lista completa de propiedades</small>
              </div>
              <ArrowRight size={14} className={styles.actionArrow} />
            </Link>
            <Link to="/properties/new" className={styles.actionItem}>
              <Plus size={16} />
              <div>
                <span>Registrar nuevo inmueble</span>
                <small>Agregar propiedad al sistema</small>
              </div>
              <ArrowRight size={14} className={styles.actionArrow} />
            </Link>
            <Link to="/search" className={styles.actionItem}>
              <FileText size={16} />
              <div>
                <span>Búsqueda avanzada</span>
                <small>Filtrar y exportar reportes</small>
              </div>
              <ArrowRight size={14} className={styles.actionArrow} />
            </Link>
            {isAdmin() && (
              <Link to="/users" className={styles.actionItem}>
                <Users size={16} />
                <div>
                  <span>Gestionar usuarios</span>
                  <small>Administrar accesos al sistema</small>
                </div>
                <ArrowRight size={14} className={styles.actionArrow} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
