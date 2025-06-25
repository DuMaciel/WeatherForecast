import { Location, WeatherData } from "../types/weather";

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

  static async searchLocations(query: string): Promise<Location[]> {
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
          "Erro ao buscar localidades:",
          response.status,
          response.statusText
        );
        throw new Error("Erro ao buscar localidades");
      }

      const data = await response.json();

      const locations = data.map((item: any) => {
        const address = item.address || {};
        
        // Extrai o nome principal (pode ser cidade, bairro, distrito, etc.)
        const name = item.display_name.split(",")[0].trim();
        
        // Extrai informações hierárquicas
        const city = address.city || address.town || address.village || address.municipality;
        const state = address.state || address.region || address.province;
        const country = address.country;
        
        return {
          id: item.place_id.toString(),
          name,
          city: city !== name ? city : undefined, // Só inclui se for diferente do name
          state,
          country: country || "N/A",
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          type: item.type || address.type || "location",
        };
      });

      return locations;
    } catch (error) {
      console.error("Erro ao buscar localidades:", error);
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

  static formatLocationName(location: Location, includeCountry: boolean = true): string {
    let parts: string[] = [];
    
    // Adiciona o nome principal
    parts.push(location.name);
    
    // Se tem cidade e é diferente do nome principal, adiciona
    if (location.city && location.city !== location.name) {
      parts.push(location.city);
    }
    
    // Adiciona estado se disponível
    if (location.state) {
      parts.push(location.state);
    }
    
    // Adiciona país se solicitado
    if (includeCountry && location.country) {
      parts.push(location.country);
    }
    
    return parts.join(", ");
  }

  static getLocationDisplayName(location: Location): string {
    return this.formatLocationName(location, true);
  }

  static getLocationShortName(location: Location): string {
    return this.formatLocationName(location, false);
  }

  static async clearCache(): Promise<void> {
    // Remove os timestamps de atualização de todas as localidades favoritas
    // forçando uma nova atualização na próxima consulta
    const { FavoritesService } = await import('./FavoritesService');
    
    try {
      const favorites = await FavoritesService.getFavorites();
      
      for (const favorite of favorites) {
        const updatedFavorite = {
          ...favorite,
          lastUpdated: undefined, // Remove o timestamp
          weatherData: undefined, // Remove dados cache
        };
        
        // Remove e adiciona novamente para limpar o cache
        await FavoritesService.removeFavorite(favorite.id);
        await FavoritesService.addFavorite(updatedFavorite);
      }
      
      console.log("Cache de dados meteorológicos limpo com sucesso");
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      throw error;
    }
  }
}
