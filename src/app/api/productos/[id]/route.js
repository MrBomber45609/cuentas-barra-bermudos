import { sql } from '@/lib/db';

// DELETE /api/productos/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM productos WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
