import { sql } from '@/lib/db';

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS socios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Migración: añadir columna categoria si no existe
    await sql`
      ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria VARCHAR(60) NOT NULL DEFAULT 'GENERAL'
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS consumos (
        id SERIAL PRIMARY KEY,
        socio_id INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
        nombre_producto VARCHAR(150) NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        precio_unitario DECIMAL(10,2) NOT NULL,
        pagado BOOLEAN NOT NULL DEFAULT FALSE,
        fecha TIMESTAMP DEFAULT NOW()
      )
    `;

    // Migración: añadir columna pagado si no existe
    await sql`
      ALTER TABLE consumos ADD COLUMN IF NOT EXISTS pagado BOOLEAN NOT NULL DEFAULT FALSE
    `;

    // Insertar productos por defecto solo si la tabla está vacía
    const existing = await sql`SELECT COUNT(*) as total FROM productos`;
    if (parseInt(existing[0].total) === 0) {
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
    }

    return Response.json({ ok: true, message: 'Base de datos inicializada correctamente.' });
  } catch (error) {
    console.error('Error en setup:', error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ message: 'Usa POST para inicializar la base de datos.' });
}
