import { sql } from '@/lib/db';

// GET /api/socios - Lista todos los socios con total de su cuenta
export async function GET() {
  try {
    const socios = await sql`
      SELECT 
        s.id,
        s.nombre,
        s.created_at,
        COALESCE(SUM(c.cantidad * c.precio_unitario), 0) AS total
      FROM socios s
      LEFT JOIN consumos c ON c.socio_id = s.id AND c.pagado = FALSE
      GROUP BY s.id, s.nombre, s.created_at
      ORDER BY s.nombre ASC
    `;
    return Response.json(socios);
  } catch (error) {
    console.error('Error al obtener socios:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/socios - Crear nuevo socio
export async function POST(request) {
  try {
    const { nombre } = await request.json();
    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    const [socio] = await sql`
      INSERT INTO socios (nombre) VALUES (${nombre.trim()}) RETURNING *
    `;
    return Response.json(socio, { status: 201 });
  } catch (error) {
    console.error('Error al crear socio:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
