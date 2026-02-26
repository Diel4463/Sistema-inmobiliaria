import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import styles from './PropertyFormPage.module.css';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'SOLD', label: 'Vendido' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'INACTIVE', label: 'Inactivo' },
];

const defaultForm = {
  internalCode: '', status: 'ACTIVE', propietarioNombre: '',
  ubicacionMigrada: '', denominado: '', viasDeAcceso: '', usoActual: 'HABITACIONAL',
  superficieTerreno: '', superficieConstruccion: '', noContaAgua: false,
  noContaPredial: false, observaciones: '', propertyType: 'CASA HABITACIONAL',
  category: 'MXP UNIFAMILIARES', libros: '', numeroExpediente: '', tipoCredito: 'HIPOTECARIO',
  rfcDeudor: '', soporteGravamen: '', calle: '', colonia: '', municipio: '',
  estado: '', cp: '', pais: 'MEXICO', numeroBienes: 1, centroCostos: '',
  fechaRegistro: '', importeAdjudicacion: '', importeAdeudo: '', valorLibros: '',
  fechaAperturaCredito: '', importeAperturaCredito: '', fechaAvaluo: '',
  importeAvaluo: '', fechaUltimoAvaluo: '', importeUltimoAvaluo: '', fechaAdjudicacion: '',
};

type FormData = typeof defaultForm;

