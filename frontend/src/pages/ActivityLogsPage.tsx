import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, User, Building2, Calendar, Filter, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import { ActivityLog, ACTION_LABELS } from '../utils/types';
import toast from 'react-hot-toast';
import styles from './ActivityLogsPage.module.css';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
  });

  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
      });

      const res = await api.get(`/activities?${params}`);
      setLogs(res.data.logs);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      toast.error('Error al cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'pending';
      case 'DELETE': return 'danger';
      default: return 'inactive';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <History size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Registro de Actividad</h1>
            <p className={styles.subtitle}>
              Historial completo de cambios en el sistema · {total} registros
            </p>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className={styles.select}
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Modificación</option>
            <option value="DELETE">Eliminación</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <Building2 size={16} />
          <select
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            className={styles.select}
          >
            <option value="">Todos los tipos</option>
            <option value="Property">Inmuebles</option>
            <option value="User">Usuarios</option>
          </select>
        </div>

        {(filters.action || filters.entityType) && (
          <button
            onClick={() => setFilters({ action: '', entityType: '' })}
            className={styles.clearBtn}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading && page === 1 ? (
        <div className={styles.loading}>
          <div className="spinner" />
          <p>Cargando registros...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.empty}>
          <History size={48} />
          <h3>No hay registros</h3>
          <p>No se encontraron registros con los filtros aplicados</p>
        </div>
      ) : (
        <>
          <div className={styles.timeline}>
            {logs.map((log) => (
              <div key={log.id} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles[`dot${log.action}`]}`} />
                <div className={styles.timelineCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardLeft}>
                      <span className={`badge badge-${getActionColor(log.action)}`}>
                        {ACTION_LABELS[log.action]}
                      </span>
                      <span className={styles.entityType}>{log.entityType}</span>
                    </div>
                    <div className={styles.cardRight}>
                      <Calendar size={14} />
                      <span className={styles.date}>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {log.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className={styles.userName}>{log.user.fullName}</span>
                        <span className={styles.userRole}>@{log.user.username}</span>
                      </div>
                    </div>

                    <p className={styles.description}>{log.description}</p>

                    {log.property && (
                      <Link
                        to={`/properties/${log.property.id}`}
                        className={styles.propertyLink}
                      >
                        <Building2 size={14} />
                        <span>
                          {log.property.internalCode}
                          {log.property.propietarioNombre && ` · ${log.property.propietarioNombre}`}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={styles.paginationBtn}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={styles.paginationBtn}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
