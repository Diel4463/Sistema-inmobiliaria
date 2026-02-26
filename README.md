# InmoGest — Sistema de Gestión Inmobiliaria

Sistema completo de gestión inmobiliaria con React + TypeScript (frontend) y Node.js + Prisma (backend).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![React](https://img.shields.io/badge/React-18-blue)

---

## 📸 Características

- ✅ **Gestión completa de inmuebles** con atributos, documentación e importes
- ✅ **Sistema de expedientes** por inmueble con subida de archivos
- ✅ **Roles de usuario** (Admin, Editor, Visualizador)
- ✅ **Búsqueda avanzada** con múltiples filtros
- ✅ **Exportación** a CSV y PDF
- ✅ **Subida de archivos** (PDF, Word, imágenes hasta 50MB)
- ✅ **Interfaz moderna** con diseño personalizado
- ✅ **Base de datos PostgreSQL** con Adminer incluido
- ✅ **Autenticación JWT** segura

---

## 🚀 Inicio Rápido

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/inmobiliaria.git
cd inmobiliaria
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env`:
```env
POSTGRES_PASSWORD=tu_password_seguro
JWT_SECRET=tu_clave_jwt_muy_larga_y_aleatoria
```

### 3. Levantar servicios
```bash
docker-compose up --build
```

### 4. Inicializar base de datos
```bash
docker-compose exec backend npm run prisma:seed
```

### 5. Acceder
- **Frontend:** http://localhost:3000
- **Adminer (DB):** http://localhost:8080
- **Usuario:** `admin` / **Contraseña:** `Admin123!`

---

## 👥 Roles

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso completo + gestión usuarios |
| **EDITOR** | Crear/editar inmuebles, subir archivos |
| **VIEWER** | Solo lectura |

---

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker-compose logs -f backend

# Detener
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Reconstruir
docker-compose build --no-cache
```

---

## 🔧 Desarrollo Local (sin Docker)

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Principal

```
POST   /api/auth/login
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
POST   /api/files/upload/:propertyId
GET    /api/reports/export/csv
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit (`git commit -m 'Agregar funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

MIT License - ve el archivo LICENSE para más detalles

---

**Hecho con ❤️ usando React, Node.js, Prisma y Docker**
