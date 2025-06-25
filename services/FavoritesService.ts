import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoriteCity } from "../types/weather";

const FAVORITES_KEY = "favorite_cities";

export class FavoritesService {
  static async getFavorites(): Promise<FavoriteCity[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      return [];
    }
  }

  static async addFavorite(city: FavoriteCity): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.find((fav) => fav.id === city.id);

      if (!exists) {
        favorites.push(city);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      throw error;
    }
  }

  static async removeFavorite(cityId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter((fav) => fav.id !== cityId);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(filteredFavorites)
      );
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      throw error;
    }
  }

  static async isFavorite(cityId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === cityId);
    } catch (error) {
      console.error("Erro ao verificar favorito:", error);
      return false;
    }
  }

  static async updateWeatherData(cityId: string, weatherData: any): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const cityIndex = favorites.findIndex((fav) => fav.id === cityId);
      
      if (cityIndex !== -1) {
        favorites[cityIndex].weatherData = weatherData;
        favorites[cityIndex].lastUpdated = new Date().toISOString();
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Erro ao atualizar dados meteorológicos:", error);
      throw error;
    }
  }

  static async needsUpdate(cityId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const city = favorites.find((fav) => fav.id === cityId);
      
      if (!city || !city.lastUpdated) {
        return true; // Nunca foi atualizado
      }
      
      const lastUpdated = new Date(city.lastUpdated);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
      
      return diffMinutes >= 5; // Permite atualização após 5 minutos
    } catch (error) {
      console.error("Erro ao verificar necessidade de atualização:", error);
      return true;
    }
  }

  static getLastUpdatedText(lastUpdated?: string): string {
    if (!lastUpdated) {
      return "Nunca atualizado";
    }
    
    const updated = new Date(lastUpdated);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diffSeconds < 30) {
      return "Agora mesmo";
    } else if (diffSeconds < 60) {
      return `${diffSeconds}s atrás`;
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) {
        return `${diffMinutes} min atrás`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          return `${diffHours}h atrás`;
        } else {
          return updated.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
    }
  }
}
