import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success('Bienvenido al sistema');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background effects */}
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.grid} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <div className={styles.logoIcon}>
              <Building2 size={28} />
            </div>
            <div>
              <h1 className={styles.logoName}>InmoGest</h1>
              <p className={styles.logoTagline}>Sistema de Gestión Inmobiliaria</p>
            </div>
          </div>
          <div className={styles.divider} />
          <h2 className={styles.title}>Iniciar Sesión</h2>
          <p className={styles.subtitle}>
            Acceso exclusivo para usuarios autorizados
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Usuario o Correo</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.passwordWrap}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Autenticando...</>
            ) : (
              <><LogIn size={16} /> Ingresar al Sistema</>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿No tienes cuenta? Contacta al administrador</p>
        </div>
      </div>
    </div>
  );
}
