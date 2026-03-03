import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
    waitForConnections: true,
    queueLimit: 0
};

let pool = null;

try {
    pool = mysql.createPool(poolConfig);

    // Evita que un error no capturado en el pool derribe el proceso
    pool.on('error', (err) => {
        console.error('[configBD] Error en el pool de MySQL (la conexión se reintentará):', err.message);
    });
} catch (err) {
    console.error('[configBD] No se pudo crear el pool de MySQL:', err.message);
}

/** Pool seguro: si el pool real es null, las llamadas devuelven error por callback en lugar de tirar. */
const safePool = pool
    ? pool
    : {
          query(sql, argsOrCb, maybeCb) {
              const cb = typeof argsOrCb === 'function' ? argsOrCb : maybeCb;
              if (cb) setImmediate(() => cb(new Error('Base de datos no disponible (revisa RDS_* en .env)'), null));
          },
          getConnection(cb) {
              if (cb) setImmediate(() => cb(new Error('Base de datos no disponible (revisa RDS_* en .env)'), null));
          }
      };

/**
 * Obtiene el pool real. Devuelve null si no se pudo crear (ej. variables de entorno faltantes).
 */
export function getPool() {
    return pool;
}

/**
 * Prueba la conexión a la base de datos. Útil al arranque del servidor.
 * @param {function(Error|null, { ok: boolean, message: string })} callback
 */
export function testConnection(callback) {
    if (!pool) {
        return callback(null, { ok: false, message: 'Pool no inicializado (revisa RDS_* en .env)' });
    }
    pool.getConnection((err, conn) => {
        if (err) {
            return callback(null, { ok: false, message: err.message || 'Error al conectar con la base de datos' });
        }
        conn.release();
        callback(null, { ok: true, message: 'Conexión a la base de datos correcta' });
    });
}

// Se exporta safePool como "pool" para que las rutas no tengan que comprobar null
export { safePool as pool };
export default safePool;