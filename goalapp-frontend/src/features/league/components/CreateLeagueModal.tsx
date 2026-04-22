/**
 * Modal para crear una nueva liga
 * Adaptado al diseño de GoalApp Design
 */

import { useState } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiUpload } from 'react-icons/fi';
import { createLeague, type CreateLeagueRequest } from '../services/leagueApi';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  nombre: string;
  temporada: string;
  categoria: string;
  cantidadPartidos: string;
  duracionPartido: string;
}

const temporadas = [
  '2024/25',
  '2025/26',
  '2026/27',
  '2027/28',
];

const categorias = [
  'Senior',
  'Juvenil A',
  'Juvenil B',
  'Cadete',
  'Infantil',
  'Veteranos +35',
  'Veteranos +40',
];

const cantidadPartidos = [
  { value: '10', label: '10 partidos' },
  { value: '14', label: '14 partidos' },
  { value: '18', label: '18 partidos' },
  { value: '22', label: '22 partidos' },
  { value: '26', label: '26 partidos' },
  { value: '30', label: '30 partidos' },
];

const duracionPartidos = [
  { value: '60', label: '60 minutos' },
  { value: '70', label: '70 minutos' },
  { value: '80', label: '80 minutos' },
  { value: '90', label: '90 minutos' },
];

export function CreateLeagueModal({ isOpen, onClose, onSuccess }: CreateLeagueModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    temporada: '',
    categoria: '',
    cantidadPartidos: '',
    duracionPartido: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const request: CreateLeagueRequest = {
      nombre: formData.nombre.trim(),
      temporada: formData.temporada,
      categoria: formData.categoria || undefined,
      activa: true,
      cantidad_partidos: formData.cantidadPartidos ? parseInt(formData.cantidadPartidos, 10) : undefined,
      duracion_partido: formData.duracionPartido ? parseInt(formData.duracionPartido, 10) : undefined,
      logo_url: logoPreview || undefined,
    };

    const result = await createLeague(request);

    setIsSubmitting(false);

    if (result.success) {
      handleClose();
      onSuccess();
    } else {
      setSubmitError(result.error || 'Error al crear la liga');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setFormData({
      nombre: '',
      temporada: '',
      categoria: '',
      cantidadPartidos: '',
      duracionPartido: '',
    });
    setLogoPreview(null);
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Nueva Liga</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Error general */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subir logo */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Logo de la liga
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors overflow-hidden disabled:opacity-50"
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <FiUpload className="w-8 h-8 text-zinc-500 mb-2" />
                    <span className="text-zinc-500 text-sm">Subir logo</span>
                  </>
                )}
              </label>
            </div>
            <p className="text-zinc-600 text-xs mt-1">Opcional</p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Nombre de la liga <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Liga Amateur Madrid"
              disabled={isSubmitting}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
            />
            {errors.nombre && (
              <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Temporada */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Temporada <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.temporada}
              onChange={(e) => setFormData(prev => ({ ...prev, temporada: e.target.value }))}
              disabled={isSubmitting}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Seleccionar temporada</option>
              {temporadas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.temporada && (
              <p className="text-red-400 text-xs mt-1">{errors.temporada}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Categoría
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              disabled={isSubmitting}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="text-zinc-600 text-xs mt-1">Opcional</p>
          </div>

          {/* Cantidad máxima de partidos */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Cantidad máxima de partidos
            </label>
            <select
              value={formData.cantidadPartidos}
              onChange={(e) => setFormData(prev => ({ ...prev, cantidadPartidos: e.target.value }))}
              disabled={isSubmitting}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Seleccionar cantidad</option>
              {cantidadPartidos.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <p className="text-zinc-600 text-xs mt-1">Opcional</p>
          </div>

          {/* Minutos por partido */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Minutos posibles de los partidos
            </label>
            <select
              value={formData.duracionPartido}
              onChange={(e) => setFormData(prev => ({ ...prev, duracionPartido: e.target.value }))}
              disabled={isSubmitting}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Seleccionar duración</option>
              {duracionPartidos.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <p className="text-zinc-600 text-xs mt-1">Opcional</p>
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
                  Creando...
                </>
              ) : (
                'Crear Liga'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}