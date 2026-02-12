'use client'

import { useState } from 'react';
import { Info, CheckCircle, Plus } from 'lucide-react';
import { addPlace } from '@/helpers/fetchPlaces';

export default function NewPlaceForm() {
    const [placeName, setPlaceName] = useState('');
    const [flowReporterId, setFlowReporterId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const newPlace = await addPlace(placeName, Number(flowReporterId));
            console.log('New place added:', newPlace);
            setSuccess(true);
            setPlaceName('');
            setFlowReporterId('');
        } catch (error) {
            console.error('Error adding place:', error);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="w-full">
            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Plus className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">
                            Agregar Nuevo Lugar
                        </h2>
                    </div>
                    <p className="text-gray-400">
                        Configura un nuevo lugar para el análisis de FlowReporter
                    </p>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 border border-cyan-500/30 bg-cyan-500/10 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div className="text-cyan-200/80 text-sm">
                                <strong>Importante:</strong> Para que el scraping funcione correctamente,
                                el lugar debe estar previamente agregado como lugar en la cuenta de FlowReporter:
                                <span className="font-mono text-xs bg-cyan-500/20 px-2 py-1 rounded ml-2">
                                    caduto.dal.cielo858879@gmail.com
                                </span>
                            </div>
                        </div>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 border border-green-500/30 bg-green-500/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <span className="text-green-200">
                                    Lugar agregado exitosamente
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="placeName" className="block text-sm font-medium text-gray-300">
                                Nombre del Lugar
                            </label>
                            <input
                                id="placeName"
                                type="text"
                                value={placeName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaceName(e.target.value)}
                                placeholder="Ej: Estación Central, Plaza de Armas..."
                                className="w-full px-3 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="flowReporterId" className="block text-sm font-medium text-gray-300">
                                ID de FlowReporter
                            </label>
                            <input
                                id="flowReporterId"
                                type="text"
                                value={flowReporterId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowReporterId(e.target.value)}
                                placeholder="Ingresa el ID del lugar en FlowReporter"
                                className="w-full px-3 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Agregando lugar...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Agregar Lugar
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
