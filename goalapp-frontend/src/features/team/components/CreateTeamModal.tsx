import { useState, useRef } from 'react';
import { FaTimes, FaShieldAlt, FaPlus, FaCamera } from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import { createTeam, type CreateTeamPayload } from '../services/teamApi';
import { apiPost } from '../../../services/api';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ligaId: number;
}

export default function CreateTeamModal({ isOpen, onClose, onSuccess, ligaId }: CreateTeamModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    colores: '#D4FF59',
    estadio: '',
  });
  const [escudoPreview, setEscudoPreview] = useState<string | null>(null);
  const [escudoFile, setEscudoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createdTeamId = useRef<number | null>(null);

  const handleEscudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Leer archivo como Data URL para preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEscudoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEscudoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateTeamPayload = {
        nombre: formData.nombre,
        colores: formData.colores,
        id_liga: ligaId,
      };

      // 1. Crear el equipo
      const nuevoEquipo = await createTeam(payload);
      createdTeamId.current = nuevoEquipo.id_equipo;

      // 2. Si hay imagen, subirla después de crear el equipo
      if (escudoFile && createdTeamId.current) {
        try {
          const formDataImagen = new FormData();
          formDataImagen.append('file', escudoFile);

          const { apiPostRaw } = await import('../../../services/api');
          if (apiPostRaw) {
            await apiPostRaw(`/imagenes/equipos/${createdTeamId.current}`, formDataImagen);
          } else {
            console.warn('apiPostRaw no disponible en modo mock');
          }
        } catch (imgError) {
          console.warn('Error al subir la imagen:', imgError);
          // No fallamos el proceso si solo falla la imagen
        }
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el equipo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', ciudad: '', colores: '#D4FF59', estadio: '', escudoUrl: '' });
    setEscudoPreview(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      {/* Header con escudo - input de imagen */}
      <div className="flex flex-col items-center mb-6">
        {/* Escudo circular con preview */}
        <div
          className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-600 mb-3 cursor-pointer hover:border-lime-400 transition-colors relative overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {escudoPreview ? (
            <img src={escudoPreview} alt="Escudo" className="w-full h-full object-cover" />
          ) : (
            <FaShieldAlt className="text-white text-3xl" />
          )}
          {/* Overlay con icono de cámara */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <FaCamera className="text-white text-xl" />
          </div>
        </div>
        <p className="text-zinc-400 text-sm">Escudo del equipo</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-zinc-500 text-xs hover:text-lime-400 transition-colors mt-1"
        >
          {escudoPreview ? 'Cambiar imagen' : 'Añadir imagen'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleEscudoChange}
          className="hidden"
        />
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del equipo */}
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">
            Nombre del equipo
          </label>
          <input
            type="text"
            placeholder="Ingrese el nombre del equipo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
            required
          />
        </div>

        {/* Ciudad y Colores en la misma fila */}
        <div className="grid grid-cols-2 gap-4">
          {/* Ciudad */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1">
              Ciudad
            </label>
            <input
              type="text"
              placeholder="Ciudad del equipo"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          {/* Colores */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1">
              Colores principales
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.colores}
                onChange={(e) => setFormData({ ...formData, colores: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-zinc-400 font-mono text-sm">{formData.colores}</span>
            </div>
          </div>
        </div>

        {/* Estadio */}
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">
            Estadio
          </label>
          <input
            type="text"
            placeholder="Nombre del estadio"
            value={formData.estadio}
            onChange={(e) => setFormData({ ...formData, estadio: e.target.value })}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus />
            {isSubmitting ? 'Creando...' : 'Crear Equipo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
