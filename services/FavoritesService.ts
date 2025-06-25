import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoriteLocation } from "../types/weather";

const FAVORITES_KEY = "favorite_locations";

export class FavoritesService {
  static async getFavorites(): Promise<FavoriteLocation[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      return [];
    }
  }

  static async addFavorite(location: FavoriteLocation): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.find((fav) => fav.id === location.id);

      if (!exists) {
        favorites.push(location);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      throw error;
    }
  }

  static async removeFavorite(locationId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter((fav) => fav.id !== locationId);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(filteredFavorites)
      );
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      throw error;
    }
  }

  static async isFavorite(locationId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === locationId);
    } catch (error) {
      console.error("Erro ao verificar favorito:", error);
      return false;
    }
  }

  static async updateWeatherData(locationId: string, weatherData: any): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const locationIndex = favorites.findIndex((fav) => fav.id === locationId);
      
      if (locationIndex !== -1) {
        favorites[locationIndex].weatherData = weatherData;
        favorites[locationIndex].lastUpdated = new Date().toISOString();
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Erro ao atualizar dados meteorológicos:", error);
      throw error;
    }
  }

  static async needsUpdate(locationId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const location = favorites.find((fav) => fav.id === locationId);
      
      if (!location || !location.lastUpdated) {
        return true; // Nunca foi atualizado
      }
      
      const lastUpdated = new Date(location.lastUpdated);
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
