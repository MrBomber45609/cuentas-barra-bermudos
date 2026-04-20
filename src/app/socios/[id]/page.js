'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, CheckCircle2, List, PenLine, PlusCircle, Check, Undo, Utensils } from 'lucide-react';

export default function SocioPage() {
  const { id } = useParams();
  const router = useRouter();

  const [socio, setSocio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [selectedProducto, setSelectedProducto] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSocio = useCallback(async () => {
    const res = await fetch(`/api/socios/${id}`);
    if (!res.ok) { router.push('/'); return; }
    setSocio(await res.json());
    setLoading(false);
  }, [id, router]);

  const fetchProductos = useCallback(async () => {
    const res = await fetch('/api/productos');
    if (res.ok) setProductos(await res.json());
  }, []);

  useEffect(() => {
    fetchSocio();
    fetchProductos();
  }, [fetchSocio, fetchProductos]);

  const handleAddConsumo = async (producto) => {
    setSaving(true);
    // Un pequeño aviso de que se está añadiendo (opcional, pero útil)
    showToast(`⏳ Añadiendo ${producto.nombre}...`);

    try {
      const res = await fetch('/api/consumos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socio_id: id,
          producto_id: producto.id,
          nombre_producto: producto.nombre,
          cantidad: 1, // Siempre 1 por toque para camareros
          precio_unitario: parseFloat(producto.precio),
        }),
      });

      if (res.ok) {
        showToast(`✅ ${producto.nombre} añadido`);
        fetchSocio();
      } else {
        const err = await res.json();
        showToast('❌ ' + err.error, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConsumo = async (consumoId) => {
    const res = await fetch(`/api/consumos/${consumoId}`, { method: 'DELETE' });
    if (res.ok) { showToast('🗑️ Consumo eliminado'); fetchSocio(); }
    else showToast('❌ Error al eliminar', 'error');
    setConfirmDelete(null);
  };

  const handleDeleteSocio = async () => {
    const res = await fetch(`/api/socios/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/');
    else showToast('❌ Error al eliminar socio', 'error');
    setConfirmDelete(null);
  };

  const handleTogglePagado = async (consumoId, estadoActual) => {
    const res = await fetch(`/api/consumos/${consumoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagado: !estadoActual })
    });
    if (res.ok) fetchSocio();
    else showToast('❌ Error al actualizar', 'error');
  };

  const handlePagarTodo = async () => {
    setSaving(true);
    const res = await fetch(`/api/socios/${id}/pagar`, { method: 'POST' });
    setSaving(false);
    if (res.ok) {
      showToast('✅ Cuenta cerrada (pagada)', 'success');
      fetchSocio();
    } else {
      showToast('❌ Error al cobrar cuenta', 'error');
    }
  };

  // Agrupar productos por categoría para el <select>
  const categorias = [...new Set(productos.map(p => p.categoria))].sort();

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!socio) return null;

  const total = parseFloat(socio.total || 0);

  return (
    <div className="animate-in">
      <Link href="/" className="back-link"><ArrowLeft size={18} /> Volver</Link>

      {/* Header */}
      <div className="header-row page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="socio-avatar">
            {socio.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>{socio.nombre}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Cuenta personal</p>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete('socio')}>
          <Trash2 size={18} /> Borrar Socio
        </button>
      </div>

      <div className="total-banner">
        <div className="total-banner-top">
          <div>
            <div className="total-banner-label">Deuda Pendiente</div>
            <div className="total-banner-amount">{total.toFixed(2)} €</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
               {socio.consumos?.filter(c => !c.pagado).length || 0} cosas a deber
            </span>
          </div>
        </div>
        
        {total > 0 ? (
          <button className="btn btn-success btn-gigante" onClick={handlePagarTodo} disabled={saving} style={{ marginTop: '1rem' }}>
            <CheckCircle2 size={28} /> COBRAR TODA LA CUENTA
          </button>
        ) : (
          <div style={{ background: 'var(--green-light)', color: 'var(--green)', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: '800', fontSize: '1.3rem', border: '2px solid var(--green)', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={24} /> ¡CUENTA PAGADA!
          </div>
        )}
      </div>

      {/* Botonera Rápida TPV */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={24} className="brand-accent" /> TPV Rapido (Tocar para añadir 1 de..)
        </div>

        {categorias.map(cat => (
          <div key={cat} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', borderBottom: '2px solid var(--border)', paddingBottom: '0.25rem' }}>{cat}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {productos.filter(p => p.categoria === cat).map(p => (
                <button
                  key={p.id}
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => handleAddConsumo(p)}
                  style={{ display: 'flex', flexDirection: 'column', height: '100px', padding: '0.5rem', textAlign: 'center', justifyContent: 'center', touchAction: 'manipulation' }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2 }}>{p.nombre}</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--amber)', marginTop: '6px', fontWeight: 800 }}>{parseFloat(p.precio).toFixed(2)} €</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lista consumos */}
      <div className="section-label" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📄 TICKET (PAGAR SUELTOS)</div>

      {!socio.consumos || socio.consumos.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '2px dashed var(--border-strong)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Utensils size={64} style={{ opacity: 0.5, color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Nada apuntado todavía</h3>
          <p style={{ fontSize: '1.1rem' }}>Utiliza el menú de arriba para añadir</p>
        </div>
      ) : (
        <>
          {/* Mobile/Accessible: cards */}
          <div className="consumo-list" id="consumo-cards">
            {socio.consumos.map(c => (
              <div key={c.id} className="consumo-item" style={{ opacity: c.pagado ? 0.5 : 1, background: c.pagado ? 'var(--bg-secondary)' : 'var(--bg-card)' }}>
                <div className="consumo-item-top">
                  <div className="consumo-info">
                    <div className="consumo-nombre" style={{ textDecoration: c.pagado ? 'line-through' : 'none' }}>
                      {c.nombre_producto}
                    </div>
                    <div className="consumo-meta">
                      {c.cantidad} ud. × {parseFloat(c.precio_unitario).toFixed(2)} € <br/>
                      {new Date(c.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="consumo-precio">
                    {parseFloat(c.subtotal).toFixed(2)} €
                  </div>
                </div>
                
                <div className="consumo-actions">
                  <button
                    className={`btn ${c.pagado ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => handleTogglePagado(c.id, c.pagado)}
                  >
                    {c.pagado ? <><Undo size={20} /> Deshacer Cobro</> : <><Check size={20} /> Cobrar Este Producto</>}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setConfirmDelete(c.id)}
                    title="Eliminar error"
                    style={{ padding: 0 }}
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </>
      )}

      {/* Modal confirmar */}
      {confirmDelete !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              ⚠️ {confirmDelete === 'socio' ? 'Eliminar Socio' : 'Eliminar Consumo'}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              {confirmDelete === 'socio'
                ? `¿Eliminar a "${socio.nombre}" y toda su cuenta? No se puede deshacer.`
                : '¿Quitar este consumo del ticket?'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={() => confirmDelete === 'socio' ? handleDeleteSocio() : handleDeleteConsumo(confirmDelete)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}
