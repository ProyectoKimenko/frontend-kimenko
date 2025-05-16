
export const fetchPlaces = async () => {
    try {
        const response = await fetch('http://localhost:8000/places', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching places: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch places:', error);
        throw error;
    }
};