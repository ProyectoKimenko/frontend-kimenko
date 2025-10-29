"use client";

import { ChartNote } from "@/types/components/analysis/typesXylem";
import { Pencil, Trash2, Calendar, StickyNote } from "lucide-react";

interface NotesListProps {
  notes: ChartNote[];
  onEdit: (note: ChartNote) => void;
  onDelete: (noteId: string) => void;
}

export default function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
  // Sort notes by timestamp (most recent first)
  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (notes.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
        <StickyNote size={48} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">
          No hay notas aún. Haz click en el gráfico o usa el botón para agregar
          una.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <StickyNote size={20} />
          Notas ({notes.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Color indicator and title */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: note.color }}
                  />
                  <h4 className="font-medium text-white truncate">
                    {note.title}
                  </h4>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                  <Calendar size={12} />
                  <span>{formatDate(note.timestamp)}</span>
                </div>

                {/* Description */}
                {note.description && (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {note.description}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(note)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                  title="Editar nota"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Estás seguro de que quieres eliminar esta nota?"
                      )
                    ) {
                      onDelete(note.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="Eliminar nota"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
