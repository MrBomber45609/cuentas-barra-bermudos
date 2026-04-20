import { sql } from '@/lib/db';

// POST /api/consumos - Registrar un consumo
export async function POST(request) {
  try {
    const { socio_id, producto_id, nombre_producto, cantidad, precio_unitario } = await request.json();

    if (!socio_id) {
      return Response.json({ error: 'Se requiere el socio_id' }, { status: 400 });
    }
    if (!nombre_producto || !nombre_producto.trim()) {
      return Response.json({ error: 'Se requiere el nombre del producto' }, { status: 400 });
    }
    if (!cantidad || cantidad < 1) {
      return Response.json({ error: 'La cantidad debe ser al menos 1' }, { status: 400 });
    }
    if (precio_unitario === undefined || precio_unitario < 0) {
      return Response.json({ error: 'El precio debe ser un número positivo' }, { status: 400 });
    }

    const [consumo] = await sql`
      INSERT INTO consumos (socio_id, producto_id, nombre_producto, cantidad, precio_unitario)
      VALUES (${socio_id}, ${producto_id || null}, ${nombre_producto.trim()}, ${cantidad}, ${precio_unitario})
      RETURNING *
    `;
    return Response.json(consumo, { status: 201 });
  } catch (error) {
    console.error('Error al registrar consumo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
