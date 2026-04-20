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
  const [nombreLibre, setNombreLibre] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioManual, setPrecioManual] = useState('');
  const [modoLibre, setModoLibre] = useState(false);
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

  const handleProductoChange = (e) => {
    const pid = e.target.value;
    setSelectedProducto(pid);
    const p = productos.find(p => String(p.id) === pid);
    if (p) setPrecioManual(p.precio);
    else setPrecioManual('');
  };

  const handleAddConsumo = async (e) => {
    e.preventDefault();
    setSaving(true);

    const nombre_producto = modoLibre
      ? nombreLibre.trim()
      : (productos.find(p => String(p.id) === selectedProducto)?.nombre || '');
    const precio = parseFloat(precioManual);

    if (!nombre_producto) { showToast('❌ Selecciona o escribe un producto', 'error'); setSaving(false); return; }
    if (isNaN(precio) || precio < 0) { showToast('❌ Precio inválido', 'error'); setSaving(false); return; }

    try {
      const res = await fetch('/api/consumos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socio_id: id,
          producto_id: modoLibre ? null : (selectedProducto || null),
          nombre_producto,
          cantidad: parseInt(cantidad),
          precio_unitario: precio,
        }),
      });

      if (res.ok) {
        showToast('✅ Añadido a la cuenta');
        setSelectedProducto('');
        setNombreLibre('');
        setCantidad(1);
        setPrecioManual('');
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
  const subtotalEstimado = precioManual && cantidad
    ? (parseFloat(precioManual || 0) * parseInt(cantidad || 1)).toFixed(2)
    : null;

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

      {/* Formulario */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={24} className="brand-accent" /> Apuntar Consumo
        </div>

        {/* Toggle */}
        <div className="toggle-pills" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className={`toggle-pill ${!modoLibre ? 'active' : ''}`}
            onClick={() => { setModoLibre(false); setNombreLibre(''); }}
            style={{ display: 'flex', alignItems:'center', justifyContent: 'center', gap:'8px' }}
          >
            <List size={20} /> Del menú
          </button>
          <button
            type="button"
            className={`toggle-pill ${modoLibre ? 'active' : ''}`}
            onClick={() => { setModoLibre(true); setSelectedProducto(''); setPrecioManual(''); }}
            style={{ display: 'flex', alignItems:'center', justifyContent: 'center', gap:'8px' }}
          >
            <PenLine size={20} /> Libre
          </button>
        </div>

        <form onSubmit={handleAddConsumo}>
          {/* Producto */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Producto</label>
            {modoLibre ? (
              <input
                className="form-input"
                type="text"
                placeholder="Nombre del producto..."
                value={nombreLibre}
                onChange={e => setNombreLibre(e.target.value)}
                required
              />
            ) : (
              <select
                className="form-select"
                value={selectedProducto}
                onChange={handleProductoChange}
                required
              >
                <option value="">Selecciona un producto...</option>
                {categorias.map(cat => (
                  <optgroup key={cat} label={cat}>
                    {productos
                      .filter(p => p.categoria === cat)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} — {parseFloat(p.precio).toFixed(2)} €
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Cantidad + Precio */}
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cantidad</label>
              <input
                className="form-input"
                type="number"
                min="1"
                inputMode="numeric"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Precio (€)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={precioManual}
                onChange={e => setPrecioManual(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Acción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Guardando...' : <><PlusCircle size={20} /> Añadir a la Cuenta</>}
            </button>
            {subtotalEstimado && (
              <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                = <strong style={{ color: 'var(--amber)' }}>{subtotalEstimado} €</strong>
              </span>
            )}
          </div>
        </form>
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
