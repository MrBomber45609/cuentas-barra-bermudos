'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, Plus } from 'lucide-react';

const CATEGORIAS = ['BODEGA', 'BEBIDAS', 'CHACINAS', 'MARISCOS', 'COMIDAS CASERAS', 'HUERTA', 'CARNES', 'LICORES', 'PESCADOS', 'SUGERENCIAS CHEF', 'GENERAL'];

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('GENERAL');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProductos = useCallback(async () => {
    const res = await fetch('/api/productos');
    if (res.ok) setProductos(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || precio === '') return;
    setSaving(true);
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), precio: parseFloat(precio), categoria }),
      });
      if (res.ok) {
        setNombre('');
        setPrecio('');
        setCategoria('GENERAL');
        showToast('✅ Producto añadido');
        fetchProductos();
      } else {
        const err = await res.json();
        showToast('❌ ' + err.error, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('🗑️ Producto eliminado'); fetchProductos(); }
    else showToast('❌ Error al eliminar', 'error');
    setConfirmDelete(null);
  };

  const categorias = ['TODAS', ...new Set(productos.map(p => p.categoria))].sort((a, b) => a === 'TODAS' ? -1 : a.localeCompare(b));

  const productosFiltrados = filtroCategoria === 'TODAS'
    ? productos
    : productos.filter(p => p.categoria === filtroCategoria);

  // Agrupar por categoría para mostrar
  const grupos = productosFiltrados.reduce((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {});

  return (
    <div className="animate-in">
      <Link href="/" className="back-link"><ArrowLeft size={18} /> Volver</Link>

      {/* Header */}
      <div className="header-row page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1>Catálogo</h1>
          <p>{productos.length} productos guardados</p>
        </div>
      </div>

      {/* Formulario añadir */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.25rem' }}>+ Crear Nuevo Producto</div>
        <form onSubmit={handleAdd}>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Nombre</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nombre del producto..."
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={categoria} onChange={e => setCategoria(e.target.value)}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Guardando...' : <><Plus size={20} /> Añadir al Menú</>}
          </button>
        </form>
      </div>

      {/* Filtro por categoría */}
      {categorias.length > 2 && (
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', minWidth: 'max-content' }}>
            {categorias.map(c => (
              <button
                key={c}
                className={`btn btn-sm ${filtroCategoria === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFiltroCategoria(c)}
                style={{ borderRadius: '999px' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista por grupos */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : Object.keys(grupos).length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '2px dashed var(--border-strong)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
             <Package size={64} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3>Sin productos todavía</h3>
          <p>Añade los productos que sirves en la barra</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(grupos).sort(([a],[b]) => a.localeCompare(b)).map(([cat, prods]) => (
            <div key={cat}>
              <div className="section-label">{cat}</div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prods.map(p => (
                      <tr key={p.id}>
                        <td data-label="Producto" style={{ fontWeight: 500 }}>{p.nombre}</td>
                        <td data-label="Precio">
                          <span className="amount amount-positive">{parseFloat(p.precio).toFixed(2)} €</span>
                        </td>
                        <td data-label=" " style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => setConfirmDelete(p.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmar */}
      {confirmDelete !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚠️ Eliminar Producto</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ¿Eliminar &quot;{productos.find(p => p.id === confirmDelete)?.nombre}&quot;?
              Los consumos existentes no se verán afectados.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Eliminar</button>
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
