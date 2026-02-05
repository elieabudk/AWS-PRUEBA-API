# API AWS - Práctica de Despliegue

API básica con Express.js para practicar despliegue en AWS.

## Características

- API REST con Express.js
- Peticiones a JSONPlaceholder API
- Logging con Winston
- Interfaz HTML básica para visualizar usuarios

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints

- `GET /` - Interfaz HTML
- `GET /api/users` - Obtiene la lista de usuarios desde JSONPlaceholder

## Logs

Los logs se guardan en la carpeta `logs/`:
- `error.log` - Solo errores
- `combined.log` - Todos los logs
