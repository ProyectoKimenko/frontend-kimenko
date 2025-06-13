export interface Place {
    id: number;
    name: string;
    flow_reporter_id: number;
}

export interface PlacesResponse {
    places: Place[];
}
