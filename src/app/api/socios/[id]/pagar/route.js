import { sql } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    // Marca todos los consumos no pagados de este socio como pagados
    await sql`
      UPDATE consumos 
      SET pagado = TRUE 
      WHERE socio_id = ${id} AND pagado = FALSE
    `;
    
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
