"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ChartNote } from "@/types/components/analysis/typesXylem";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<ChartNote, "id" | "createdAt">) => void;
  selectedDate: string; // ISO date string
  note?: ChartNote; // For editing existing note
  dateRange?: { min: string; max: string }; // Available date range
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  note,
  dateRange,
}: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (note) {
        // Editing existing note
        setTitle(note.title);
        setDescription(note.description || "");
        setColor(note.color);
        setDate(note.timestamp.split("T")[0]); // Get YYYY-MM-DD
      } else {
        // Creating new note
        setTitle("");
        setDescription("");
        setColor(PRESET_COLORS[0]);
        setDate(selectedDate.split("T")[0]); // Get YYYY-MM-DD
      }
      setErrors({});
    }
  }, [isOpen, note, selectedDate]);

  const handleSave = () => {
    const newErrors: { title?: string; date?: string } = {};

    if (!title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!date) {
      newErrors.date = "La fecha es requerida";
    } else if (dateRange) {
      const selectedDateTime = new Date(date).getTime();
      const minTime = new Date(dateRange.min.split("T")[0]).getTime();
      const maxTime = new Date(dateRange.max.split("T")[0]).getTime();

      if (selectedDateTime < minTime || selectedDateTime > maxTime) {
        newErrors.date = "La fecha debe estar dentro del rango de datos";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const noteData: Omit<ChartNote, "id" | "createdAt"> = {
      timestamp: new Date(date).toISOString(),
      title: title.trim(),
      description: description.trim(),
      color,
    };

    onSave(noteData);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {note ? "Editar Nota" : "Agregar Nota"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={dateRange?.min.split("T")[0]}
              max={dateRange?.max.split("T")[0]}
              className={`w-full px-3 py-2 bg-gray-700 border ${
                errors.date ? "border-red-500" : "border-gray-600"
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-400">{errors.date}</p>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Fuga detectada"
              maxLength={50}
              className={`w-full px-3 py-2 bg-gray-700 border ${
                errors.title ? "border-red-500" : "border-gray-600"
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade más detalles sobre esta nota..."
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              {description.length}/200 caracteres
            </p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Color *
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === presetColor
                      ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            {note ? "Guardar Cambios" : "Agregar Nota"}
          </button>
        </div>
      </div>
    </div>
  );
}
