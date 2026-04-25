/**
 * Modal para editar una liga existente y su configuración
 * Sigue el mismo diseño que CreateLeagueModal
 */

import { useState, useEffect } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiUpload, FiTrash2 } from 'react-icons/fi';
import {
  updateLeague,
  deleteLeague,
  fetchLeagueConfig,
  updateLeagueConfig,
  type LeagueResponse,
  type UpdateLeagueRequest,
  type LeagueConfigResponse,
  type UpdateLeagueConfigRequest,
} from '../services/leagueApi';

interface EditLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLeagueDeleted?: () => void;
  league: LeagueResponse | null;
}

interface FormData {
  nombre: string;
  temporada: string;
  categoria: string;
  activa: boolean;
  hora_partidos: string;
  min_equipos: string;
  max_equipos: string;
  min_convocados: string;
  max_convocados: string;
  min_plantilla: string;
  max_plantilla: string;
  minutos_partido: string;
  max_partidos: string;
}

const temporadas = ['2024/25', '2025/26', '2026/27', '2027/28'];

const categorias = [
  'Senior',
  'Juvenil A',
  'Juvenil B',
  'Cadete',
  'Infantil',
  'Veteranos +35',
  'Veteranos +40',
];

const minutosPartido = [
  { value: '60', label: '60 minutos' },
  { value: '70', label: '70 minutos' },
  { value: '80', label: '80 minutos' },
  { value: '90', label: '90 minutos' },
];