export default function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [activeSection, setActiveSection] = useState<'caracteristicas' | 'documentacion' | 'importes'>('caracteristicas');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/properties/${id}`).then((res) => {
        const p = res.data;
        const toDateInput = (d?: string) => d ? d.split('T')[0] : '';
        setForm({
          internalCode: p.internalCode || '',
          status: p.status || 'ACTIVE',
          propietarioNombre: p.propietarioNombre || '',
          ubicacionMigrada: p.ubicacionMigrada || '',
          denominado: p.denominado || '',
          viasDeAcceso: p.viasDeAcceso || '',
          usoActual: p.usoActual || 'HABITACIONAL',
          superficieTerreno: p.superficieTerreno || '',
          superficieConstruccion: p.superficieConstruccion || '',
          noContaAgua: p.noContaAgua || false,
          noContaPredial: p.noContaPredial || false,
          observaciones: p.observaciones || '',
          propertyType: p.propertyType || 'CASA HABITACIONAL',
          category: p.category || 'MXP UNIFAMILIARES',
          libros: p.libros || '',
          numeroExpediente: p.numeroExpediente || '',
          tipoCredito: p.tipoCredito || 'HIPOTECARIO',
          rfcDeudor: p.rfcDeudor || '',
          soporteGravamen: p.soporteGravamen || '',
          calle: p.calle || '',
          colonia: p.colonia || '',
          municipio: p.municipio || '',
          estado: p.estado || '',
          cp: p.cp || '',
          pais: p.pais || 'MEXICO',
          numeroBienes: p.numeroBienes || 1,
          centroCostos: p.centroCostos || '',
          fechaRegistro: toDateInput(p.fechaRegistro),
          importeAdjudicacion: p.importeAdjudicacion || '',
          importeAdeudo: p.importeAdeudo || '',
          valorLibros: p.valorLibros || '',
          fechaAperturaCredito: toDateInput(p.fechaAperturaCredito),
          importeAperturaCredito: p.importeAperturaCredito || '',
          fechaAvaluo: toDateInput(p.fechaAvaluo),
          importeAvaluo: p.importeAvaluo || '',
          fechaUltimoAvaluo: toDateInput(p.fechaUltimoAvaluo),
          importeUltimoAvaluo: p.importeUltimoAvaluo || '',
          fechaAdjudicacion: toDateInput(p.fechaAdjudicacion),
        });
      }).finally(() => setFetchLoading(false));
    }
  }, [id, isEdit]);

  const set = (key: keyof FormData, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.internalCode) return toast.error('El código interno es requerido');
    
    // Si es edición, mostrar modal para descripción
    if (isEdit) {
      setShowChangeModal(true);
      return;
    }
    
    // Si es creación, enviar directamente
    await submitForm();
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const payload = isEdit 
        ? { ...form, changeDescription } 
        : form;

      if (isEdit) {
        await api.put(`/properties/${id}`, payload);
        toast.success('Inmueble actualizado');
        navigate(`/properties/${id}`);
      } else {
        const res = await api.post('/properties', payload);
        toast.success('Inmueble creado');
        navigate(`/properties/${res.data.id}`);
      }
      setShowChangeModal(false);
      setChangeDescription('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className={styles.loading}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(isEdit ? `/properties/${id}` : '/properties')}>
          <ArrowLeft size={16} />
          {isEdit ? 'Cancelar edición' : 'Cancelar'}
        </button>
      </div>

      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon}><Building2 size={20} /></div>
        <div>
          <h1>{isEdit ? 'Editar Inmueble' : 'Nuevo Inmueble'}</h1>
          <p>{isEdit ? `Editando: ${form.internalCode}` : 'Registrar nueva propiedad en el sistema'}</p>
        </div>
      </div>

      <div className={styles.sectionTabs}>
        {[
          { key: 'caracteristicas', label: 'Características' },
          { key: 'documentacion', label: 'Documentación' },
          { key: 'importes', label: 'Importes y Fechas' },
        ].map((s) => (
          <button
            key={s.key}
            type="button"
            className={`${styles.sTab} ${activeSection === s.key ? styles.sTabActive : ''}`}
            onClick={() => setActiveSection(s.key as typeof activeSection)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {activeSection === 'caracteristicas' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Información General</h3>
            <div className={styles.grid3}>
              <Field label="Código Interno *" required>
                <input className="form-input" value={form.internalCode} onChange={(e) => set('internalCode', e.target.value)} placeholder="Ej: 23581" disabled={isEdit} />
              </Field>
              <Field label="Estado *">
                <select className="form-input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="N° de Bienes">
                <input className="form-input" type="number" value={form.numeroBienes} onChange={(e) => set('numeroBienes', parseInt(e.target.value))} />
              </Field>
            </div>
            <div className={styles.grid2}>
              <Field label="Propietario">
                <input className="form-input" value={form.propietarioNombre} onChange={(e) => set('propietarioNombre', e.target.value)} placeholder="Nombre completo" />
              </Field>
              <Field label="Tipo de Propiedad">
                <input className="form-input" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} />
              </Field>
            </div>
            <Field label="Dirección (Migrada)">
              <textarea className="form-input" value={form.ubicacionMigrada} onChange={(e) => set('ubicacionMigrada', e.target.value)} rows={2} placeholder="Dirección completa migrada" />
            </Field>
            <div className={styles.grid3}>
              <Field label="Calle y Número">
                <input className="form-input" value={form.calle} onChange={(e) => set('calle', e.target.value)} />
              </Field>
              <Field label="Colonia">
                <input className="form-input" value={form.colonia} onChange={(e) => set('colonia', e.target.value)} />
              </Field>
              <Field label="C.P.">
                <input className="form-input" value={form.cp} onChange={(e) => set('cp', e.target.value)} />
              </Field>
              <Field label="Municipio">
                <input className="form-input" value={form.municipio} onChange={(e) => set('municipio', e.target.value)} />
              </Field>
              <Field label="Estado">
                <input className="form-input" value={form.estado} onChange={(e) => set('estado', e.target.value)} />
              </Field>
              <Field label="País">
                <input className="form-input" value={form.pais} onChange={(e) => set('pais', e.target.value)} />
              </Field>
            </div>
            <div className={styles.grid2}>
              <Field label="Uso Actual">
                <input className="form-input" value={form.usoActual} onChange={(e) => set('usoActual', e.target.value)} />
              </Field>
              <Field label="Denominado">
                <input className="form-input" value={form.denominado} onChange={(e) => set('denominado', e.target.value)} />
              </Field>
              <Field label="Sup. de Terreno">
                <input className="form-input" value={form.superficieTerreno} onChange={(e) => set('superficieTerreno', e.target.value)} placeholder="Ej: 114M2" />
              </Field>
              <Field label="Sup. de Construcción">
                <input className="form-input" value={form.superficieConstruccion} onChange={(e) => set('superficieConstruccion', e.target.value)} placeholder="Ej: 79.91M2" />
              </Field>
            </div>
            <Field label="Vías de Acceso">
              <textarea className="form-input" value={form.viasDeAcceso} onChange={(e) => set('viasDeAcceso', e.target.value)} rows={2} />
            </Field>
            <div className={styles.checkboxRow}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.noContaAgua} onChange={(e) => set('noContaAgua', e.target.checked)} />
                No Cuenta con Agua
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.noContaPredial} onChange={(e) => set('noContaPredial', e.target.checked)} />
                No Cuenta con Predial
              </label>
            </div>
            <Field label="Observaciones / Comentarios">
              <textarea className="form-input" value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} rows={3} />
            </Field>
          </div>
        )}

        {activeSection === 'documentacion' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Documentación</h3>
            <div className={styles.grid3}>
              <Field label="Libros">
                <input className="form-input" value={form.libros} onChange={(e) => set('libros', e.target.value)} placeholder="Ej: BANCO SANTANDER" />
              </Field>
              <Field label="N° Expediente">
                <input className="form-input" value={form.numeroExpediente} onChange={(e) => set('numeroExpediente', e.target.value)} />
              </Field>
              <Field label="Tipo de Crédito">
                <input className="form-input" value={form.tipoCredito} onChange={(e) => set('tipoCredito', e.target.value)} placeholder="HIPOTECARIO" />
              </Field>
              <Field label="RFC Deudor">
                <input className="form-input" value={form.rfcDeudor} onChange={(e) => set('rfcDeudor', e.target.value)} />
              </Field>
              <Field label="Soporte Gravamen">
                <input className="form-input" value={form.soporteGravamen} onChange={(e) => set('soporteGravamen', e.target.value)} />
              </Field>
              <Field label="Centro de Costos">
                <input className="form-input" value={form.centroCostos} onChange={(e) => set('centroCostos', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {activeSection === 'importes' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Importes y Fechas</h3>
            <div className={styles.grid3}>
              <Field label="Fecha de Registro">
                <input className="form-input" type="date" value={form.fechaRegistro} onChange={(e) => set('fechaRegistro', e.target.value)} />
              </Field>
              <Field label="Fecha de Adjudicación">
                <input className="form-input" type="date" value={form.fechaAdjudicacion} onChange={(e) => set('fechaAdjudicacion', e.target.value)} />
              </Field>
              <Field label="Importe Adjudicación (MXN)">
                <input className="form-input" type="number" step="0.01" value={form.importeAdjudicacion} onChange={(e) => set('importeAdjudicacion', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Importe Adeudo (MXN)">
                <input className="form-input" type="number" step="0.01" value={form.importeAdeudo} onChange={(e) => set('importeAdeudo', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Valor en Libros (MXN)">
                <input className="form-input" type="number" step="0.01" value={form.valorLibros} onChange={(e) => set('valorLibros', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Fecha Apertura Crédito">
                <input className="form-input" type="date" value={form.fechaAperturaCredito} onChange={(e) => set('fechaAperturaCredito', e.target.value)} />
              </Field>
              <Field label="Importe Apertura Crédito (MXN)">
                <input className="form-input" type="number" step="0.01" value={form.importeAperturaCredito} onChange={(e) => set('importeAperturaCredito', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Fecha Avalúo Base">
                <input className="form-input" type="date" value={form.fechaAvaluo} onChange={(e) => set('fechaAvaluo', e.target.value)} />
              </Field>
              <Field label="Importe Avalúo Base (MXN)">
                <input className="form-input" type="number" step="0.01" value={form.importeAvaluo} onChange={(e) => set('importeAvaluo', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Fecha Último Avalúo">
                <input className="form-input" type="date" value={form.fechaUltimoAvaluo} onChange={(e) => set('fechaUltimoAvaluo', e.target.value)} />
              </Field>
              <Field label="Importe Último Avalúo (MXN)">
                <input className="form-input" type="number" step="0.01" value={form.importeUltimoAvaluo} onChange={(e) => set('importeUltimoAvaluo', e.target.value)} placeholder="0.00" />
              </Field>
            </div>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate(isEdit ? `/properties/${id}` : '/properties')}>
            Cancelar
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Save size={16} />}
            {loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Inmueble')}
          </button>
        </div>
      </form>

      {/* Modal de descripción de cambio */}
      {showChangeModal && (
        <div className={styles.modalOverlay} onClick={() => !loading && setShowChangeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Describe el cambio realizado</h3>
              <button 
                className={styles.modalClose} 
                onClick={() => setShowChangeModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Por favor describe brevemente qué cambios realizaste en este inmueble. 
                Esto ayudará a mantener un registro claro de modificaciones.
              </p>
              <textarea
                className={styles.modalTextarea}
                placeholder="Ej: Actualicé el importe de adjudicación y la fecha de avalúo"
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelBtn} 
                onClick={() => setShowChangeModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className={styles.modalSubmitBtn} 
                onClick={submitForm}
                disabled={loading || !changeDescription.trim()}
              >
                {loading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : null}
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
      <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 600 }}>
        {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
