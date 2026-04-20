import { sql } from '@/lib/db';

// DELETE /api/consumos/[id] - Eliminar un consumo
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM consumos WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar consumo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/consumos/[id] - Pagar un consumo individual
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { pagado } = await request.json();
    await sql`UPDATE consumos SET pagado = ${Boolean(pagado)} WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
