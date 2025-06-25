import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { WeatherData, FavoriteLocation } from "../types/weather";
import { WeatherService } from "../services/WeatherService";
import { FavoritesService } from "../services/FavoritesService";

interface WeatherCardProps {
  city: FavoriteLocation;
  onPress?: () => void;
  onToggleFavorite?: (city: FavoriteLocation) => void;
  onRefresh?: (city: FavoriteLocation) => void;
  isFavorite?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  onPress,
  onToggleFavorite,
  onRefresh,
  isFavorite = false,
}) => {
  const weatherData = city.weatherData;

  if (!weatherData) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardContent}>
          <Text style={styles.cityName}>
            {WeatherService.getLocationShortName(city)}
          </Text>
          <Text style={styles.country}>{city.country}</Text>
          <Text style={styles.loading}>Carregando dados...</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const currentTemp = Math.round(weatherData.current.temperature_2m);
  const humidity = weatherData.current.relative_humidity_2m;
  const precipitation = weatherData.current.precipitation;
  const weatherIcon = WeatherService.getWeatherIcon(
    weatherData.current.weather_code,
    weatherData.current.time
  );
  const weatherDesc = WeatherService.getWeatherDescription(
    weatherData.current.weather_code
  );

  const lastUpdatedText = FavoritesService.getLastUpdatedText(city.lastUpdated);
  const canRefresh = city.lastUpdated
    ? (new Date().getTime() - new Date(city.lastUpdated).getTime()) /
        (1000 * 60) >=
      5
    : true;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.cityName}>
              {WeatherService.getLocationShortName(city)}
            </Text>
            <Text style={styles.country}>{city.country}</Text>
            <View style={styles.updateInfo}>
              <View style={styles.updateRow}>
                <Text style={styles.lastUpdated}>
                  Atualizado: {lastUpdatedText}
                </Text>
                {onRefresh && canRefresh && (
                  <TouchableOpacity
                    onPress={() => onRefresh(city)}
                    style={styles.inlineRefreshButton}
                  >
                    <Text style={styles.inlineRefreshIcon}>🔄</Text>
                  </TouchableOpacity>
                )}
              </View>
              {canRefresh && (
                <Text style={styles.canUpdateText}>
                  • Atualização disponível
                </Text>
              )}
            </View>
          </View>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={() => onToggleFavorite(city)}
              style={styles.favoriteButton}
            >
              <Text style={styles.favoriteIcon}>{isFavorite ? "★" : "☆"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.weatherInfo}>
          <View style={styles.weatherIconWithTemp}>
            <Text style={styles.weatherIcon}>{weatherIcon}</Text>
            <Text style={styles.temperature}>{currentTemp}°C</Text>
          </View>

          <Text style={styles.weatherDescription}>{weatherDesc}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Umidade</Text>
            <Text style={styles.detailValue}>{humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Precipitação</Text>
            <Text style={styles.detailValue}>{precipitation}mm</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    margin: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  country: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  updateInfo: {
    marginTop: 4,
  },
  updateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inlineRefreshButton: {
    padding: 2,
    marginLeft: 8,
  },
  inlineRefreshIcon: {
    fontSize: 16,
    color: "#2196F3",
  },
  canUpdateText: {
    fontSize: 11,
    color: "#2196F3",
    fontWeight: "600",
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
    color: "#FFD700",
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
  refreshIcon: {
    fontSize: 20,
    color: "#2196F3",
  },
  weatherInfo: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  weatherIconWithTemp: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  temperature: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  weatherDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  loading: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
