'use client'

import { useState } from 'react';
import { Info, CheckCircle } from 'lucide-react';
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Agregar Nuevo Lugar
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Configura un nuevo lugar para el análisis de FlowReporter
                    </p>
                </div>
                
                <div className="p-6">
                    <div className="mb-6 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-blue-800 dark:text-blue-200">
                                <strong>Importante:</strong> Para que el scraping funcione correctamente, 
                                el lugar debe estar previamente agregado como lugar en la cuenta de FlowReporter: 
                                <span className="font-mono text-sm bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded ml-2">
                                    caduto.dal.cielo858879@gmail.com
                                </span>
                            </div>
                        </div>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span className="text-green-800 dark:text-green-200">
                                    Lugar agregado exitosamente
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="placeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nombre del Lugar
                            </label>
                            <input
                                id="placeName"
                                type="text"
                                value={placeName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaceName(e.target.value)}
                                placeholder="Ej: Estación Central, Plaza de Armas..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="flowReporterId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                ID de FlowReporter
                            </label>
                            <input
                                id="flowReporterId"
                                type="text"
                                value={flowReporterId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlowReporterId(e.target.value)}
                                placeholder="Ingresa el ID del lugar en FlowReporter"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Agregando lugar...' : 'Agregar Lugar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}