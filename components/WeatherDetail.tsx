import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { FavoriteLocation } from "../types/weather";
import { WeatherService } from "../services/WeatherService";
import { FavoritesService } from "../services/FavoritesService";

interface WeatherDetailProps {
  city: FavoriteLocation;
  onBack: () => void;
  onRefresh?: (city: FavoriteLocation) => void;
}

export const WeatherDetail: React.FC<WeatherDetailProps> = ({
  city,
  onBack,
  onRefresh,
}) => {
  const [lastRefreshTime, setLastRefreshTime] = useState<string | undefined>(
    city.lastUpdated
  );

  const weatherData = city.weatherData;

  if (!weatherData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.cityName}>
            {WeatherService.getLocationDisplayName(city)}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Carregando dados meteorológicos...
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderHourlyItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{formatTime(item.time)}</Text>
      <Text style={styles.hourlyIcon}>
        {WeatherService.getWeatherIcon(item.weatherCode, item.time)}
      </Text>
      <Text style={styles.hourlyTemp}>{Math.round(item.temperature)}°</Text>
      <Text style={styles.hourlyRain}>{item.precipitation}%</Text>
    </View>
  );

  const renderDailyItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.dailyItem}>
      <Text style={styles.dailyDate}>{formatDate(item.time)}</Text>
      <Text style={styles.dailyIcon}>
        {WeatherService.getWeatherIcon(
          item.weatherCode,
          item.time + "T12:00:00" // Meio-dia para o dia
        )}
      </Text>
      <Text style={styles.dailyTemp}>
        {Math.round(item.tempMin)}° - {Math.round(item.tempMax)}°
      </Text>
      <Text style={styles.dailyRain}>{item.precipitation}%</Text>
    </View>
  );

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

  const lastUpdatedText = FavoritesService.getLastUpdatedText(lastRefreshTime);
  const canRefresh = lastRefreshTime
    ? (new Date().getTime() - new Date(lastRefreshTime).getTime()) /
        (1000 * 60) >=
      5
    : true;

  const handleRefresh = async () => {
    if (onRefresh) {
      try {
        await onRefresh(city);
        setLastRefreshTime(new Date().toISOString()); // Atualiza o timestamp local
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      } catch (error) {
        Alert.alert(
          "Erro",
          "Não foi possível atualizar os dados meteorológicos."
        );
      }
    }
  };

  // Próximas 24 horas (a partir da hora atual)
  const now = new Date();
  const currentHour = now.getHours();

  // Filtra as próximas 24 horas a partir da hora atual
  const next24Hours = weatherData.hourly.time
    .map((time, index) => {
      const hourTime = new Date(time);
      return {
        time,
        temperature: weatherData.hourly.temperature_2m[index],
        humidity: weatherData.hourly.relative_humidity_2m[index],
        precipitation: weatherData.hourly.precipitation_probability[index],
        weatherCode: weatherData.hourly.weather_code[index],
        hour: hourTime.getHours(),
        date: hourTime.getDate(),
      };
    })
    .filter((item) => {
      const itemTime = new Date(item.time);
      const isToday =
        itemTime.getDate() === now.getDate() &&
        itemTime.getMonth() === now.getMonth() &&
        itemTime.getFullYear() === now.getFullYear();

      // Se é hoje, mostra apenas horas >= hora atual
      if (isToday) {
        return item.hour >= currentHour;
      }

      // Se é amanhã, mostra todas as horas até completar 24
      const isTomorrow =
        itemTime.getDate() === now.getDate() + 1 ||
        (now.getDate() ===
          new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() &&
          itemTime.getDate() === 1);

      return isTomorrow;
    })
    .slice(0, 24);

  // Próximos 7 dias (a partir de hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next7Days = weatherData.daily.time
    .map((time, index) => {
      const dayTime = new Date(time);
      return {
        time,
        tempMax: weatherData.daily.temperature_2m_max[index],
        tempMin: weatherData.daily.temperature_2m_min[index],
        precipitation: weatherData.daily.precipitation_probability_max[index],
        weatherCode: weatherData.daily.weather_code[index],
        date: dayTime,
      };
    })
    .filter((item) => {
      // Mostra apenas dias >= hoje
      const itemDate = new Date(item.time);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= today;
    })
    .slice(0, 7);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.cityName}>
            {WeatherService.getLocationDisplayName(city)}
          </Text>
          <View style={styles.updateRow}>
            <Text style={styles.lastUpdatedHeader}>
              Atualizado: {lastUpdatedText}
            </Text>
            {onRefresh && canRefresh && (
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.headerRefreshButton}
              >
                <Text style={styles.headerRefreshIcon}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Condições atuais */}
        <View style={styles.currentWeather}>
          <Text style={styles.currentIcon}>{weatherIcon}</Text>
          <Text style={styles.currentTemp}>{currentTemp}°C</Text>
          <Text style={styles.currentDesc}>{weatherDesc}</Text>

          <View style={styles.currentDetails}>
            <View style={styles.currentDetailItem}>
              <Text style={styles.currentDetailLabel}>Umidade</Text>
              <Text style={styles.currentDetailValue}>{humidity}%</Text>
            </View>
            <View style={styles.currentDetailItem}>
              <Text style={styles.currentDetailLabel}>Precipitação</Text>
              <Text style={styles.currentDetailValue}>{precipitation}mm</Text>
            </View>
          </View>
        </View>

        {/* Previsão horária */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas 24 horas</Text>
          <FlatList
            data={next24Hours}
            renderItem={renderHourlyItem}
            keyExtractor={(item, index) => `hourly-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hourlyList}
          />
        </View>

        {/* Previsão diária */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos 7 dias</Text>
          <FlatList
            data={next7Days}
            renderItem={renderDailyItem}
            keyExtractor={(item, index) => `daily-${index}`}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50, // Adiciona espaço no topo para a status bar
    backgroundColor: "#2196F3",
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  updateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  lastUpdatedHeader: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  headerRefreshButton: {
    padding: 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 3,
    marginLeft: 8,
  },
  headerRefreshIcon: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  currentWeather: {
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  currentDesc: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },
  currentDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  currentDetailItem: {
    alignItems: "center",
  },
  currentDetailLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  currentDetailValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    padding: 16,
    paddingBottom: 8,
  },
  hourlyList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  hourlyItem: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    minWidth: 80,
  },
  hourlyTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  hourlyIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  hourlyRain: {
    fontSize: 12,
    color: "#2196F3",
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dailyDate: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  dailyIcon: {
    fontSize: 24,
    marginHorizontal: 16,
  },
  dailyTemp: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  dailyRain: {
    fontSize: 14,
    color: "#2196F3",
    minWidth: 40,
    textAlign: "right",
  },
});
