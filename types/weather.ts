export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  display_name: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

export interface FavoriteCity extends City {
  weatherData?: WeatherData;
  lastUpdated?: string; // ISO timestamp da última atualização
}
