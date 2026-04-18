import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { FaCalendarAlt } from 'react-icons/fa';

export default function CalendarPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="text-center">
          <FaCalendarAlt className="text-zinc-600 text-5xl mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Calendario de partidos</h2>
          <p className="text-zinc-500 text-sm">Próximamente disponible</p>
        </div>
      </div>
    </>
  );
}