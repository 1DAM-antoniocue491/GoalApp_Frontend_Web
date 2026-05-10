# 💻 GoalApp Frontend Web

El frontend web de GoalApp es una aplicación de administración y consulta de datos deportivos, diseñada para ofrecer una experiencia de usuario fluida, tipada y altamente escalable. Está construida sobre un stack moderno que prioriza la velocidad de desarrollo y la resiliencia en la comunicación con el servidor.

## 🛠️ Stack Tecnológico

- **Core**: React `^19.2.0` con TypeScript `~5.9.3`
- **Build Tool**: Vite `^7.3.1`
- **Estilos**: Tailwind CSS `^4.2.1` (utilizando la integración nativa `@tailwindcss/vite`)
- **Navegación**: React Router `^7.13.1`
- **Comunicación HTTP**: Axios `^1.15.0`
- **Iconografía**: React Icons (FontAwesome)

---

## 🏗️ Arquitectura del Proyecto

El proyecto implementa una **Arquitectura Basada en Features**, eliminando la estructura tradicional de carpetas genéricas y organizando el código por dominios funcionales del negocio.

### Organización de Features
Cada funcionalidad (ej. `auth`, `league`, `calendario`, `onboarding`) se encapsula en su propio módulo con la siguiente estructura interna:
- `components/`: UI exclusiva de la funcionalidad.
- `pages/`: Vistas principales y pantallas.
- `services/`: Lógica de llamadas a la API específica del dominio.
- `hooks/`: Lógica de estado y efectos locales.
- `types/`: Interfaces y tipos TypeScript específicos.
- `index.ts`: Punto de entrada para exportaciones limpias.

### Componentes Globales y Servicios
- **`src/components/ui/`**: Biblioteca de componentes atómicos reutilizables (Button, Input, Modal, Toast, etc.).
- **`src/services/api/`**: Centraliza la configuración de red y el cliente Axios global.
- **`src/context/`**: Gestión de estado global mediante Context API para datos transversales como la sesión de usuario (`AuthContext`) y la liga seleccionada (`SelectedLeagueContext`).

---

## 🔒 Gestión de Red y Seguridad

### Flujo de Refresh Token (Sincronización Crítica)
Para evitar que la sesión del usuario expire abruptamente, se ha implementado un sistema avanzado de gestión de tokens en la capa de red:
1. **Interceptores de Request**: Inyectan automáticamente el token JWT en las cabeceras.
2. **Cola de Peticiones (`failedQueue`)**: Cuando una petición devuelve un error `401` (No autorizado), el sistema pausa todas las peticiones salientes y las coloca en una cola.
3. **Renovación Automática**: Se solicita un nuevo token mediante el endpoint `/auth/refresh`.
4. **Re-ejecución**: Una vez obtenido el nuevo token, se procesan todas las peticiones encoladas con la nueva credencial, haciendo que el proceso sea invisible para el usuario.

### Auth Guards y Navegación
- **`PrivateRoute`**: Componente guardián que protege las rutas privadas. Si el usuario no está autenticado, es redirigido al `/login`.
- **Persistencia de Intención**: El sistema recuerda la ruta que el usuario intentaba visitar antes de ser redirigido al login, permitiendo volver a ella inmediatamente después de autenticarse.
- **Onboarding**: Flujo obligatorio para usuarios autenticados que aún no pertenecen a una liga, permitiéndoles unirse mediante código o crear una nueva.

---

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js (Versión LTS recomendada)
- Gestor de paquetes `npm`

### Pasos para el despliegue local
1. **Instalación de dependencias**:
   ```bash
   npm install
   ```
2. **Configuración de variables de entorno**:
   Cree un archivo `.env` en la raíz del proyecto con la URL de la API:
   ```env
   VITE_API_URL=https://goalapp-api.onrender.com
   ```
3. **Lanzar modo desarrollo**:
   ```bash
   npm run dev
   ```
4. **Generar build de producción**:
   ```bash
   npm run build
   ```

## 🌐 Despliegue
La aplicación está configurada para ser desplegada en **Firebase Hosting**, aprovechando su CDN global para servir la aplicación de forma estática y optimizada.
