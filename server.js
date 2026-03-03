import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import { pool } from './configBD.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Crear carpeta de logs si no existe
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware CORS (permitir peticiones desde otros orígenes)
app.use(cors());

// Middleware
app.use(express.json());

// Endpoint para obtener usuarios (ANTES del middleware estático)
app.get('/api/users', async (req, res) => {
  try {
    logger.info(`Solicitud recibida para obtener usuarios desde: ${req.headers.origin || 'directo'}`);
  
    
    // Leer datos desde data.json
    const dataPath = path.join(__dirname, 'data.json');
    const fileContent = await fs.promises.readFile(dataPath, 'utf8');
    const users = JSON.parse(fileContent);
    
    logger.info(`Usuarios obtenidos exitosamente: ${users.length} usuarios`);

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    logger.error('Error al obtener usuarios:', error.message);
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
      message: error.message
    });
  }
});


app.get('/api/users/obtener', async (req, res) => {
  try {
    pool.query('SELECT * FROM users', (err, results) => {
      if (err) {
        logger.error('Error al obtener usuarios desde la base de datos:', err.message);
        res.status(500).json({
          success: false,
          error: 'Error al obtener usuarios desde la base de datos',
          message: err.message
        });
      }
      logger.info(`Usuarios obtenidos exitosamente desde la base de datos: ${results.length} usuarios`);
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    logger.error('Error al obtener usuarios desde la base de datos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios desde la base de datos',
      message: error.message
    });
  }
});

app.post('/api/users/crear', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err, results) => {
      if (err) {
        logger.error('Error al crear usuario en la base de datos:', err.message);
        res.status(500).json({
          success: false,
          error: 'Error al crear usuario en la base de datos',
          message: err.message

        });
      }
      logger.info(`Usuario creado exitosamente en la base de datos: ${results.insertId}`);
      res.json({
        success: true,
        data: results.insertId,
        message: 'Usuario creado exitosamente'
      });
    });
  } catch (error) {
    logger.error('Error al crear usuario en la base de datos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario en la base de datos',
      message: error.message
    });
  }
});

// Middleware para archivos estáticos (DESPUÉS de las rutas de API)
app.use(express.static('public'));

// Ruta raíz (debe ir después del middleware estático)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
