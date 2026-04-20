'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Search, Check, Database } from 'lucide-react';

export default function HomePage() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [dbReady, setDbReady] = useState(true);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchSocios = useCallback(async () => {
    try {
      const res = await fetch('/api/socios');
      if (!res.ok) {
        const err = await res.json();
        if (err.error?.includes('does not exist') || err.error?.includes('no existe')) {
          setDbReady(false);
        }
        return;
      }
      const data = await res.json();
      setSocios(data);
      setDbReady(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocios();
  }, [fetchSocios]);

  const initDb = async () => {
    try {
      const res = await fetch('/api/setup', { method: 'POST' });
      if (res.ok) {
        showToast('✅ Base de datos inicializada');
        setDbReady(true);
        fetchSocios();
      } else {
        showToast('❌ Error al inicializar la base de datos', 'error');
      }
    } catch {
      showToast('❌ No se pudo conectar', 'error');
    }
  };

  const handleAddSocio = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      if (res.ok) {
        setNombre('');
        setShowModal(false);
        showToast('✅ Socio añadido');
        fetchSocios();
      } else {
        const err = await res.json();
        showToast('❌ ' + err.error, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const filtered = socios.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const totalGeneral = socios.reduce((acc, s) => acc + parseFloat(s.total || 0), 0);
  const sociosConDeuda = socios.filter(s => parseFloat(s.total || 0) > 0).length;

  if (!dbReady) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Los <span className="brand-accent">Bermudos</span></h1>
          <p>Gestión de cuentas de socios</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Database size={48} className="brand-accent"/>
          </div>
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Base de datos no inicializada</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Asegúrate de haber configurado la <code style={{ color: 'var(--amber)' }}>DATABASE_URL</code> en tu <code style={{ color: 'var(--amber)' }}>.env.local</code> y haz clic para crear las tablas.
          </p>
          <button className="btn btn-primary" onClick={initDb}>
            Inicializar Base de Datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="header-row page-header">
        <div>
          <h1>Los <span className="brand-accent">Bermudos</span></h1>
          <p>Gestión de cuentas de socios</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={22} /> Nuevo Socio
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Pendiente</div>
          <div className="stat-value">{totalGeneral.toFixed(2)} €</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Socios Activos</div>
          <div className="stat-value neutral">{socios.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Con Deuda</div>
          <div className="stat-value neutral">{sociosConDeuda}</div>
        </div>
      </div>

      {/* Search */}
      {socios.length > 0 && (
        <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '360px' }}>
          <Search size={22} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            type="text"
            placeholder="Buscar socio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '3rem' }}
          />
        </div>
      )}

      {/* Socios Grid */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '2px dashed var(--border-strong)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
             <Users size={64} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3>{search ? 'No se encontraron socios' : 'Sin socios todavía'}</h3>
          <p>{search ? 'Prueba con otro nombre' : 'Añade el primer socio para empezar'}</p>
        </div>
      ) : (
        <div className="socios-grid">
          {filtered.map(socio => (
            <Link key={socio.id} href={`/socios/${socio.id}`} className="socio-card">
              <div className="socio-avatar">
                {socio.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="socio-info">
                <div className="socio-nombre">{socio.nombre}</div>
                <div className="socio-total">Cuenta acumulada</div>
              </div>
              <div className="socio-total-amount">
                {parseFloat(socio.total || 0).toFixed(2)} €
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Nuevo Socio */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title"><UserPlus size={28} className="brand-accent" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Añadir Socio</div>
            <form onSubmit={handleAddSocio}>
              <div className="form-group">
                <label className="form-label">Nombre del Socio</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nombre completo..."
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : <><Check size={20} /> Añadir</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className="toast-container">
        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        )}
      </div>
    </div>
  );
}
