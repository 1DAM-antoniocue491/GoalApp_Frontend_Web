#!/usr/bin/env python3
"""
Script para testear la API de GoalApp:
1. Login
2. Crear liga
3. Crear equipos
4. Generar código de invitación para delegado
"""

import requests
from typing import Optional

BASE_URL = "https://goalapp-backend-j2cx.onrender.com/api/v1"

def login(email: str, password: str) -> Optional[str]:
    """Realiza login y devuelve el token de acceso."""
    print("=" * 60)
    print("1. INICIANDO SESIÓN")
    print("=" * 60)

    url = f"{BASE_URL}/auth/login"
    data = {
        "username": email,  # FastAPI usa 'username' para el login
        "password": password
    }

    print(f"POST {url}")
    print(f"Datos: username={email}, password=****")

    try:
        response = requests.post(url, data=data, timeout=30)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            token = result.get("access_token")
            print(f"Token obtenido: {token[:50]}...")
            return token
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Excepción: {e}")
        return None


def crear_liga(token: str, nombre: str) -> Optional[int]:
    """Crea una nueva liga y devuelve su ID."""
    print("\n" + "=" * 60)
    print("2. CREANDO LIGA")
    print("=" * 60)

    url = f"{BASE_URL}/ligas/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "nombre": nombre,
        "descripcion": "Liga de test para rol delegado",
        "temporada": "2026",
        "pais": "España",
        "categoria": "amateur"
    }

    print(f"POST {url}")
    print(f"Datos: {data}")

    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")

        if response.status_code in [200, 201]:
            result = response.json()
            print(f"Respuesta: {result}")
            # El ID puede venir como 'id' o 'id_liga'
            liga_id = result.get("id") or result.get("id_liga")
            if not liga_id and isinstance(result, dict):
                # Buscar en keys posibles
                for key in result.keys():
                    if 'id' in key.lower():
                        liga_id = result[key]
                        break
            if liga_id:
                print(f"Liga creada con ID: {liga_id}")
                print(f"Nombre: {result.get('nombre')}")
                return liga_id
            else:
                print("ERROR: No se encontró el ID en la respuesta")
                return None
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Excepción: {e}")
        return None


def crear_equipo(token: str, liga_id: int, nombre: str) -> Optional[int]:
    """Crea un nuevo equipo y devuelve su ID."""
    print(f"\n--- Creando equipo: {nombre} ---")

    url = f"{BASE_URL}/equipos/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "nombre": nombre,
        "id_liga": liga_id,  # El endpoint requiere 'id_liga' no 'liga_id'
        "escudo_url": None,
        "colores": "Azul y Blanco"
    }

    print(f"POST {url}")
    print(f"Datos: nombre={nombre}, liga_id={liga_id}")

    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")

        if response.status_code in [200, 201]:
            result = response.json()
            print(f"Respuesta: {result}")
            # El ID puede venir como 'id' o 'id_equipo'
            equipo_id = result.get("id") or result.get("id_equipo")
            if equipo_id:
                print(f"Equipo creado con ID: {equipo_id}")
                return equipo_id
            else:
                print("ERROR: No se encontró el ID en la respuesta")
                return None
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Excepción: {e}")
        return None


def generar_invitacion_delegado(token: str, liga_id: int, equipo_id: int, id_rol: int = 3) -> Optional[str]:
    """Genera un código de invitación para rol delegado."""
    print("\n" + "=" * 60)
    print("4. GENERANDO INVITACIÓN DELEGADO")
    print("=" * 60)

    # Endpoint correcto: POST /invitaciones/ligas/{liga_id}/generar-codigo
    url = f"{BASE_URL}/invitaciones/ligas/{liga_id}/generar-codigo"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Schema requiere id_rol y id_equipo para rol delegado
    data = {
        "id_rol": id_rol,  # Rol Delegado (dinámico)
        "id_equipo": equipo_id
    }

    print(f"POST {url}")
    print(f"Datos: id_rol={id_rol} (Delegado), id_equipo={equipo_id}")

    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")

        if response.status_code in [200, 201]:
            result = response.json()
            print(f"Respuesta: {result}")
            codigo = result.get("codigo")
            if codigo:
                print(f"Código generado: {codigo}")
                return codigo
            else:
                print("ERROR: No se encontró el código en la respuesta")
                return None
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Excepción: {e}")
        return None


