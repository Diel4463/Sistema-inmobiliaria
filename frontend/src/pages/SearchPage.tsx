import { useState } from 'react';
import { Search, Download, Filter, X, FileText, Building2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Property, STATUS_LABELS, PropertyStatus } from '../utils/types';
import toast from 'react-hot-toast';
import styles from './SearchPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface SearchFilters {
  q: string;
  status: string;
  estado: string;
  municipio: string;
  tipoCredito: string;
  minImporte: string;
  maxImporte: string;
  fechaDesde: string;
  fechaHasta: string;
}

const defaultFilters: SearchFilters = {
  q: '', status: '', estado: '', municipio: '', tipoCredito: '',
  minImporte: '', maxImporte: '', fechaDesde: '', fechaHasta: '',
};

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [results, setResults] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const setFilter = (key: keyof SearchFilters, val: string) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', '50');
      const res = await api.get(`/properties/search?${params}`);
      setResults(res.data.data);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.estado) params.set('estado', filters.estado);
      if (filters.municipio) params.set('municipio', filters.municipio);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reports/export/csv?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inmuebles-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exportado correctamente');
    } catch {
      toast.error('Error al exportar CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reports/export/pdf?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const html = await res.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
      }
      toast.success('Reporte PDF generado');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setResults([]);
    setSearched(false);
  };

  const formatCurrency = (val?: string | number | null) => {
    if (!val) return '—';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(val));
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Búsqueda Avanzada</h1>
          <p className={styles.subtitle}>Filtra y exporta reportes de inmuebles</p>
        </div>
        <div className={styles.exportBtns}>
          <button className={styles.exportCSV} onClick={handleExportCSV}>
            <Download size={14} />
            Exportar CSV
          </button>
          <button className={styles.exportPDF} onClick={handleExportPDF}>
            <FileText size={14} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <Filter size={15} />
          <h3>Filtros de Búsqueda</h3>
          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              <X size={13} />
              Limpiar
            </button>
          )}
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label>Búsqueda General</label>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                className="form-input"
                style={{ paddingLeft: 34 }}
                placeholder="Código, propietario, dirección..."
                value={filters.q}
                onChange={(e) => setFilter('q', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className={styles.filterField}>
            <label>Estado del Inmueble</label>
            <select className="form-input" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterField}>
            <label>Estado / Provincia</label>
            <input className="form-input" value={filters.estado} onChange={(e) => setFilter('estado', e.target.value)} placeholder="Ej: Estado de Mexico" />
          </div>
          <div className={styles.filterField}>
            <label>Municipio</label>
            <input className="form-input" value={filters.municipio} onChange={(e) => setFilter('municipio', e.target.value)} placeholder="Ej: Cuautitlan Izcalli" />
          </div>
          <div className={styles.filterField}>
            <label>Tipo de Crédito</label>
            <input className="form-input" value={filters.tipoCredito} onChange={(e) => setFilter('tipoCredito', e.target.value)} placeholder="Ej: HIPOTECARIO" />
          </div>
          <div className={styles.filterField}>
            <label>Importe Mínimo (MXN)</label>
            <input className="form-input" type="number" value={filters.minImporte} onChange={(e) => setFilter('minImporte', e.target.value)} placeholder="0" />
          </div>
          <div className={styles.filterField}>
            <label>Importe Máximo (MXN)</label>
            <input className="form-input" type="number" value={filters.maxImporte} onChange={(e) => setFilter('maxImporte', e.target.value)} placeholder="999999999" />
          </div>
          <div className={styles.filterField}>
            <label>Fecha Adjudicación Desde</label>
            <input className="form-input" type="date" value={filters.fechaDesde} onChange={(e) => setFilter('fechaDesde', e.target.value)} />
          </div>
          <div className={styles.filterField}>
            <label>Fecha Adjudicación Hasta</label>
            <input className="form-input" type="date" value={filters.fechaHasta} onChange={(e) => setFilter('fechaHasta', e.target.value)} />
          </div>
        </div>

        <div className={styles.searchBtnWrap}>
          <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Buscando...</>
            ) : (
              <><Search size={16} /> Buscar Inmuebles</>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <Building2 size={15} />
            <h3>
              {loading ? 'Buscando...' : `${total} resultado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
            </h3>
          </div>

          {!loading && results.length === 0 ? (
            <div className={styles.empty}>
              <Search size={36} />
              <p>No se encontraron inmuebles con los filtros seleccionados</p>
            </div>
          ) : (
            <div className={styles.resultsTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Propietario</th>
                    <th>Dirección</th>
                    <th>Municipio</th>
                    <th>Tipo Crédito</th>
                    <th>Importe Adj.</th>
                    <th>Estado</th>
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.id} className={styles.row}>
                      <td><span className={styles.code}>{p.internalCode}</span></td>
                      <td>{p.propietarioNombre || '—'}</td>
                      <td className={styles.addr}>{p.calle || p.ubicacionMigrada || '—'}</td>
                      <td>{p.municipio || '—'}</td>
                      <td>{p.tipoCredito || '—'}</td>
                      <td className={styles.amount}>{formatCurrency(p.importeAdjudicacion)}</td>
                      <td>
                        <span className={`badge badge-${p.status.toLowerCase()}`}>
                          {STATUS_LABELS[p.status as PropertyStatus]}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate(`/properties/${p.id}`)}
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
