
# 🚀 TransSeguroApp - Sistema Completo

Este proyecto contiene **backend** y **frontend** completamente funcionales para la gestión de transporte seguro.

## 📂 Estructura
- `/backend/` - Servidor Node.js (Express, MongoDB)
- `/frontend/public/` - Páginas HTML (Vehículos, Rutas, Paradas, Alertas, Usuarios, etc.)

---

## 🔥 Instrucciones para levantar el proyecto

### 1. Requisitos
- Node.js v18 o superior
- MongoDB local o Atlas

### 2. Configurar conexión a MongoDB
Edita el archivo `/backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/TransSeguro
PORT=3000
```

### 3. Iniciar el backend
```bash
cd backend
npm install
npm start
```

Servidor escuchando en: `http://localhost:3000`

### 4. Probar APIs
Usar Thunder Client o Postman para probar:
- `GET http://localhost:3000/api/usuarios`
- `GET http://localhost:3000/api/vehiculos`
- `GET http://localhost:3000/api/rutas`
- `GET http://localhost:3000/api/paradas`
- `GET http://localhost:3000/api/alertas`
- `GET http://localhost:3000/api/seguimientos`
- `GET http://localhost:3000/api/configuraciones`

### 5. Ver el frontend
Abrir archivos HTML desde `/frontend/public/` en el navegador:
- `dashboard.html`
- `vehiculos.html`
- `rutas.html`
- `paradas.html`
- `alertas.html`
- `seguimiento.html`
- `usuarios.html`
- `configuracion.html`

✅ Cada página conecta automáticamente a su API.

---

## ✨ Proyecto organizado en capas
- `models/` - Esquemas de MongoDB
- `services/` - Lógica de negocio
- `controllers/` - Manejo de peticiones
- `routers/` - Definición de rutas
- `middlewares/` - (opcional para futuras validaciones)
- `views/` - (opcional para plantillas futuras)

---

¡Listo para producción o para seguir ampliándolo! 🚀
ECHO POR Alcides Callasi Ugarte

