import { useState } from 'react';
import { FaCalendar, FaClock, FaTimes } from 'react-icons/fa';

interface CreateCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CalendarConfig) => void;
  ligaId?: number;
}

export interface CalendarConfig {
  tipo: 'ida' | 'ida_vuelta';
  fechaInicio: string;
  diasPartido: number[];
  hora: string;
}

const DIAS_SEMANA = [
  { valor: 1, letra: 'L', nombre: 'Lunes' },
  { valor: 2, letra: 'M', nombre: 'Martes' },
  { valor: 3, letra: 'X', nombre: 'Miércoles' },
  { valor: 4, letra: 'J', nombre: 'Jueves' },
  { valor: 5, letra: 'V', nombre: 'Viernes' },
  { valor: 6, letra: 'S', nombre: 'Sábado' },
  { valor: 0, letra: 'D', nombre: 'Domingo' },
];

export default function CreateCalendarModal({ isOpen, onClose, onSave }: CreateCalendarModalProps) {
  const [tipo, setTipo] = useState<'ida' | 'ida_vuelta'>('ida_vuelta');
  const [fechaInicio, setFechaInicio] = useState('');
  const [diasPartido, setDiasPartido] = useState<number[]>([]);
  const [hora, setHora] = useState('16:00');

  const toggleDia = (valor: number) => {
    setDiasPartido(prev =>
      prev.includes(valor)
        ? prev.filter(d => d !== valor)
        : [...prev, valor]
    );
  };

  const handleSave = () => {
    if (!fechaInicio) {
      alert('Selecciona una fecha de inicio');
      return;
    }
    if (diasPartido.length === 0) {
      alert('Selecciona al menos un día de partido');
      return;
    }

    onSave({
      tipo,
      fechaInicio,
      diasPartido,
      hora,
    });
  };

  const handleCancel = () => {
    setTipo('ida_vuelta');
    setFechaInicio('');
    setDiasPartido([]);
    setHora('16:00');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-white text-2xl font-bold">Crear calendario</h2>
            <p className="text-gray-400 text-sm mt-1">
              Se generarán automáticamente todos los partidos entre los equipos de la liga
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-6">
          {/* Tipo de calendario */}
          <div>
            <h3 className="text-white font-semibold mb-3">Tipo de calendario</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTipo('ida')}
                className={`p-4 rounded-xl border transition-all ${
                  tipo === 'ida'
                    ? 'bg-lime-900/20 border-lime-500/50 text-lime-400'
                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipo === 'ida' ? 'border-lime-500' : 'border-gray-600'
                  }`}>
                    {tipo === 'ida' && <div className="w-2.5 h-2.5 rounded-full bg-lime-500" />}
                  </div>
                  <span className="font-medium">Solo ida</span>
                </div>
              </button>
              <button
                onClick={() => setTipo('ida_vuelta')}
                className={`p-4 rounded-xl border transition-all ${
                  tipo === 'ida_vuelta'
                    ? 'bg-lime-900/20 border-lime-500/50 text-lime-400'
                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipo === 'ida_vuelta' ? 'border-lime-500' : 'border-gray-600'
                  }`}>
                    {tipo === 'ida_vuelta' && <div className="w-2.5 h-2.5 rounded-full bg-lime-500" />}
                  </div>
                  <span className="font-medium">Ida y vuelta</span>
                </div>
              </button>
            </div>
          </div>

          {/* Fecha de inicio */}
          <div>
            <h3 className="text-white font-semibold mb-3">Fecha de inicio</h3>
            <div className="relative">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white pr-12 focus:outline-none focus:border-lime-500/50 transition-colors"
              />
              <FaCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Días de partido */}
          <div>
            <h3 className="text-white font-semibold mb-3">Días de partido</h3>
            <div className="flex gap-2">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.valor}
                  onClick={() => toggleDia(dia.valor)}
                  className={`w-12 h-12 rounded-full border transition-all font-semibold ${
                    diasPartido.includes(dia.valor)
                      ? 'bg-lime-900/20 border-lime-500/50 text-lime-400'
                      : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                  title={dia.nombre}
                >
                  {dia.letra}
                </button>
              ))}
            </div>
          </div>

          {/* Hora de los partidos */}
          <div>
            <h3 className="text-white font-semibold mb-3">Hora de los partidos</h3>
            <div className="relative">
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white pr-12 focus:outline-none focus:border-lime-500/50 transition-colors"
              />
              <FaClock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-800 text-white font-semibold hover:bg-gray-800/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-all"
          >
            Guardar calendario
          </button>
        </div>
      </div>
    </div>
  );
}
