import { sql } from '@/lib/db';

// GET /api/productos - Lista todos los productos ordenados por categoría
export async function GET() {
  try {
    const productos = await sql`
      SELECT * FROM productos ORDER BY categoria ASC, nombre ASC
    `;
    return Response.json(productos);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/productos - Crear nuevo producto
export async function POST(request) {
  try {
    const { nombre, precio, categoria } = await request.json();
    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    if (precio === undefined || precio < 0) {
      return Response.json({ error: 'El precio debe ser un número positivo' }, { status: 400 });
    }
    const cat = (categoria || 'GENERAL').trim().toUpperCase();
    const [producto] = await sql`
      INSERT INTO productos (nombre, precio, categoria)
      VALUES (${nombre.trim()}, ${precio}, ${cat})
      RETURNING *
    `;
    return Response.json(producto, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
