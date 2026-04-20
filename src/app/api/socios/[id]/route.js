import { sql } from '@/lib/db';

// GET /api/socios/[id] - Detalle de un socio con sus consumos
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [socio] = await sql`
      SELECT 
        s.id,
        s.nombre,
        s.created_at,
        COALESCE(SUM(c.cantidad * c.precio_unitario) FILTER (WHERE c.pagado = FALSE), 0) AS total
      FROM socios s
      LEFT JOIN consumos c ON c.socio_id = s.id
      WHERE s.id = ${id}
      GROUP BY s.id, s.nombre, s.created_at
    `;
    if (!socio) {
      return Response.json({ error: 'Socio no encontrado' }, { status: 404 });
    }

    const consumos = await sql`
      SELECT 
        c.id,
        c.nombre_producto,
        c.cantidad,
        c.precio_unitario,
        c.fecha,
        c.pagado,
        (c.cantidad * c.precio_unitario) AS subtotal
      FROM consumos c
      WHERE c.socio_id = ${id}
      ORDER BY c.fecha DESC
    `;

    return Response.json({ ...socio, consumos });
  } catch (error) {
    console.error('Error al obtener socio:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/socios/[id] - Eliminar socio y sus consumos
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM socios WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar socio:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
