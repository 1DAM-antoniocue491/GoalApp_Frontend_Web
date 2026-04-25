import { useState, useEffect } from 'react';
import ConvocatoriaEditModal from './ConvocatoriaEditModal';
import ConvocatoriaViewModal from './ConvocatoriaViewModal';
import { fetchConvocatoria } from '../services/convocatoriaApi';

export interface ConvocatoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partidoId: number;
  equipoId: number;
  nombreEquipo: string;
  partidoFecha: string;
  competicion: string;
  estadoPartido: string;
  canEdit: boolean;
}

export default function ConvocatoriaModal({
  isOpen,
  onClose,
  onSuccess,
  partidoId,
  equipoId,
  nombreEquipo,
  partidoFecha,
  competicion,
  estadoPartido,
  canEdit,
}: ConvocatoriaModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [hasConvocatoria, setHasConvocatoria] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si existe convocatoria al abrir
  useEffect(() => {
    if (isOpen) {
      verificarConvocatoria();
    }
  }, [isOpen, partidoId, equipoId]);

  const verificarConvocatoria = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConvocatoria(partidoId, equipoId);
      const totalConvocados = data.titulares.length + data.suplentes.length;
      setHasConvocatoria(totalConvocados > 0);

      // Si puede editar y ya existe convocatoria, empezar en modo edición
      // Si no existe, empezar en modo edición para crearla
      if (canEdit) {
        setMode('edit');
      } else {
        setMode('view');
      }
    } catch (error) {
      console.error('Error al verificar convocatoria:', error);
      setHasConvocatoria(false);
      if (canEdit) {
        setMode('edit');
      } else {
        setMode('view');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  const handleSuccess = () => {
    setHasConvocatoria(true);
    onSuccess();
  };

  // Si no puede editar, siempre mostrar vista
  if (!canEdit) {
    return (
      <ConvocatoriaViewModal
        isOpen={isOpen}
        onClose={handleClose}
        partidoId={partidoId}
        equipoId={equipoId}
        nombreEquipo={nombreEquipo}
        partidoFecha={partidoFecha}
        competicion={competicion}
        estadoPartido={estadoPartido}
      />
    );
  }

  // Si puede editar, mostrar ambos modos
  return (
    <>
      {mode === 'edit' ? (
        <ConvocatoriaEditModal
          isOpen={isOpen}
          onClose={handleClose}
          onSuccess={handleSuccess}
          partidoId={partidoId}
          equipoId={equipoId}
          nombreEquipo={nombreEquipo}
          partidoFecha={partidoFecha}
          competicion={competicion}
        />
      ) : (
        <ConvocatoriaViewModal
          isOpen={isOpen}
          onClose={handleClose}
          partidoId={partidoId}
          equipoId={equipoId}
          nombreEquipo={nombreEquipo}
          partidoFecha={partidoFecha}
          competicion={competicion}
          estadoPartido={estadoPartido}
        />
      )}
    </>
  );
}
