# Proyecto Hospedaje ViaLuna

Este repositorio contiene una API backend en Node.js y un frontend estático para la gestión de hospedaje.

## Estructura del proyecto

- `backend/`: servidor Express, rutas, controladores y servicios.
- `frontend/`: aplicación web estática con HTML, CSS y JavaScript.

## Backend

### Ejecutar
1. Abrir `backend/`
2. Instalar dependencias: `npm install`
3. Copiar `backend/.env.example` a `backend/.env` y configurar la base de datos
4. Iniciar en modo desarrollo: `npm run dev`

### Nota
La configuración de MySQL ahora se carga desde variables de entorno para evitar dejar credenciales en el código.

## Frontend

Abre `frontend/index.html` en el navegador o sirve `frontend/` desde un servidor estático.

## Buenas prácticas

- No incluir `backend/.env` ni `node_modules/` en el repositorio.
- Mantener la API separada del frontend estático.
