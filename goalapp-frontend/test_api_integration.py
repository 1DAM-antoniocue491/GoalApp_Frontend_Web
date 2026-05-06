"""
Script de integración con la API de GoalApp Backend
Realiza login, crea liga, equipos y genera código de invitación
"""

import requests
from typing import Optional

BASE_URL = "https://goalapp-backend-j2cx.onrender.com/api/v1"

def main():
    session = requests.Session()

    # 1. LOGIN
    print("=" * 60)
    print("1. INICIANDO SESIÓN")
    print("=" * 60)

    login_data = {
        "username": "k@gmail.com",
        "password": "k12345"
    }

    response = session.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Status: {response.status_code}")

    if response.status_code != 200:
        print(f"Error en login: {response.text}")
        return

    login_response = response.json()
    access_token = login_response.get("access_token")
    print(f"Token obtenido: {access_token[:20]}...")

    # Configurar headers para peticiones autenticadas
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # 2. CREAR LIGA
    print("\n" + "=" * 60)
    print("2. CREANDO LIGA")
    print("=" * 60)

    liga_data = {
        "nombre": "Liga Jugador Test",
        "descripcion": "Liga de prueba creada vía API",
        "pais": "España",
        "provincia": "Madrid",
        "ciudad": "Madrid",
        "codigo_postal": "28001",
        "direccion": "Calle Test 123",
        "fecha_inicio": "2026-05-01",
        "fecha_fin": "2026-12-31",
        "tipo": "liga",
        "formato": "todos_contra_todos",
        "estado": "activa",
        "temporada": "2026"
    }

    response = session.post(f"{BASE_URL}/ligas/", json=liga_data, headers=headers)
    print(f"Status: {response.status_code}")

    if response.status_code == 400 and "Ya tienes una liga" in response.text:
        # La liga ya existe, buscarla
        print("La liga ya existe, buscando...")
        response = session.get(f"{BASE_URL}/ligas/", headers=headers)
        if response.status_code == 200:
            ligas = response.json()
            for liga in ligas:
                if liga.get("nombre") == "Liga Jugador Test":
                    liga_id = liga.get("id") or liga.get("id_liga")
                    print(f"Liga encontrada con ID: {liga_id}")
                    break

        if not liga_id:
            print("ERROR: No se pudo encontrar la liga existente")
            return
    elif response.status_code not in [200, 201]:
        print(f"Error al crear liga: {response.text}")
        return
    else:
        liga_response = response.json()
        print(f"Respuesta completa: {liga_response}")
        # Intentar obtener el ID de diferentes formas
        liga_id = liga_response.get("id") or liga_response.get("id_liga")
        if not liga_id and isinstance(liga_response, dict):
            # Buscar en keys que puedan contener el ID
            for key in liga_response.keys():
                if 'id' in key.lower():
                    liga_id = liga_response[key]
                    break
        print(f"Liga creada con ID: {liga_id}")
        print(f"Nombre: {liga_response.get('nombre')}")

        if not liga_id:
            print("ERROR: No se pudo obtener el ID de la liga")
            return

    # 3. CREAR EQUIPOS
    print("\n" + "=" * 60)
    print("3. CREANDO EQUIPOS")
    print("=" * 60)

    # Primero obtener equipos existentes de la liga
    print(f"Obteniendo equipos de la liga {liga_id}...")
    response = session.get(f"{BASE_URL}/equipos/", headers=headers)
    print(f"Status equipos GET: {response.status_code}")
    equipos_existentes = []
    if response.status_code == 200:
        todos_equipos = response.json()
        # Filtrar equipos de esta liga
        equipos_existentes = [eq for eq in todos_equipos if eq.get("id_liga") == liga_id or eq.get("liga_id") == liga_id]
        print(f"Equipos encontrados en liga {liga_id}: {len(equipos_existentes)}")
        for eq in equipos_existentes:
            print(f"  - {eq.get('nombre')} (id_liga: {eq.get('id_liga')})")

    equipos_data = [
        {"nombre": "Team Alpha", "descripcion": "Equipo Alpha de prueba"},
        {"nombre": "Team Beta", "descripcion": "Equipo Beta de prueba"},
        {"nombre": "Team Gamma", "descripcion": "Equipo Gamma de prueba"},
        {"nombre": "Team Delta", "descripcion": "Equipo Delta de prueba"},
    ]

    equipos_ids = []

    # Si ya hay 4 o más equipos, usarlos directamente
    if len(equipos_existentes) >= 4:
        print("Usando equipos existentes...")
        for eq in equipos_existentes[:4]:
            eq_id = eq.get("id") or eq.get("id_equipo")
            if eq_id:
                equipos_ids.append(eq_id)
                print(f"  Equipo: {eq.get('nombre')} - ID: {eq_id}")
    else:
        for equipo_info in equipos_data:
            equipo_payload = {
                "nombre": equipo_info["nombre"],
                "descripcion": equipo_info["descripcion"],
                "id_liga": liga_id
            }

            response = session.post(f"{BASE_URL}/equipos/", json=equipo_payload, headers=headers)
            print(f"Creando '{equipo_info['nombre']}': Status {response.status_code}")

            if response.status_code not in [200, 201]:
                print(f"  Error: {response.text}")
                continue

            equipo_response = response.json()
            print(f"  Respuesta: {equipo_response}")
            # Obtener ID de diferentes formas
            equipo_id = equipo_response.get("id") or equipo_response.get("id_equipo")
            if not equipo_id and isinstance(equipo_response, dict):
                for key in equipo_response.keys():
                    if 'id' in key.lower() and key != 'id_liga':
                        equipo_id = equipo_response[key]
                        break
            equipos_ids.append(equipo_id)
            print(f"  ID: {equipo_id}")

    if not equipos_ids:
        print("No se pudieron crear equipos. Deteniendo.")
        return

    print(f"\nTotal equipos creados: {len(equipos_ids)}")

    # 4. GENERAR CÓDIGO DE INVITACIÓN (ROL JUGADOR = 4)
    print("\n" + "=" * 60)
    print("4. GENERANDO CÓDIGO DE INVITACIÓN (ROL JUGADOR)")
    print("=" * 60)

    # Endpoint correcto: POST /ligas/{liga_id}/generar-codigo
    # Requiere: id_rol, id_equipo, y para jugador: dorsal, posicion, tipo_jugador

    equipo_id = equipos_ids[0]
    print(f"Equipo seleccionado: {equipo_id}")
    print(f"Generando código para rol JUGADOR (id_rol=4)...")

    invitacion_data = {
        "id_rol": 4,  # Rol de jugador
        "id_equipo": equipo_id,
        "dorsal": 10,
        "posicion": "delantero",
        "tipo_jugador": "titular"
    }

    response = session.post(
        f"{BASE_URL}/ligas/{liga_id}/generar-codigo",
        json=invitacion_data,
        headers=headers
    )
    print(f"Status: {response.status_code}")

    if response.status_code not in [200, 201]:
        print(f"Error al generar código: {response.text}")
        return

    invitacion_response = response.json()
    codigo_invitacion = invitacion_response.get("codigo")
    invitacion_id = invitacion_response.get("id", "N/A")

    print(f"Código de invitación generado: {codigo_invitacion}")
    print(f"Rol: {invitacion_response.get('rol')}")
    print(f"Liga: {invitacion_response.get('liga')}")
    print(f"Expiración: {invitacion_response.get('expiracion')}")

    # 5. RESUMEN FINAL
    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print(f"✓ Token de acceso: {access_token}")
    print(f"✓ ID de liga creada: {liga_id}")
    print(f"✓ Código de invitación: {codigo_invitacion}")
    print(f"✓ Equipos creados: {equipos_ids}")
    print("=" * 60)

if __name__ == "__main__":
    main()
