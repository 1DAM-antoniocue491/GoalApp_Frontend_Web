export interface UsuarioLiga {
  id_usuario_rol: number;
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  nombre_rol: string;
  activo: boolean;
}

export interface RolOption {
  id_rol: number;
  nombre: string;
}

export interface UserActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: UsuarioLiga;
  ligaId: number;
  rolesDisponibles: RolOption[];
}
