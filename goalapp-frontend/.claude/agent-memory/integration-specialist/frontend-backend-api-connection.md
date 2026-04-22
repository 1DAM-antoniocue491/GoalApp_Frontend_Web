---
name: Frontend-Backend API Connection
description: Conexión completa del frontend web con la API real del backend FastAPI, incluyendo tipos, endpoints y mock removal
type: project
---

## Estado actual (2026-04-17)

Conexión completa del frontend con la API real del backend. Los servicios ya tenían la estructura dual (mock/real) y se han corregido todos los tipos y endpoints para coincidir con el backend real.

## Archivos modificados clave

- `src/features/onboarding/services/onboardingApi.ts` - Agregado `joinLeagueByCode()`
- `src/features/onboarding/components/JoinLeagueModal.tsx` - Conectado a API real
- `src/features/auth/services/authApi.ts` - Tipos User, RegisterResponse, ForgotPasswordResponse, ResetPasswordRequest, refresh token, updateProfile
- `src/components/Nav.tsx` - Perfil conectado a `updateProfile()` en vez de setTimeout mock
- `src/features/team/services/teamApi.ts` - TeamResponse alineado con EquipoResponse, PlayerResponse alineado con JugadorResponse, agregado PlayerWithStatsResponse
- `src/features/main/services/dashboardApi.ts` - Endpoints corregidos, usa /partidos/ real
- `src/features/statistic/pages/StatisticPage.tsx` - Usa fetchPlayersWithStatsByTeam
- `src/features/team/pages/TeamPage.tsx` - team.colores en vez de team.entrenador
- `src/features/auth/pages/ResetPasswordPage.tsx` - nueva_contrasena en vez de new_password
- `src/services/api/client.ts` - refresh token body: { token } en vez de { refresh_token }
- `src/features/main/components/dashboard/roles/AdminDashboard.tsx` - Conectado a API real
- `src/features/main/components/dashboard/roles/CoachDashboard.tsx` - Conectado a API real

## Endpoints del backend que NO EXISTEN (requieren desarrollo backend)

1. **Unirse a liga por código de invitación** - No hay endpoint para validar un código y unirse. Actualmente se usa el ID de liga como fallback.
2. **Dashboard stats** - No hay `/dashboard/admin/stats` ni `/dashboard/coach/stats`. Se calculan desde endpoints existentes (equipos, usuarios, partidos).
3. **Estadísticas de jugadores** - No hay endpoint que devuelva goles/asistencias/tarjetas por jugador. El backend solo devuelve datos básicos del jugador (posicion, dorsal, activo).
4. **Partidos filtrados por estado** - `/partidos/` no soporta query params para filtrar. Se filtra en el cliente.

## Tipos del backend vs frontend (alineados)

| Backend Schema | Frontend Type | Estado |
|---|---|---|
| UsuarioResponse | User | Alineado con campos opcionales |
| EquipoResponse | TeamResponse | Alineado (id_entrenador, id_delegado en vez de entrenador string) |
| JugadorResponse | PlayerResponse | Alineado (sin stats) |
| PartidoResponse | PartidoApi (dashboard) | Alineado |
| LigaResponse | LeagueResponse | Alineado |
| PasswordResetConfirm | ResetPasswordRequest | Alineado (nueva_contrasena) |
| PasswordResetResponse | ForgotPasswordResponse | Alineado (mensaje en vez de message) |