export function EditLeagueModal({ isOpen, onClose, onSuccess, league }: EditLeagueModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    temporada: '',
    categoria: '',
    activa: true,
    hora_partidos: '17:00',
    min_equipos: '',
    max_equipos: '',
    min_convocados: '',
    max_convocados: '',
    min_plantilla: '',
    max_plantilla: '',
    minutos_partido: '90',
    max_partidos: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Cargar datos de la liga y su configuración al abrir
  useEffect(() => {
    if (!isOpen || !league) return;

    setFormData({
      nombre: league.nombre,
      temporada: league.temporada,
      categoria: league.categoria || '',
      activa: league.activa,
      hora_partidos: '17:00',
      min_equipos: '',
      max_equipos: '',
      min_convocados: '',
      max_convocados: '',
      min_plantilla: '',
      max_plantilla: '',
      minutos_partido: '90',
      max_partidos: '',
    });
    setErrors({});
    setSubmitError(null);

    // Cargar configuración
    setIsLoadingConfig(true);
    fetchLeagueConfig(league.id_liga)
      .then((config: LeagueConfigResponse) => {
        setFormData(prev => ({
          ...prev,
          hora_partidos: config.hora_partidos?.substring(0, 5) || '17:00',
          min_equipos: String(config.min_equipos),
          max_equipos: String(config.max_equipos),
          min_convocados: String(config.min_convocados),
          max_convocados: String(config.max_convocados),
          min_plantilla: String(config.min_plantilla),
          max_plantilla: String(config.max_plantilla),
          minutos_partido: String(config.minutos_partido),
          max_partidos: String(config.max_partidos),
        }));
      })
      .catch(() => {
        // Si no hay configuración, dejar valores por defecto
      })
      .finally(() => setIsLoadingConfig(false));
  }, [isOpen, league]);

  if (!isOpen || !league) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.temporada) {
      newErrors.temporada = 'Selecciona una temporada';
    }

    // Validar que los mínimos no sean mayores que los máximos
    if (formData.min_equipos && formData.max_equipos &&
      Number(formData.min_equipos) > Number(formData.max_equipos)) {
      newErrors.min_equipos = 'No puede ser mayor que el máximo';
    }
    if (formData.min_convocados && formData.max_convocados &&
      Number(formData.min_convocados) > Number(formData.max_convocados)) {
      newErrors.min_convocados = 'No puede ser mayor que el máximo';
    }
    if (formData.min_plantilla && formData.max_plantilla &&
      Number(formData.min_plantilla) > Number(formData.max_plantilla)) {
      newErrors.min_plantilla = 'No puede ser mayor que el máximo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    // 1. Actualizar datos de la liga
    const leagueData: UpdateLeagueRequest = {
      nombre: formData.nombre.trim(),
      temporada: formData.temporada,
      categoria: formData.categoria || undefined,
      activa: formData.activa,
    };

    const leagueResult = await updateLeague(league.id_liga, leagueData);

    if (!leagueResult.success) {
      setIsSubmitting(false);
      setSubmitError(leagueResult.error || 'Error al actualizar la liga');
      return;
    }

    // 2. Actualizar configuración
    const configData: UpdateLeagueConfigRequest = {
      hora_partidos: formData.hora_partidos,
      min_equipos: Number(formData.min_equipos) || undefined,
      max_equipos: Number(formData.max_equipos) || undefined,
      min_convocados: Number(formData.min_convocados) || undefined,
      max_convocados: Number(formData.max_convocados) || undefined,
      min_plantilla: Number(formData.min_plantilla) || undefined,
      max_plantilla: Number(formData.max_plantilla) || undefined,
      minutos_partido: Number(formData.minutos_partido) || undefined,
      max_partidos: Number(formData.max_partidos) || undefined,
    };

    const configResult = await updateLeagueConfig(league.id_liga, configData);

    setIsSubmitting(false);

    if (!configResult.success) {
      setSubmitError(configResult.error || 'Liga actualizada, pero error al guardar configuración');
      return;
    }

    onClose();
    onSuccess();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    setSubmitError(null);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteLeague(league.id_liga);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
      // Callback específico para cuando se elimina la liga
      if (onLeagueDeleted) {
        onLeagueDeleted();
      } else {
        onSuccess();
      }
    } else {
      setSubmitError(result.error || 'Error al eliminar la liga');
      setShowDeleteConfirm(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Configuración de Liga</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        {isLoadingConfig ? (
          <div className="flex items-center justify-center py-12 text-zinc-400">
            <FiLoader className="w-6 h-6 animate-spin mr-2" />
            Cargando configuración...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Datos de la liga ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Datos de la liga</h3>

              {/* Logo */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Logo de la liga</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="edit-logo-upload"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="edit-logo-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors overflow-hidden disabled:opacity-50"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <FiUpload className="w-7 h-7 text-zinc-500 mb-2" />
                        <span className="text-zinc-500 text-sm">Cambiar logo</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-zinc-600 text-xs mt-1">Opcional</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  placeholder="Ej: Liga Amateur Madrid"
                  disabled={isSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
                {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>}
              </div>

              {/* Temporada + Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Temporada <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.temporada}
                    onChange={(e) => updateField('temporada', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Seleccionar</option>
                    {temporadas.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.temporada && <p className="text-red-400 text-xs mt-1">{errors.temporada}</p>}
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => updateField('categoria', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Seleccionar</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado activa */}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Estado</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, activa: true }))}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors border-2 ${
                      formData.activa
                        ? 'bg-lime-800/40 text-lime-300 border-lime-700'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                    } disabled:opacity-50`}
                  >
                    Activa
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, activa: false }))}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors border-2 ${
                      !formData.activa
                        ? 'bg-yellow-800/40 text-yellow-400 border-yellow-700'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                    } disabled:opacity-50`}
                  >
                    Finalizada
                  </button>
                </div>
              </div>
            </div>

            {/* ── Separador ── */}
            <div className="border-t border-zinc-800" />

            {/* ── Configuración ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Configuración</h3>

              {/* Mínimo/Máximo equipos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Mín. equipos</label>
                  <input
                    type="number"
                    value={formData.min_equipos}
                    onChange={(e) => updateField('min_equipos', e.target.value)}
                    min={2}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                  {errors.min_equipos && <p className="text-red-400 text-xs mt-1">{errors.min_equipos}</p>}
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Máx. equipos</label>
                  <input
                    type="number"
                    value={formData.max_equipos}
                    onChange={(e) => updateField('max_equipos', e.target.value)}
                    min={2}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Mínimo/Máximo convocados */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Mín. convocados</label>
                  <input
                    type="number"
                    value={formData.min_convocados}
                    onChange={(e) => updateField('min_convocados', e.target.value)}
                    min={7}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                  {errors.min_convocados && <p className="text-red-400 text-xs mt-1">{errors.min_convocados}</p>}
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Máx. convocados</label>
                  <input
                    type="number"
                    value={formData.max_convocados}
                    onChange={(e) => updateField('max_convocados', e.target.value)}
                    min={7}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Mínimo/Máximo plantilla */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Mín. plantilla</label>
                  <p className="text-zinc-600 text-xs mb-1">Titulares y suplentes</p>
                  <input
                    type="number"
                    value={formData.min_plantilla}
                    onChange={(e) => updateField('min_plantilla', e.target.value)}
                    min={7}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                  {errors.min_plantilla && <p className="text-red-400 text-xs mt-1">{errors.min_plantilla}</p>}
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Máx. plantilla</label>
                  <p className="text-zinc-600 text-xs mb-1">Titulares y suplentes</p>
                  <input
                    type="number"
                    value={formData.max_plantilla}
                    onChange={(e) => updateField('max_plantilla', e.target.value)}
                    min={7}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Minutos partido + Cantidad partidos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Minutos partido</label>
                  <select
                    value={formData.minutos_partido}
                    onChange={(e) => updateField('minutos_partido', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    {minutosPartido.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Máx. partidos</label>
                  <input
                    type="number"
                    value={formData.max_partidos}
                    onChange={(e) => updateField('max_partidos', e.target.value)}
                    min={1}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-white font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold rounded-lg hover:from-lime-400 hover:to-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>

            {/* Eliminar liga */}
            <div className="border-t border-zinc-800 pt-4">
              {showDeleteConfirm ? (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <p className="text-red-300 text-sm mb-3">
                    ¿Estás seguro? Esta acción eliminará la liga y todos sus datos asociados y no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isSubmitting}
                      className="flex-1 py-2 text-zinc-300 text-sm font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="w-4 h-4" />
                          Eliminar Liga
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Eliminar Liga
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}