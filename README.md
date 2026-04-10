# Estructura del Proyecto Web de Fútbol (React + TypeScript)

## 1. Objetivo

Definir una estructura profesional, modular y escalable para un proyecto web de fútbol usando **React + TypeScript**, que permita:

- Separación clara de responsabilidades.
- Escalabilidad para nuevos features.
- Reutilización de componentes y lógica.
- Facilitar la integración de estado global y llamadas a API.

---

## 2. Estructura de Carpetas

``` txt
my-football-app/  
├─ public/                    # Archivos estáticos  
│  ├─ index.html  
│  └─ favicon.ico  
├─ src/  
│  ├─ assets/                 # Imágenes, íconos, fuentes  
│  ├─ components/             # Componentes reutilizables en toda la app  
│  │   ├─ Button.tsx  
│  │   ├─ Card.tsx  
│  │   └─ Modal.tsx  
│  ├─ features/               # Funcionalidades o dominios  
│  │   ├─ auth/  
│  │   │   ├─ pages/  
│  │   │   │   ├─ LoginPage.tsx  
│  │   │   │   ├─ RegisterPage.tsx  
│  │   │   │   └─ ForgotPasswordPage.tsx  
│  │   │   ├─ hooks/  
│  │   │   │   └─ useAuth.ts
│  │   │   ├─ types/  
│  │   │   │   └─ Interfaces.ts 
│  │   │   └─ services/  
│  │   │       └─ authApi.ts  
│  │   ├─ users/  
│  │   │   ├─ pages/  
│  │   │   │   ├─ UsersListPage.tsx  
│  │   │   │   ├─ UserDetailPage.tsx  
│  │   │   │   └─ UserFormPage.tsx   # Admin / Gestión interna  
│  │   │   ├─ components/  
│  │   │   │   ├─ UserCard.tsx  
│  │   │   │   └─ UserAvatar.tsx  
│  │   │   ├─ hooks/  
│  │   │   │   └─ useUsers.ts  
│  │   │   ├─ types/  
│  │   │   │   └─ Interfaces.ts 
│  │   │   └─ services/  
│  │   │       └─ usersApi.ts  
│  │   ├─ players/  
│  │   │   ├─ pages/  
│  │   │   │   ├─ PlayersPage.tsx  
│  │   │   │   └─ PlayerDetailPage.tsx  
│  │   │   ├─ components/  
│  │   │   │   ├─ PlayerCard.tsx  
│  │   │   │   └─ PlayerList.tsx  
│  │   │   ├─ hooks/  
│  │   │   │   └─ usePlayers.ts  
│  │   │   ├─ types/  
│  │   │   │   └─ Interfaces.ts 
│  │   │   └─ services/  
│  │   │       └─ playersApi.ts  
│  │   └─ teams/               # Otro feature ejemplo  
│  │       ├─ pages/  
│  │       ├─ components/  
│  │       ├─ hooks/ 
│  │       ├─ types/  
│  │       └─ services/  
│  ├─ hooks/                   # Hooks globales reutilizables  
│  │   ├─ useFetch.ts  
│  │   └─ useDebounce.ts  
│  ├─ navigation/              # React Router: rutas principales  
│  │   └─ AppRoutes.tsx  
│  ├─ services/                # Servicios globales  
│  │   └─ apiClient.ts         # Cliente Axios global con token/interceptors  
│  ├─ store/                   # Estado global  
│  │   ├─ index.ts  
│  │   └─ rootReducer.ts  
│  ├─ styles/                  # Estilos globales y variables  
│  │   ├─ variables.ts  
│  │   └─ global.css  
│  ├─ utils/                   # Funciones auxiliares  
│  ├─ App.tsx  
│  └─ index.tsx  
├─ package.json  
├─ tsconfig.json  
└─ vite.config.ts / webpack.config.js
```

---

## 3. Descripción de cada carpeta

|Carpeta|Contenido / Función|
|---|---|
|`public/`|Archivos estáticos servidos tal cual (`index.html`, favicon).|
|`assets/`|Recursos como imágenes, íconos y fuentes.|
|`components/`|Componentes reutilizables en varios features (botones, tarjetas, modales).|
|`features/`|Cada dominio o funcionalidad de la app (auth, users, players, teams).|
|`features/<feature>/pages`|Pantallas completas o rutas del feature.|
|`features/<feature>/components`|Componentes internos del feature, no globales.|
|`features/<feature>/hooks`|Hooks específicos del feature.|
|`features/<feature>/services`|Llamadas API o lógica específica del feature.|
|`hooks/`|Hooks globales reutilizables en toda la app.|
|`navigation/`|Rutas principales usando React Router.|
|`services/`|Funciones y cliente global para API (axios con interceptors, token, etc.).|
|`store/`|Estado global (Redux, Zustand, etc.).|
|`styles/`|Estilos globales, variables y temas.|
|`utils/`|Funciones auxiliares, helpers, formateos.|

---

## 4. Reglas y Buenas Prácticas

1. **Hooks:** prefijo `use` obligatorio, encapsulan lógica, no UI.
2. **Componentes:** pequeños, reutilizables y desacoplados.
3. **Servicios:** separados entre feature-local y global.
4. **Pages/Screens:** solo pantallas completas, nunca lógica de negocio.
5. **Estado:** Redux Toolkit o Zustand para global; `useState`/`useReducer` para local.
6. **Estilos:** CSS Modules, Tailwind o Styled Components, variables en `styles/variables.ts`.
7. **Rutas:** React Router v6+, dividir por feature.
8. **Tipado:** TypeScript obligatorio para mantener consistencia.

##5. este es ejemplo con la platoforma