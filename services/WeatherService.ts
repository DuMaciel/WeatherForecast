import { City, WeatherData } from "../types/weather";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

export class WeatherService {
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requisições

  private static async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  static async searchCities(query: string): Promise<City[]> {
    await this.waitForRateLimit();

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(
          query
        )}&format=json&limit=10&addressdetails=1`,
        {
          headers: {
            "User-Agent":
              "WeatherForecast/1.0.0 React-Native-App (contact@weatherapp.com)",
            Referer: "https://weatherforecast.app",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Erro ao buscar cidades:",
          response.status,
          response.statusText
        );
        throw new Error("Erro ao buscar cidades");
      }

      const data = await response.json();

      const cities = data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(",")[0],
        country: item.address?.country || "N/A",
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        display_name: item.display_name,
      }));

      return cities;
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      throw error;
    }
  }

  static async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current:
          "temperature_2m,relative_humidity_2m,precipitation,weather_code",
        hourly:
          "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code",
        daily:
          "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
        timezone: "auto",
        forecast_days: "7",
      });

      const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar dados meteorológicos");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados meteorológicos:", error);
      throw error;
    }
  }

  static getWeatherDescription(weatherCode: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: "Céu limpo",
      1: "Principalmente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina com geada",
      51: "Garoa leve",
      53: "Garoa moderada",
      55: "Garoa intensa",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva intensa",
      71: "Neve leve",
      73: "Neve moderada",
      75: "Neve intensa",
      80: "Pancadas de chuva leves",
      81: "Pancadas de chuva moderadas",
      82: "Pancadas de chuva intensas",
      95: "Tempestade",
      96: "Tempestade com granizo leve",
      99: "Tempestade com granizo intenso",
    };

    return weatherCodes[weatherCode] || "Condição desconhecida";
  }

  static getWeatherIcon(weatherCode: number, currentTime?: string): string {
    // Determina se é noite baseado no horário atual ou fornecido
    let isNight = false;

    if (currentTime) {
      // Se tem o tempo da API, usa ele para determinar dia/noite
      const hour = new Date(currentTime).getHours();
      isNight = hour < 6 || hour >= 18;
    } else {
      // Caso contrário, usa horário local
      const hour = new Date().getHours();
      isNight = hour < 6 || hour >= 18;
    }

    // Condições específicas com variações dia/noite
    if (weatherCode === 0 || weatherCode === 1) {
      return isNight ? "🌙" : "☀️"; // Céu limpo
    }

    if (weatherCode === 2 || weatherCode === 3) {
      return isNight ? "☁️" : "⛅"; // Parcialmente nublado
    }

    // Condições que independem do horário
    if (weatherCode >= 45 && weatherCode <= 48) return "🌫️"; // Neblina
    if (weatherCode >= 51 && weatherCode <= 65) return "🌧️"; // Chuva
    if (weatherCode >= 71 && weatherCode <= 75) return "❄️"; // Neve

    // Pancadas de chuva - sem sol no ícone
    if (weatherCode >= 80 && weatherCode <= 82) return "🌧️"; // Mudado de 🌦️ para 🌧️

    // Tempestades
    if (weatherCode >= 95 && weatherCode <= 99) return "⛈️";

    // Padrão
    return isNight ? "🌃" : "🌤️";
  }

  static clearCache(): void {
    // Se houver cache implementado no futuro, limpar aqui
    console.log("Cache limpo (funcionalidade futura)");
  }
}
