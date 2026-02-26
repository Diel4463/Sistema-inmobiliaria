import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, FileText, FolderOpen, Pencil, Upload, Trash2,
  MapPin, Calendar, DollarSign, Plus, Download, Eye, X, CheckCircle
} from 'lucide-react';
import api from '../utils/api';
import { Property, Expediente, FileRecord, STATUS_LABELS, PropertyStatus } from '../utils/types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './PropertyDetailPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type Tab = 'atributos' | 'expedientes';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('atributos');
  const [uploading, setUploading] = useState(false);
  const [showNewExp, setShowNewExp] = useState(false);
  const [expForm, setExpForm] = useState({ titulo: '', descripcion: '', adjudicadoPor: '' });
  const { isEditorOrAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`);
      setProperty(res.data);
    } catch {
      toast.error('Error al cargar el inmueble');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperty(); }, [id]);

  const handleUpload = async (files: FileList | null, expedienteId?: string) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    setUploading(true);
    try {
      const url = expedienteId
        ? `/files/upload/${id}/expediente/${expedienteId}`
        : `/files/upload/${id}`;
      await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Archivos subidos correctamente');
      fetchProperty();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.delete(`/files/${fileId}`);
      toast.success('Archivo eliminado');
      fetchProperty();
    } catch {
      toast.error('Error al eliminar archivo');
    }
  };

  const handleCreateExp = async () => {
    if (!expForm.titulo) return toast.error('El título es requerido');
    try {
      await api.post(`/properties/${id}/expedientes`, expForm);
      toast.success('Expediente creado');
      setShowNewExp(false);
      setExpForm({ titulo: '', descripcion: '', adjudicadoPor: '' });
      fetchProperty();
    } catch {
      toast.error('Error al crear expediente');
    }
  };

  const handleDeleteExp = async (expId: string) => {
    try {
      await api.delete(`/properties/${id}/expedientes/${expId}`);
      toast.success('Expediente eliminado');
      fetchProperty();
    } catch {
      toast.error('Error al eliminar expediente');
    }
  };

  const formatCurrency = (val?: string | number | null) => {
    if (!val) return '—';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(val));
  };

  const formatDate = (val?: string | null) => {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'PDF') return '📄';
    if (fileType === 'WORD') return '📝';
    if (fileType === 'IMAGE') return '🖼️';
    return '📎';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) return (
    <div className={styles.loading}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
  );

  if (!property) return null;

  return (
    <div className={styles.page}>
      {/* Back + header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/properties')}>
          <ArrowLeft size={16} />
          Inmuebles
        </button>
        <div className={styles.headerActions}>
          {isEditorOrAdmin() && (
            <Link to={`/properties/${id}/edit`} className={styles.editBtn}>
              <Pencil size={14} />
              Editar
            </Link>
          )}
        </div>
      </div>

      {/* Property header */}
      <div className={styles.propHeader}>
        <div className={styles.propHeaderLeft}>
          <div className={styles.propIconWrap}>
            <Building2 size={22} />
          </div>
          <div>
            <div className={styles.propMeta}>
              <span className={styles.category}>{property.category}</span>
              <span className={styles.metaSep}>|</span>
              <span>{property.propertyType}</span>
            </div>
            <h1 className={styles.propCode}>#{property.internalCode}</h1>
            <p className={styles.propOwner}>{property.propietarioNombre || 'Propietario no registrado'}</p>
          </div>
        </div>
        <div className={styles.propHeaderRight}>
          <span className={`badge badge-${property.status.toLowerCase()}`}>
            {STATUS_LABELS[property.status as PropertyStatus]}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {([
          { key: 'atributos', label: 'Atributos', icon: Building2 },
          { key: 'expedientes', label: 'Expedientes', icon: FolderOpen },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'atributos' && (
        <div className={styles.tabContent}>
          {/* CARACTERÍSTICAS */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin size={15} />
              <h2>Características del Inmueble</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.dataGrid}>
                <DataItem label="N° de Bienes" value={String(property.numeroBienes || 1)} />
                <DataItem label="Uso Actual" value={property.usoActual} />
                <DataItem label="Sup. Terreno" value={property.superficieTerreno} />
                <DataItem label="Sup. Construcción" value={property.superficieConstruccion} />
              </div>
              <div className={styles.dataGridFull}>
                <DataItem label="Dirección (migrada)" value={property.ubicacionMigrada} />
                <DataItem label="Denominado" value={property.denominado} />
                <DataItem label="Vías de Acceso" value={property.viasDeAcceso} />
                <DataItem label="Calle y Número" value={property.calle} />
                <DataItem label="Colonia" value={property.colonia} />
                <DataItem label="Municipio" value={property.municipio} />
                <DataItem label="Estado" value={property.estado} />
                <DataItem label="C.P." value={property.cp} />
                <DataItem label="País" value={property.pais} />
                <DataItem label="Centro de Costos" value={property.centroCostos} />
              </div>
              <div className={styles.checkRow}>
                <CheckItem label="No Cuenta con Agua" active={property.noContaAgua} />
                <CheckItem label="No Cuenta con Predial" active={property.noContaPredial} />
              </div>
              {property.observaciones && (
                <div className={styles.observaciones}>
                  <span className={styles.obsLabel}>Observaciones / Comentarios</span>
                  <p>{property.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          {/* DOCUMENTACIÓN */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={15} />
              <h2>Documentación</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.dataGrid}>
                <DataItem label="Libros" value={property.libros} />
                <DataItem label="N° Expediente" value={property.numeroExpediente} />
                <DataItem label="Tipo de Crédito" value={property.tipoCredito} />
                <DataItem label="RFC Deudor" value={property.rfcDeudor} />
                <DataItem label="Soporte Gravamen" value={property.soporteGravamen} />
              </div>
            </div>
          </div>

          {/* IMPORTES Y FECHAS */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <DollarSign size={15} />
              <h2>Importes y Fechas</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.dataGrid}>
                <DataItem label="Fecha de Registro" value={formatDate(property.fechaRegistro)} />
                <DataItem label="Fecha de Adjudicación" value={formatDate(property.fechaAdjudicacion)} />
                <DataItem label="Importe Adjudicación" value={formatCurrency(property.importeAdjudicacion)} highlight />
                <DataItem label="Importe Adeudo" value={formatCurrency(property.importeAdeudo)} highlight />
                <DataItem label="Valor en Libros" value={formatCurrency(property.valorLibros)} />
                <DataItem label="Fecha Apertura Crédito" value={formatDate(property.fechaAperturaCredito)} />
                <DataItem label="Importe Apertura Crédito" value={formatCurrency(property.importeAperturaCredito)} />
                <DataItem label="Fecha de Avalúo Base" value={formatDate(property.fechaAvaluo)} />
                <DataItem label="Importe Avalúo Base" value={formatCurrency(property.importeAvaluo)} />
                <DataItem label="Fecha Último Avalúo" value={formatDate(property.fechaUltimoAvaluo)} />
                <DataItem label="Importe Último Avalúo" value={formatCurrency(property.importeUltimoAvaluo)} />
              </div>
            </div>
          </div>

          {/* FILES */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={15} />
              <h2>Documentos del Inmueble</h2>
              {isEditorOrAdmin() && (
                <label className={styles.uploadBtn}>
                  {uploading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Upload size={14} />}
                  {uploading ? 'Subiendo...' : 'Subir archivos'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                    style={{ display: 'none' }}
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <div className={styles.sectionBody}>
              {property.files && property.files.filter(f => !f.expedienteId).length === 0 ? (
                <p className={styles.emptyFiles}>No hay documentos adjuntos</p>
              ) : (
                <div className={styles.fileList}>
                  {property.files?.filter(f => !f.expedienteId).map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onDelete={() => handleDeleteFile(file.id)}
                      canDelete={isEditorOrAdmin()}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expedientes' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FolderOpen size={15} />
              <h2>Expedientes</h2>
              {isEditorOrAdmin() && (
                <button className={styles.uploadBtn} onClick={() => setShowNewExp(true)}>
                  <Plus size={14} />
                  Nuevo Expediente
                </button>
              )}
            </div>
            <div className={styles.sectionBody}>
              {showNewExp && (
                <div className={styles.newExpForm}>
                  <h4>Crear Expediente</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label>Título *</label>
                      <input
                        className="form-input"
                        value={expForm.titulo}
                        onChange={(e) => setExpForm({ ...expForm, titulo: e.target.value })}
                        placeholder="Título del expediente"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label>Adjudicado Por</label>
                      <input
                        className="form-input"
                        value={expForm.adjudicadoPor}
                        onChange={(e) => setExpForm({ ...expForm, adjudicadoPor: e.target.value })}
                        placeholder="Nombre"
                      />
                    </div>
                  </div>
                  <div className={styles.formField}>
                    <label>Descripción</label>
                    <textarea
                      className="form-input"
                      value={expForm.descripcion}
                      onChange={(e) => setExpForm({ ...expForm, descripcion: e.target.value })}
                      placeholder="Descripción opcional"
                      rows={2}
                    />
                  </div>
                  <div className={styles.formBtns}>
                    <button className={styles.cancelBtn} onClick={() => setShowNewExp(false)}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={handleCreateExp}>Crear Expediente</button>
                  </div>
                </div>
              )}

              {!property.expedientes?.length ? (
                <p className={styles.emptyFiles}>No hay expedientes registrados</p>
              ) : (
                <div className={styles.expList}>
                  {property.expedientes
                    .sort((a, b) => a.numero - b.numero)
                    .map((exp) => (
                      <ExpedienteItem
                        key={exp.id}
                        exp={exp}
                        canEdit={isEditorOrAdmin()}
                        onDelete={() => handleDeleteExp(exp.id)}
                        onUpload={(files) => handleUpload(files, exp.id)}
                        onDeleteFile={handleDeleteFile}
                        uploading={uploading}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataItem({ label, value, highlight }: { label: string; value?: string | number | null; highlight?: boolean }) {
  return (
    <div className={styles.dataItem}>
      <span className={styles.dataLabel}>{label}</span>
      <span className={`${styles.dataValue} ${highlight ? styles.dataHighlight : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function CheckItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`${styles.checkItem} ${active ? styles.checkActive : ''}`}>
      <CheckCircle size={14} />
      <span>{label}</span>
    </div>
  );
}

