import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { WeatherCard } from "@/components/WeatherCard";
import { CitySearch } from "@/components/CitySearch";
import { WeatherDetail } from "@/components/WeatherDetail";
import { FavoritesService } from "@/services/FavoritesService";
import { WeatherService } from "@/services/WeatherService";
import { FavoriteLocation, Location } from "@/types/weather";
import { useCurrentTime } from "@/hooks/useCurrentTime";

export default function WeatherApp() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCity, setSelectedCity] = useState<FavoriteLocation | null>(null);
  const currentTime = useCurrentTime(30000); // Atualiza a cada 30 segundos

  const loadFavorites = useCallback(async () => {
    try {
      const favoriteCities = await FavoritesService.getFavorites();
      setFavorites(favoriteCities);
      loadWeatherData(favoriteCities);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  }, []);

  const loadWeatherData = async (cities: FavoriteLocation[], forceUpdate = false) => {
    const updatedCities = await Promise.all(
      cities.map(async (city) => {
        try {
          // Verifica se precisa atualizar ou se é uma atualização forçada
          const needsUpdate = await FavoritesService.needsUpdate(city.id);
          
          if (needsUpdate || forceUpdate || !city.weatherData) {
            const weatherData = await WeatherService.getWeatherData(
              city.lat,
              city.lon
            );
            
            // Atualiza no storage com timestamp
            await FavoritesService.updateWeatherData(city.id, weatherData);
            
            return { 
              ...city, 
              weatherData,
              lastUpdated: new Date().toISOString()
            };
          }
          
          return city;
        } catch (error) {
          console.error(`Erro ao carregar dados para ${city.name}:`, error);
          return city;
        }
      })
    );
    setFavorites(updatedCities);
  };

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const favoriteCities = await FavoritesService.getFavorites();
    
    let updatedCount = 0;
    
    // Atualiza apenas as localidades que podem ser atualizadas (5 minutos)
    const updatedCities = await Promise.all(
      favoriteCities.map(async (city) => {
        try {
          const needsUpdate = await FavoritesService.needsUpdate(city.id);
          
          if (needsUpdate) {
            const weatherData = await WeatherService.getWeatherData(city.lat, city.lon);
            await FavoritesService.updateWeatherData(city.id, weatherData);
            updatedCount++;
            
            return { 
              ...city, 
              weatherData,
              lastUpdated: new Date().toISOString()
            };
          }
          
          return city;
        } catch (error) {
          console.error(`Erro ao carregar dados para ${city.name}:`, error);
          return city;
        }
      })
    );
    
    setFavorites(updatedCities);
    setIsLoading(false);
    
    // Mostra feedback sobre quantas localidades foram atualizadas
    if (updatedCount === 0) {
      Alert.alert(
        "Nenhuma atualização necessária", 
        "Todas as localidades foram atualizadas recentemente. Aguarde 5 minutos para uma nova atualização."
      );
    } else {
      Alert.alert(
        "Atualização concluída", 
        `${updatedCount} localidade(s) ${updatedCount === 1 ? 'foi atualizada' : 'foram atualizadas'}.`
      );
    }
  }, []);

  const handleLocationSelect = async (location: Location) => {
    try {
      const weatherData = await WeatherService.getWeatherData(
        location.lat,
        location.lon
      );
      const favoriteLocation: FavoriteLocation = { 
        ...location, 
        weatherData,
        lastUpdated: new Date().toISOString()
      };

      await FavoritesService.addFavorite(favoriteLocation);
      setShowSearch(false);
      await loadFavorites();

      Alert.alert("Sucesso", `${location.name} foi adicionada aos favoritos!`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível adicionar a localidade aos favoritos.");
    }
  };

  const handleToggleFavorite = async (city: FavoriteLocation) => {
    try {
      const isFav = await FavoritesService.isFavorite(city.id);

      if (isFav) {
        await FavoritesService.removeFavorite(city.id);
        Alert.alert("Removido", `${city.name} foi removida dos favoritos.`);
      } else {
        await FavoritesService.addFavorite(city);
        Alert.alert("Adicionado", `${city.name} foi adicionada aos favoritos!`);
      }

      await loadFavorites();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os favoritos.");
    }
  };

  const handleCityPress = (city: FavoriteLocation) => {
    setSelectedCity(city);
  };

  const handleRefreshCity = async (city: FavoriteLocation) => {
    try {
      const weatherData = await WeatherService.getWeatherData(city.lat, city.lon);
      await FavoritesService.updateWeatherData(city.id, weatherData);
      
      // Atualiza a lista local
      setFavorites(prev => prev.map(fav => 
        fav.id === city.id 
          ? { ...fav, weatherData, lastUpdated: new Date().toISOString() }
          : fav
      ));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados meteorológicos.');
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Recarrega favoritos sempre que a tela ganhar foco (ex: ao voltar da tela de configurações)
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const renderFavoriteLocation = ({ item }: { item: FavoriteLocation }) => (
    <WeatherCard
      city={item}
      onPress={() => handleCityPress(item)}
      onToggleFavorite={handleToggleFavorite}
      onRefresh={handleRefreshCity}
      isFavorite={true}
    />
  );

  if (selectedCity) {
    return (
      <WeatherDetail 
        city={selectedCity} 
        onBack={() => setSelectedCity(null)}
        onRefresh={handleRefreshCity}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Previsão do Tempo</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowSearch(true)}
        >
          <Text style={styles.addButtonText}>+ Adicionar Localidade</Text>
        </TouchableOpacity>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma localidade salva</Text>
          <Text style={styles.emptyMessage}>
            Adicione suas localidades favoritas para ver a previsão do tempo
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.emptyButtonText}>Buscar Localidades</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteLocation}
          keyExtractor={(item) => `${item.id}-${item.lastUpdated || 'no-update'}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={["#2196F3"]}
            />
          }
          showsVerticalScrollIndicator={false}
          extraData={currentTime} // Força re-render quando currentTime muda
        />
      )}

      <Modal
        visible={showSearch}
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <CitySearch
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowSearch(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
