const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const triggerModelTraining = async (
    placeId: number,
    startTime: string,
    endTime: string
): Promise<{ task_id?: string; status?: string; place_id?: number; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/disaggregate/train`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                place_id: placeId,
                start_time: startTime,
                end_time: endTime,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to trigger model training:", error);
        throw error;
    }
};

export type TrainingStatus = {
    task_id?: string;
    status?: string;      // pending | processing | progress | completed | failed
    progress?: number;
    stage?: string;
    result?: unknown;
    error?: string;
};

export const getTrainingStatus = async (taskId: string): Promise<TrainingStatus> => {
    const response = await fetch(`${API_BASE_URL}/api/disaggregate/status/${taskId}`, {
        headers: { Accept: "application/json" },
    });
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
};

// Hace polling del estado del job hasta completarse/fallar (o timeout).
// onUpdate recibe cada estado intermedio para mostrar progreso en la UI.
export const pollTrainingStatus = async (
    taskId: string,
    onUpdate?: (s: TrainingStatus) => void,
    { intervalMs = 2500, timeoutMs = 600000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<TrainingStatus> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const s = await getTrainingStatus(taskId);
        onUpdate?.(s);
        if (s.status === "completed" || s.status === "failed") return s;
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    return { task_id: taskId, status: "timeout" };
};