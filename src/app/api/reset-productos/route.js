import { sql } from '@/lib/db';

/**
 * POST /api/reset-productos
 * Elimina TODOS los productos y los reinserta con el catálogo actualizado.
 * ADVERTENCIA: solo usar si los consumos existentes no necesitan referencias de producto.
 */
export async function POST() {
  try {
    // Añadir columna si no existe
    await sql`ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria VARCHAR(60) NOT NULL DEFAULT 'GENERAL'`;

    // Borrar todos e insertar el listado correcto
    await sql`DELETE FROM productos`;

    await sql`
      INSERT INTO productos (nombre, categoria, precio) VALUES
        ('Cerveza con o sin',                   'BODEGA',           1.8),
        ('Tinto de mesa',                        'BODEGA',           1.5),
        ('Zumos',                                'BODEGA',           1.5),
        ('Refrescos',                            'BODEGA',           1.5),
        ('Agua mineral',                         'BODEGA',           1.0),
        ('Botella de Rioja (Protos, etc.)',       'BODEGA',          14.0),
        ('Jarra de rebujito',                    'BODEGA',           9.0),
        ('Manzanilla 1/2 L (Solear, Guita)',     'BODEGA',           6.0),
        ('Jamón ibérico de bellota',             'CHACINAS',        14.0),
        ('Queso viejo',                          'CHACINAS',        10.0),
        ('Caña de lomo',                         'CHACINAS',        14.0),
        ('Surtido de ibéricos',                  'CHACINAS',        18.0),
        ('Gambas al natural / Rebozadas',        'MARISCOS',        13.0),
        ('Langostinos tigres',                   'MARISCOS',        13.0),
        ('Almejas de Carril',                    'MARISCOS',        12.0),
        ('Plato del día (Caldereta, Arroz...)',   'COMIDAS CASERAS',  7.0),
        ('Revueltos variados',                   'HUERTA',          10.0),
        ('Pimientos fritos / Aliños',            'HUERTA',           7.0),
        ('Tortillas variadas',                   'HUERTA',           6.0),
        ('Salmorejo',                            'HUERTA',           6.0),
        ('Lomo o Pincho con patatas (Unidad)',   'CARNES',           2.5),
        ('Presa ibérica con guarnición',         'CARNES',          11.0),
        ('Solomillo de cerdo / ibérico',         'CARNES',           9.0),
        ('Lagrimitas de pollo',                  'CARNES',          10.0),
        ('Cubatas (Ginebra, Ron, Whisky)',        'LICORES',          5.0),
        ('Chocos / Adobo / Boquerones',          'PESCADOS',        10.0),
        ('Pijota',                               'PESCADOS',        11.0),
        ('Puntillitas',                          'PESCADOS',        10.0),
        ('Croquetas caseras',                    'PESCADOS',        10.0),
        ('Pez espada',                           'PESCADOS',         9.0),
        ('Atún a la plancha',                    'PESCADOS',         9.0),
        ('Chipiron plancha',                     'PESCADOS',         9.0),
        ('Fritos variados',                      'PESCADOS',        16.0),
        ('Chanquetes con huevos y pimientos',    'SUGERENCIAS CHEF', 10.0),
        ('Pan tumaka con jamon o bacalao',       'SUGERENCIAS CHEF', 10.0),
        ('Huevos sacromonte y salsa tumaka',     'SUGERENCIAS CHEF', 12.0),
        ('Rollitos de tierra y mar',             'SUGERENCIAS CHEF', 10.0),
        ('RedBull',                              'BEBIDAS',          2.0)
    `;

    const count = await sql`SELECT COUNT(*) as total FROM productos`;
    return Response.json({ ok: true, total: parseInt(count[0].total) });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
