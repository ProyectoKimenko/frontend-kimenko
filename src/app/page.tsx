"use client";

import Chart from "@/components/analysis/chart";
import { fetchAnalysis } from "@/helpers/fetchAnalysis";
import { fetchPlaces } from "@/helpers/fetchPlaces";
import { useState, useEffect, useCallback } from "react";

export interface Places {
	id: number;
	name: string;
	flow_reporter_id: number;
}

export default function Home() {
	const [analysis, setAnalysis] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [year, setYear] = useState<number>(new Date().getFullYear());
	const [startWeek, setStartWeek] = useState<number>(1);
	const [endWeek, setEndWeek] = useState<number>(1);
	const [windowSize, setWindowSize] = useState<number>(60);
	const [placeId, setPlaceId] = useState<number | "">("");
	const [loading, setLoading] = useState<boolean>(false);
	const [places, setPlaces] = useState<Places[]>([]);

	// Fetch places on mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				let response = await fetchPlaces();
				response = response.places
				setPlaces(response);
				if (response && response.length > 0) {
					setPlaceId(response[0].id);
				}
			} catch (err: any) {
				setError("Error cargando lugares");
			}
		};
		fetchData();
	}, []);

	const validateParams = () => {
		if (!year || year < 2000 || year > 2100) {
			setError("El año debe estar entre 2000 y 2100");
			return false;
		}
		if (!startWeek || startWeek < 1 || startWeek > 53) {
			setError("La semana inicial debe estar entre 1 y 53");
			return false;
		}
		if (!endWeek || endWeek < startWeek || endWeek > 53) {
			setError("La semana final debe ser mayor o igual a la inicial y menor o igual a 53");
			return false;
		}
		if (endWeek - startWeek + 1 > 4) {
			setError("No se pueden seleccionar más de 4 semanas");
			return false;
		}
		if (!windowSize || windowSize < 1 || windowSize > 365) {
			setError("El tamaño de ventana debe estar entre 1 y 365");
			return false;
		}
		if (!placeId) {
			setError("Debe seleccionar un lugar");
			return false;
		}
		return true;
	};

	const handlerClick = useCallback(async () => {
		setError(null);
		if (!validateParams()) return;
		setLoading(true);
		try {
			const analysis = await fetchAnalysis({
				window_size: windowSize,
				start_week: startWeek,
				end_week: endWeek,
				year: year,
				place_id: Number(placeId),
			});
			if (analysis.time_series && analysis.time_series.length > 0) {
				setAnalysis(analysis);
			} else {
				setAnalysis(null);
				setError("No se encontraron datos en el rango de tiempo seleccionado");
			}
		} catch (err: any) {
			setError(err?.message || "Error al obtener el análisis");
			setAnalysis(null);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line
	}, [windowSize, startWeek, endWeek, year, placeId]);

	const handlePlaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setPlaceId(value ? Number(value) : "");
	};

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
				Análisis de Caudal
			</h1>

			<div className="w-full">
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
						<span className="block sm:inline">{error}</span>
					</div>
				)}
				{analysis ? (
					<div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md w-full">
						<Chart data={analysis} />
					</div>
				) : (
					<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center h-[400px] border border-gray-200 dark:border-gray-700 w-full">
						<div className="text-center text-gray-500 dark:text-gray-400">
							<svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
							<p className="text-sm">Configure los parámetros y ejecute el análisis para visualizar los resultados</p>
						</div>
					</div>
				)}
			</div>

			<div className="w-full mt-8">
				<details className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto group">
					<summary className="list-none flex items-center justify-between p-6 cursor-pointer group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700">
						<h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
							Parámetros de análisis
						</h3>
						<svg
							className="w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 group-open:rotate-180"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</summary>
					<form
						className="p-6"
						onSubmit={e => {
							e.preventDefault();
							handlerClick();
						}}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="flex flex-col space-y-1">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lugar</label>
								<select
									value={placeId}
									onChange={handlePlaceChange}
									className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
									required
								>
									<option value="" disabled>
										Seleccione un lugar
									</option>
									{places && places.length > 0 ? (
										places.map((place: Places) => (
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

							<div className="flex flex-col space-y-1">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
								<input
									type="number"
									value={year}
									onChange={e => setYear(Number(e.target.value))}
									className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
									min={2000}
									max={2100}
									required
								/>
							</div>

							<div className="md:col-span-2 grid grid-cols-2 gap-4">
								<div className="flex flex-col space-y-1">
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semana inicial</label>
									<div className="relative">
										<input
											type="number"
											value={startWeek}
											onChange={e => {
												const value = Number(e.target.value);
												setStartWeek(value);
												if (value > endWeek) setEndWeek(value);
											}}
											className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
											min={1}
											max={53}
											required
										/>
									</div>
								</div>
								<div className="flex flex-col space-y-1">
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semana final</label>
									<div className="relative">
										<input
											type="number"
											value={endWeek}
											onChange={e => setEndWeek(Number(e.target.value))}
											className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
											min={startWeek}
											max={53}
											required
										/>
									</div>
								</div>
							</div>

							<div className="md:col-span-2">
								<div className="flex flex-col space-y-1">
									<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Tamaño de ventana <span className="text-xs text-gray-500">(días)</span>
									</label>
									<input
										type="number"
										value={windowSize}
										onChange={e => setWindowSize(Number(e.target.value))}
										className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
										min={1}
										max={365}
										required
									/>
								</div>
							</div>
						</div>

						<div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
							<button
								type="submit"
								className={`w-full md:w-auto md:ml-auto md:px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 text-sm rounded-md transition-colors duration-200 flex items-center justify-center shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
								disabled={loading}
							>
								{loading ? (
									<svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
									</svg>
								) : null}
								{loading ? "Procesando..." : "Ejecutar análisis"}
							</button>
						</div>
					</form>
				</details>
			</div>
		</div>
	);
}
