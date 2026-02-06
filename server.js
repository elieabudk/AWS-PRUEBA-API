const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const app = express();
const PORT =8080;

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
