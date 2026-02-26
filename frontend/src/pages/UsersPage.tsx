import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, X, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { User, ROLE_LABELS } from '../utils/types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './UsersPage.module.css';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'VIEWER' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ username: '', email: '', password: '', fullName: '', role: 'VIEWER' });
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ username: u.username, email: u.email, password: '', fullName: u.fullName, role: u.role });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email || (!editUser && (!form.username || !form.password))) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    setSaving(true);
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, { fullName: form.fullName, email: form.email, role: form.role });
        toast.success('Usuario actualizado');
      } else {
        await api.post('/users', form);
        toast.success('Usuario creado');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await api.put(`/users/${u.id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsers();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return styles.roleAdmin;
    if (role === 'EDITOR') return styles.roleEditor;
    return styles.roleViewer;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Usuarios</h1>
          <p className={styles.subtitle}>{users.length} usuarios registrados</p>
        </div>
        <button className={styles.newBtn} onClick={openCreate}>
          <Plus size={16} />
          Nuevo Usuario
        </button>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={styles.row}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.fullName.charAt(0).toUpperCase()}</div>
                      <span className={styles.username}>@{u.username}</span>
                      {u.id === currentUser?.id && (
                        <span className={styles.youBadge}>Tú</span>
                      )}
                    </div>
                  </td>
                  <td>{u.fullName}</td>
                  <td className={styles.email}>{u.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${roleColor(u.role)}`}>
                      <ShieldCheck size={11} />
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={styles.muted}>
                    {new Date(u.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(u)} title="Editar">
                        <Pencil size={13} />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          className={u.isActive ? styles.deactivateBtn : styles.activateBtn}
                          onClick={() => handleToggleActive(u)}
                          title={u.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {u.isActive ? <X size={13} /> : <Check size={13} />}
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

      {/* Modal */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <Users size={18} />
              <h3>{editUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
              <button className={styles.closeModal} onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formField}>
                <label>Nombre Completo *</label>
                <input
                  className="form-input"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>

              {!editUser && (
                <div className={styles.formField}>
                  <label>Usuario *</label>
                  <input
                    className="form-input"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Nombre de usuario"
                  />
                </div>
              )}

              <div className={styles.formField}>
                <label>Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              {!editUser && (
                <div className={styles.formField}>
                  <label>Contraseña *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.formField}>
                <label>Rol</label>
                <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="VIEWER">Visualizador — Solo lectura</option>
                  <option value="EDITOR">Editor — Puede editar y agregar</option>
                  <option value="ADMIN">Administrador — Acceso completo</option>
                </select>
              </div>

              <div className={styles.roleInfo}>
                {form.role === 'VIEWER' && <p>El visualizador puede ver inmuebles pero no puede crear, editar o eliminar.</p>}
                {form.role === 'EDITOR' && <p>El editor puede ver, crear y editar inmuebles y subir documentos, pero no puede eliminar ni gestionar usuarios.</p>}
                {form.role === 'ADMIN' && <p>El administrador tiene acceso completo al sistema incluyendo gestión de usuarios.</p>}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Check size={14} />}
                {editUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
