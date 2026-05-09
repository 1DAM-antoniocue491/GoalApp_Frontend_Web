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
<<<<<<< HEAD
  activo?: boolean;
=======
>>>>>>> b824befd4673ce2c6335ef80a279c9e5cb34055a
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