function FileItem({ file, onDelete, canDelete }: { file: FileRecord; onDelete: () => void; canDelete: boolean }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const getFileIcon = (ft: string) => {
    if (ft === 'PDF') return '📄';
    if (ft === 'WORD') return '📝';
    if (ft === 'IMAGE') return '🖼️';
    return '📎';
  };

  const formatSize = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  };

  const handleView = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/files/${file.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener archivo');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Error al visualizar el archivo');
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/files/${file.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al descargar archivo');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  return (
    <div className={styles.fileItem}>
      <span className={styles.fileEmoji}>{getFileIcon(file.fileType)}</span>
      <div className={styles.fileInfo}>
        <span className={styles.fileName}>{file.originalName}</span>
        <span className={styles.fileMeta}>
          {formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString('es-MX')}
          {file.uploadedBy && ` · ${file.uploadedBy.fullName}`}
        </span>
      </div>
      <div className={styles.fileActions}>
        <button
          onClick={handleView}
          className={styles.fileViewBtn}
          title="Ver archivo"
        >
          <Eye size={13} />
        </button>
        <button
          onClick={handleDownload}
          className={styles.fileViewBtn}
          title="Descargar"
        >
          <Download size={13} />
        </button>
        {canDelete && (
          <button className={styles.fileDeleteBtn} onClick={onDelete} title="Eliminar">
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function ExpedienteItem({
  exp, canEdit, onDelete, onUpload, onDeleteFile, uploading
}: {
  exp: Expediente;
  canEdit: boolean;
  onDelete: () => void;
  onUpload: (f: FileList | null) => void;
  onDeleteFile: (id: string) => void;
  uploading: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.expItem}>
      <div className={styles.expHeader} onClick={() => setOpen(!open)}>
        <div className={styles.expLeft}>
          <span className={styles.expNum}>#{exp.numero}</span>
          <div>
            <span className={styles.expTitle}>{exp.titulo}</span>
            {exp.adjudicadoPor && (
              <span className={styles.expSub}>Adjudicado por: {exp.adjudicadoPor}</span>
            )}
          </div>
        </div>
        <div className={styles.expRight}>
          <span className={styles.expDate}>{new Date(exp.fechaIngreso).toLocaleDateString('es-MX')}</span>
          <span className={styles.expCount}>{exp.files?.length || 0} archivos</span>
          {canEdit && (
            <label className={styles.expUpload} onClick={(e) => e.stopPropagation()}>
              <Upload size={13} />
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                style={{ display: 'none' }}
                onChange={(e) => onUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
          )}
          {canEdit && (
            <button
              className={styles.expDelete}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Eliminar expediente"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className={styles.expBody}>
          {exp.descripcion && <p className={styles.expDesc}>{exp.descripcion}</p>}
          {!exp.files?.length ? (
            <p className={styles.emptyFiles}>No hay archivos en este expediente</p>
          ) : (
            <div className={styles.fileList}>
              {exp.files.map((f) => (
                <FileItem key={f.id} file={f} onDelete={() => onDeleteFile(f.id)} canDelete={canEdit} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
