import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { Property, PropertyStatus, PaginatedResponse, STATUS_LABELS } from '../utils/types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './PropertiesPage.module.css';

export default function PropertiesPage() {
  const [data, setData] = useState<PaginatedResponse<Property> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isAdmin, isEditorOrAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await api.get(`/properties?${params}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Inmueble eliminado');
      fetchProperties();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inmuebles</h1>
          <p className={styles.subtitle}>
            {data?.pagination.total || 0} propiedades registradas
          </p>
        </div>
        {isEditorOrAdmin() && (
          <Link to="/properties/new" className={styles.newBtn}>
            <Plus size={16} />
            Nuevo Inmueble
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={`form-input ${styles.searchInput}`}
            placeholder="Buscar por código, dirección, propietario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterWrap}>
          <Filter size={14} />
          <select
            className={`form-input ${styles.select}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : data?.data.length === 0 ? (
          <div className={styles.empty}>
            <Building2 size={40} />
            <p>No se encontraron inmuebles</p>
            {isEditorOrAdmin() && (
              <Link to="/properties/new" className={styles.newBtn}>
                <Plus size={14} /> Registrar el primero
              </Link>
            )}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Propietario / Dirección</th>
                <th>Municipio</th>
                <th>Tipo Crédito</th>
                <th>Estado</th>
                <th>Docs</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((p) => (
                <tr key={p.id} className={styles.row}>
                  <td>
                    <span className={styles.code}>{p.internalCode}</span>
                  </td>
                  <td>
                    <div className={styles.propInfo}>
                      <span className={styles.propOwner}>{p.propietarioNombre || '—'}</span>
                      <span className={styles.propAddress}>{p.calle || p.ubicacionMigrada || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.muted}>{p.municipio || '—'}</span>
                  </td>
                  <td>
                    <span className={styles.muted}>{p.tipoCredito || '—'}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>
                      {STATUS_LABELS[p.status as PropertyStatus]}
                    </span>
                  </td>
                  <td>
                    <span className={styles.countBadge}>{p._count?.files || 0}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                        onClick={() => navigate(`/properties/${p.id}`)}
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                      </button>
                      {isEditorOrAdmin() && (
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() => navigate(`/properties/${p.id}/edit`)}
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {isAdmin() && (
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteId(p.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Página {page} de {data.pagination.totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            <h3>¿Eliminar inmueble?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteId)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
