export interface MiembroEquipo {
  id_miembro: number;
  id_usuario: number;
  tipo: 'jugador' | 'delegado';
  nombre: string;
  email: string;
  activo: boolean;
  posicion?: string;
  dorsal?: number;
}

export type Usuario = {
  id_usuario: number;
  nombre: string;
  email: string;
};

export interface TeamMemberActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  miembro: MiembroEquipo;
  equipoId: number;
  usuariosDisponibles: Usuario[];
  esEntrenador?: boolean;
}
