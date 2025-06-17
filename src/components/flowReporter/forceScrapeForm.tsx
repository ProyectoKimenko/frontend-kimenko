"use client";

import { useState } from "react";
import { Calendar, MapPin, Play, AlertTriangle } from "lucide-react";
import { Place } from "@/types/helpers/typesFetchPlaces";
import { forceScrape } from "@/helpers/fetchPlaces";

interface ForceScrapeFormProps {
    places: Place[];
}

export default function ForceScrapeForm({ places }: ForceScrapeFormProps) {
    const [placeId, setPlaceId] = useState<number | "">("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!placeId) {
            setError("Debe seleccionar un lugar");
            return;
        }

        if (!startDate || !endDate) {
            setError("Debe seleccionar fechas de inicio y fin");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError("La fecha de inicio debe ser anterior a la fecha de fin");
            return;
        }

        setLoading(true);
        try {
            await forceScrape(placeId, startDate, endDate);
            setSuccess(true);
            setStartDate("");
            setEndDate("");
            setPlaceId("");
        } catch (error) {
            console.error('Failed to scrape place:', error);
            setError(error instanceof Error ? error.message : "Error al realizar el scraping");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-2">
                    <Play className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Forzar Scraping de Datos
                    </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ejecute manualmente el scraping de datos para un lugar específico en un rango de fechas, recuerda que el scraping puede tardar varios minutos en verse reflejado en la interfaz.
                </p>
            </div>

            <form className="p-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Lugar
                        </label>
                        <select
                            value={placeId}
                            onChange={(e) => setPlaceId(e.target.value ? Number(e.target.value) : "")}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            required
                        >
                            <option value="" disabled>
                                Seleccione un lugar
                            </option>
                            {places && places.length > 0 ? (
                                places.map((place: Place) => (
                                    <option key={place.id} value={place.id}>
                                        {place.name || `Lugar ${place.id}`}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>
                                    No hay lugares disponibles
                                </option>
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha de inicio
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha de fin
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                                Scraping iniciado exitosamente
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Ejecutando scraping...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Ejecutar Scraping
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}