// components/flowReporter/disaggregationLabelsEditor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    fetchDisaggregationProfiles,
    updateDisaggregationProfileLabel,
    DisaggregationProfile,
} from "@/helpers/fetchDisaggregationProfiles";
import { Loader2, Pencil, Save, X } from "lucide-react";

type Props = {
    placeId: number;
};

export default function DisaggregationLabelsEditor({ placeId }: Props) {
    const [profiles, setProfiles] = useState<DisaggregationProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!placeId) return;

        const loadProfiles = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await fetchDisaggregationProfiles(placeId);
                setProfiles(result.profiles ?? []);
            } catch (err) {
                console.error(err);
                setProfiles([]);
                setError("No se pudieron cargar los perfiles de desagregación.");
            } finally {
                setLoading(false);
            }
        };

        loadProfiles();
    }, [placeId]);

    const sortedProfiles = useMemo(() => {
        return [...profiles].sort((a, b) => {
            const aName = (a.label?.trim() || a.name).toLowerCase();
            const bName = (b.label?.trim() || b.name).toLowerCase();
            return aName.localeCompare(bName);
        });
    }, [profiles]);

    const startEdit = (profile: DisaggregationProfile) => {
        setEditingId(profile.id);
        setEditingValue(profile.label ?? "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const saveEdit = async () => {
        if (editingId === null) return;

        setSaving(true);
        setError(null);

        try {
            const result = await updateDisaggregationProfileLabel(
                editingId,
                editingValue.trim() === "" ? null : editingValue.trim()
            );

            setProfiles((prev) =>
                prev.map((profile) =>
                    profile.id === editingId ? result.profile : profile
                )
            );

            setEditingId(null);
            setEditingValue("");
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar el label.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Labels de dispositivos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Si un dispositivo tiene label, el gráfico mostrará ese texto. Si no, mostrará su nombre original.
                </p>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando dispositivos...
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            )}

            {!loading && sortedProfiles.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                    No hay perfiles disponibles para este lugar.
                </div>
            )}

            <div className="space-y-2">
                {sortedProfiles.map((profile) => {
                    const isEditing = editingId === profile.id;
                    const displayName = profile.label?.trim() ? profile.label : profile.name;

                    return (
                        <div
                            key={profile.id}
                            className="rounded-lg border border-gray-200 px-3 py-3 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                        {displayName}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        name: {profile.name}
                                    </div>
                                </div>

                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => startEdit(profile)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Editar
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={saveEdit}
                                            disabled={saving}
                                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="h-3.5 w-3.5" />
                                            )}
                                            Guardar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            disabled={saving}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mt-3">
                                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                        Label visible
                                    </label>
                                    <input
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        placeholder="Ej: Baño principal"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Déjalo vacío para volver a usar el name original.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}