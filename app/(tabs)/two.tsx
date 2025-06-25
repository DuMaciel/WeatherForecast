import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { FavoritesService } from "@/services/FavoritesService";
import { WeatherService } from "@/services/WeatherService";

export default function SettingsScreen() {
  const handleClearFavorites = () => {
    Alert.alert(
      "Limpar Favoritos",
      "Tem certeza de que deseja remover todas as cidades favoritas?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            try {
              const favorites = await FavoritesService.getFavorites();
              for (const favorite of favorites) {
                await FavoritesService.removeFavorite(favorite.id);
              }
              Alert.alert(
                "Sucesso",
                "Todas as cidades favoritas foram removidas."
              );
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar os favoritos.");
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "Limpar Cache",
      "Isso forçará a atualização de todos os dados meteorológicos na próxima consulta.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            try {
              if (WeatherService.clearCache) {
                WeatherService.clearCache();
              }
              Alert.alert("Sucesso", "Cache limpo com sucesso.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar o cache.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearFavorites}
          >
            <Text style={styles.settingText}>Limpar Cidades Favoritas</Text>
            <Text style={styles.settingDescription}>
              Remove todas as cidades salvas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearCache}
          >
            <Text style={styles.settingText}>Limpar Cache</Text>
            <Text style={styles.settingDescription}>
              Força atualização de todos os dados meteorológicos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Versão</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Intervalo de Atualização</Text>
            <Text style={styles.settingDescription}>
              Os dados podem ser atualizados a cada 5 minutos
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Fonte dos Dados</Text>
            <Text style={styles.settingDescription}>
              OpenStreetMap Nominatim & Open-Meteo
            </Text>
          </View>
        </View>
      </View>
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  settingValue: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
});