def listar_equipos(token: str, liga_id: int):
    """Lista los equipos de una liga."""
    print("\n" + "=" * 60)
    print("EQUIPOS CREADOS - VERIFICACIÓN")
    print("=" * 60)

    url = f"{BASE_URL}/ligas/{liga_id}/equipos"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"GET {url} - Status: {response.status_code}")

        if response.status_code == 200:
            equipos = response.json()
            print(f"Total equipos: {len(equipos)}")
            for eq in equipos:
                print(f"  - ID: {eq.get('id')}, Nombre: {eq.get('nombre')}")
    except Exception as e:
        print(f"Excepción: {e}")


def listar_roles(token: str):
    """Lista los roles disponibles para obtener el ID correcto de Delegado."""
    print("\n" + "=" * 60)
    print("LISTANDO ROLES DISPONIBLES")
    print("=" * 60)

    url = f"{BASE_URL}/roles/"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"GET {url} - Status: {response.status_code}")

        if response.status_code == 200:
            roles = response.json()
            print(f"Total roles: {len(roles)}")
            for rol in roles:
                print(f"  - id_rol: {rol.get('id_rol')}, nombre: {rol.get('nombre')}")
            return roles
    except Exception as e:
        print(f"Excepción: {e}")
    return []


def main():
    print("\n" + "#" * 60)
    print("# TEST API GOALAPP - CREACIÓN LIGA Y INVITACIÓN DELEGADO")
    print("#" * 60)

    # Credenciales
    import datetime
    EMAIL = "k@gmail.com"
    PASSWORD = "k12345"
    # Nombre único con timestamp para evitar colisiones
    timestamp = datetime.datetime.now().strftime("%H%M%S")
    LIGA_NOMBRE = f"Liga Delegado Test {timestamp}"
    EQUIPOS_NOMBRES = [
        "FC Test 2026",
        "Deportivo Delegado",
        "Real Invitación",
        "Atlético Código"
    ]

    # 0. Login primero para obtener token
    token = login(EMAIL, PASSWORD)
    if not token:
        print("\n[ERROR] No se pudo iniciar sesión. Terminando.")
        return

    # 1. Listar roles para obtener el ID correcto de "delegate"
    roles = listar_roles(token)

    # Buscar el ID del rol "delegate" (los roles están en inglés en la BD)
    id_rol_delegado = None
    for rol in roles:
        if rol.get("nombre") == "delegate":
            id_rol_delegado = rol.get("id_rol")
            print(f"\n[OK] Rol 'delegate' encontrado con id_rol: {id_rol_delegado}")
            break

    if not id_rol_delegado:
        print("\n[ERROR] No se encontró el rol 'delegate'. Usando id_rol=3 por defecto.")
        id_rol_delegado = 3  # Fallback

    # 2. Crear liga
    liga_id = crear_liga(token, LIGA_NOMBRE)
    if not liga_id:
        print("\n[ERROR] No se pudo crear la liga. Terminando.")
        return

    # 3. Crear equipos
    print("\n" + "=" * 60)
    print("3. CREANDO EQUIPOS")
    print("=" * 60)

    equipos_ids = []
    for nombre in EQUIPOS_NOMBRES:
        equipo_id = crear_equipo(token, liga_id, nombre)
        if equipo_id:
            equipos_ids.append(equipo_id)

    if not equipos_ids:
        print("\n[ERROR] No se pudo crear ningún equipo. Terminando.")
        return

    print(f"\nEquipos creados: {len(equipos_ids)}")

    # Listar equipos para verificar
    listar_equipos(token, liga_id)

    # 4. Generar invitación para el primer equipo
    primer_equipo_id = equipos_ids[0]
    codigo_invitacion = generar_invitacion_delegado(token, liga_id, primer_equipo_id, id_rol_delegado)

    # 5. Resumen final
    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print("=" * 60)
    print(f"[OK] Token de acceso: {token}")
    print(f"[OK] ID de liga creada: {liga_id}")
    print(f"[OK] Equipos creados: {equipos_ids}")
    print(f"[OK] Código de invitación delegado: {codigo_invitacion or 'NO GENERADO'}")

    if codigo_invitacion:
        print("\n" + "=" * 60)
        print("DATOS PARA COPIAR")
        print("=" * 60)
        print(f"TOKEN: {token}")
        print(f"LIGA_ID: {liga_id}")
        print(f"INVITACIÓN: {codigo_invitacion}")


if __name__ == "__main__":
    main()
