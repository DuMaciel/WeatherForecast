export interface Location {
  id: string;
  name: string; // Nome da localidade (pode ser cidade, bairro, distrito, etc.)
  city?: string; // Cidade (se a localidade não for uma cidade)
  state?: string; // Estado/região
  country: string; // País
  lat: number;
  lon: number;
  display_name: string; // Nome completo original do Nominatim
  type?: string; // Tipo da localidade (city, suburb, village, etc.)
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

export interface FavoriteLocation extends Location {
  weatherData?: WeatherData;
  lastUpdated?: string; // ISO timestamp da última atualização
}
