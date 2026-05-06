#!/usr/bin/env python3
"""
Script para testear la API de GoalApp - Creación de liga y código de invitación VIEWER
"""

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://goalapp-backend-j2cx.onrender.com/api/v1"

def create_session():
    """Crea una sesión HTTP con retry logic"""
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    return session

def login(session, email, password):
    """Autenticación con la API"""
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": email,
        "password": password
    }

    print(f"[1] Intentando login con {email}...")
    response = session.post(url, data=data)

    if response.status_code != 200:
        print(f"ERROR Login: {response.status_code}")
        print(f"Response: {response.text}")
        return None

    result = response.json()
    token = result.get("access_token")
    print(f"✓ Login exitoso!")
    print(f"  Token: {token[:50]}...")
    return token

def crear_liga(session, token, nombre_liga):
    """Crea una nueva liga"""
    url = f"{BASE_URL}/ligas/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "nombre": nombre_liga,
        "descripcion": "Liga de prueba para testing de rol VIEWER",
        "fecha_inicio": "2026-05-04",
        "fecha_fin": "2026-12-31"
    }

    print(f"\n[2] Creando liga '{nombre_liga}'...")
    response = session.post(url, json=data, headers=headers)

    if response.status_code not in [200, 201]:
        print(f"ERROR Crear Liga: {response.status_code}")
        print(f"Response: {response.text}")
        return None

    liga = response.json()
    liga_id = liga.get("id") or liga.get("id_liga")
    print(f"✓ Liga creada exitosamente!")
    print(f"  ID Liga: {liga_id}")
    print(f"  Nombre: {liga.get('nombre')}")
    return liga_id

def crear_equipos(session, token, liga_id, num_equipos=4):
    """Crea múltiples equipos en la liga"""
    url = f"{BASE_URL}/equipos/"
    headers = {"Authorization": f"Bearer {token}"}

    nombres_equipos = [
        "FC Test Alpha",
        "UD Test Beta",
        "CD Test Gamma",
        "AT Test Delta"
    ]

    equipos_ids = []

    for i in range(num_equipos):
        nombre = nombres_equipos[i % len(nombres_equipos)]
        data = {
            "nombre": nombre,
            "id_liga": liga_id,
            "escudo_url": None
        }

        print(f"\n[3.{i+1}] Creando equipo '{nombre}'...")
        response = session.post(url, json=data, headers=headers)

        if response.status_code not in [200, 201]:
            print(f"ERROR Crear Equipo: {response.status_code}")
            print(f"Response: {response.text}")
            continue

        equipo = response.json()
        equipo_id = equipo.get("id") or equipo.get("id_equipo")
        print(f"✓ Equipo creado: ID={equipo_id}")
        equipos_ids.append(equipo_id)

    return equipos_ids

def generar_codigo_invitacion(session, token, equipo_id, id_rol=6):
    """Genera un código de invitación para un equipo y rol específicos"""
    url = f"{BASE_URL}/invitaciones/generar"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "id_equipo": equipo_id,
        "id_rol": id_rol,
        "usos_maximos": 10,
        "dias_validez": 30
    }

    print(f"\n[4] Generando código de invitación (rol={id_rol})...")
    response = session.post(url, json=data, headers=headers)

    if response.status_code not in [200, 201]:
        print(f"ERROR Generar Invitación: {response.status_code}")
        print(f"Response: {response.text}")
        return None

    invitacion = response.json()
    codigo = invitacion.get("codigo") or invitacion.get("invitation_code")
    print(f"✓ Código de invitación generado!")
    print(f"  Código: {codigo}")
    return codigo

def verificar_invitacion(session, token, codigo):
    """Verifica que el código de invitación es válido"""
    url = f"{BASE_URL}/invitaciones/{codigo}"
    headers = {"Authorization": f"Bearer {token}"}

    print(f"\n[5] Verificando código de invitación...")
    response = session.get(url, headers=headers)

    if response.status_code != 200:
        print(f"ERROR Verificar: {response.status_code}")
        print(f"Response: {response.text}")
        return None

    info = response.json()
    print(f"✓ Invitación verificada:")
    print(f"  Rol: {info.get('rol', {}).get('nombre', 'N/A')}")
    print(f"  Equipo: {info.get('equipo', {}).get('nombre', 'N/A')}")
    return info

def main():
    print("=" * 60)
    print("GOALAPP API TEST - Creación de Liga y Invitación VIEWER")
    print("=" * 60)

    # Credenciales
    EMAIL = "k@gmail.com"
    PASSWORD = "k12345"
    LIGA_NOMBRE = "Liga Viewer Test"
    ROL_VIEWER_ID = 6  # Rol de observador/viewer

    # Crear sesión con retry
    session = create_session()

    # 1. Login
    token = login(session, EMAIL, PASSWORD)
    if not token:
        print("\n❌ No se pudo autenticar. Terminando.")
        return

    # 2. Crear liga
    liga_id = crear_liga(session, token, LIGA_NOMBRE)
    if not liga_id:
        print("\n❌ No se pudo crear la liga. Terminando.")
        return

    # 3. Crear equipos
    equipos_ids = crear_equipos(session, token, liga_id, num_equipos=4)
    if not equipos_ids:
        print("\n❌ No se pudieron crear equipos. Terminando.")
        return

    # 4. Generar código de invitación para el primer equipo
    codigo = generar_codigo_invitacion(
        session, token,
        equipos_ids[0],
        id_rol=ROL_VIEWER_ID
    )
    if not codigo:
        print("\n❌ No se pudo generar el código de invitación.")
        print("Intentando con rol ID=5 (quizás el 6 no existe)...")
        codigo = generar_codigo_invitacion(session, token, equipos_ids[0], id_rol=5)

    # 5. Verificar invitación
    if codigo:
        verificar_invitacion(session, token, codigo)

    # Resumen final
    print("\n" + "=" * 60)
    print("RESUMEN DE DATOS CREADOS")
    print("=" * 60)
    print(f"✓ Token de acceso: {token}")
    print(f"✓ ID de la liga: {liga_id}")
    print(f"✓ Equipos creados: {equipos_ids}")
    print(f"✓ Código de invitación (VIEWER): {codigo}")
    print("=" * 60)

if __name__ == "__main__":
    main()
