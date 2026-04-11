---
name: Liga Follow API Integration
description: Endpoints de seguimiento de ligas y su integración en el frontend
type: reference
---

## Backend Endpoints (ya implementados)

Los endpoints para seguir/dejar de seguir ligas ya existen en el backend:

- `POST /api/v1/usuarios/me/ligas/{liga_id}/seguir` - Seguir una liga
- `DELETE /api/v1/usuarios/me/ligas/{liga_id}/seguir` - Dejar de seguir una liga
- `GET /api/v1/usuarios/me/ligas-seguidas` - Obtener ligas seguidas

Ubicados en: `GoalApp_Backend/app/api/routers/usuarios.py`

Modelo: `UsuarioSigueLiga` en `GoalApp_Backend/app/models/usuario_sigue_liga.py`

## Frontend Integration (implementado)

Servicio: `GoalApp_Frontend_Web/goalapp-frontend/src/features/onboarding/services/onboardingApi.ts`

Funciones clave:
- `seguirLiga(ligaId)` - POST para seguir liga
- `dejarDeSeguirLiga(ligaId)` - DELETE para dejar de seguir
- `fetchLigasSeguidas()` - GET para obtener IDs de ligas seguidas
- `toggleLigaFavorita(ligaId, esFavorita)` - Alterna estado de favorito
- `loadUserLeagues()` - Combina ligas con rol y estado de favorito