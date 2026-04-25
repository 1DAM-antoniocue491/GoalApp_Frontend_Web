import { useEffect, useState } from 'react';
import EventSelectorModal from './EventSelectorModal';
import EventGoalModal from './EventGoalModal';
import EventYellowCardModal from './EventYellowCardModal';
import EventRedCardModal from './EventRedCardModal';
import EventSubstitutionModal from './EventSubstitutionModal';
import { createMatchEvent } from '../services/matchApi';
import type { PlayerWithStatsResponse } from '../../team/services/teamApi';

interface Team {
  id: number;
  nombre: string;
  escudo?: string | null;
}

interface EventRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventRegistered: () => void;
  partidoId: number;
  localTeam: Team;
  visitanteTeam: Team;
  localPlayers: PlayerWithStatsResponse[];
  visitantePlayers: PlayerWithStatsResponse[];
  minuto: number;
}

type EventType = 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio' | null;

export default function EventRecorderModal({
  isOpen,
  onClose,
  onEventRegistered,
  partidoId,
  localTeam,
  visitanteTeam,
  localPlayers,
  visitantePlayers,
  minuto,
}: EventRecorderModalProps) {
  const [selectedEventType, setSelectedEventType] = useState<EventType>(null);

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedEventType(null);
    }
  }, [isOpen]);

  const handleSelectEventType = (type: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio') => {
    setSelectedEventType(type);
  };

  const handleCloseSubModal = () => {
    setSelectedEventType(null);
  };

  const handleEventConfirmed = async (eventData: {
    id_jugador: number;
    minuto: number;
    id_jugador_sale?: number;
    incidencias?: string;
  }) => {
    try {
      await createMatchEvent(partidoId, {
        id_jugador: eventData.id_jugador,
        tipo_evento: selectedEventType as 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio',
        minuto: eventData.minuto,
        id_jugador_sale: eventData.id_jugador_sale,
        incidencias: eventData.incidencias,
      });
      await onEventRegistered();
      handleCloseSubModal();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar el evento';
      alert(message);
      throw error; // Re-lanzar para que el modal sepa que falló
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal selector de tipo de evento */}
      <EventSelectorModal
        isOpen={selectedEventType === null}
        onClose={() => {
          handleCloseSubModal();
          onClose();
        }}
        onSelectEvent={handleSelectEventType}
      />

      {/* Modal de Gol */}
      {selectedEventType === 'gol' && (
        <EventGoalModal
          isOpen={selectedEventType === 'gol'}
          onClose={handleCloseSubModal}
          onConfirm={handleEventConfirmed}
          localTeam={localTeam}
          visitanteTeam={visitanteTeam}
          localPlayers={localPlayers}
          visitantePlayers={visitantePlayers}
          minuto={minuto}
        />
      )}

      {/* Modal de Tarjeta Amarilla */}
      {selectedEventType === 'tarjeta_amarilla' && (
        <EventYellowCardModal
          isOpen={selectedEventType === 'tarjeta_amarilla'}
          onClose={handleCloseSubModal}
          onConfirm={handleEventConfirmed}
          localTeam={localTeam}
          visitanteTeam={visitanteTeam}
          localPlayers={localPlayers}
          visitantePlayers={visitantePlayers}
          minuto={minuto}
        />
      )}

      {/* Modal de Tarjeta Roja */}
      {selectedEventType === 'tarjeta_roja' && (
        <EventRedCardModal
          isOpen={selectedEventType === 'tarjeta_roja'}
          onClose={handleCloseSubModal}
          onConfirm={handleEventConfirmed}
          localTeam={localTeam}
          visitanteTeam={visitanteTeam}
          localPlayers={localPlayers}
          visitantePlayers={visitantePlayers}
          minuto={minuto}
        />
      )}

      {/* Modal de Sustitución */}
      {selectedEventType === 'cambio' && (
        <EventSubstitutionModal
          isOpen={selectedEventType === 'cambio'}
          onClose={handleCloseSubModal}
          onConfirm={handleEventConfirmed}
          localTeam={localTeam}
          visitanteTeam={visitanteTeam}
          localPlayers={localPlayers}
          visitantePlayers={visitantePlayers}
          minuto={minuto}
        />
      )}
    </>
  );
}
