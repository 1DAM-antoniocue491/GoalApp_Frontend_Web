/**
 * Módulo de Liga
 * Exporta los componentes principales y servicios
 */

export { CreateLeagueModal } from './components/CreateLeagueModal';
export {
  createLeague,
  fetchAllLeagues,
  fetchLeagueById,
  type CreateLeagueRequest,
  type LeagueResponse,
} from './services/leagueApi';