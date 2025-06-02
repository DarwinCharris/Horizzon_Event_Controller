import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons,MaterialIcons } from "@expo/vector-icons";
import { getAllEventTracks } from "../service/service";

export default function EventTrackScreen({ navigation }) {
  const [eventTracks, setEventTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventTracks = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);

      const response = await getAllEventTracks();

      if (!response.success) {
        throw new Error(response.error);
      }

      const processedTracks = response.data.map((track) => ({
        ...track,
        coverImageBase64:
          track.coverImageBase64 || track.cover_image || track.coverImage,
        overlayImageBase64:
          track.overlayImageBase64 || track.overlay_image || track.overlayImage,
      }));

      setEventTracks(processedTracks);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchEventTracks();
  }, [fetchEventTracks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchEventTracks();
    });

    fetchEventTracks();

    return unsubscribe;
  }, [navigation, fetchEventTracks]);

  const renderEventTrackItem = useCallback(
    ({ item }) => {
      const imageUri = item.coverImageBase64?.startsWith("data:image")
        ? item.coverImageBase64
        : `data:image/png;base64,${item.coverImageBase64}`;

      return (
        <TouchableOpacity
          style={styles.trackCard}
          onPress={() =>
            navigation.navigate("EventTrackDetail", {
              trackId: item.id,
              trackName: item.name,
            })
          }
          activeOpacity={0.8}
        >
          {item.coverImageBase64 ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.trackImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.trackImage, styles.trackImagePlaceholder]}>
              <Ionicons name="list" size={40} color="#8bd5fc" />
            </View>
          )}

          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.trackDescription} numberOfLines={3}>
              {item.description || "Sin descripción"}
            </Text>

            {item.eventsCount !== undefined && (
              <View style={styles.eventsBadge}>
                <Ionicons name="calendar" size={16} color="#8bd5fc" />
                <Text style={styles.eventsCount}>
                  {item.eventsCount}{" "}
                  {item.eventsCount === 1 ? "evento" : "eventos"}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  if (loading && eventTracks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8bd5fc" />
        <Text style={styles.loadingText}>Cargando eventos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="warning"
          size={48}
          color="#FF5252"
          style={styles.errorIcon}
        />
        <Text style={styles.errorText}>Error al cargar los eventos</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEventTracks}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Encabezado con título */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Línea de Eventos</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{eventTracks.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Explora y gestiona tus eventos
          </Text>
        </View>

        <FlatList
          data={eventTracks}
          renderItem={renderEventTrackItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8bd5fc"]}
              tintColor="#8bd5fc"
              progressBackgroundColor="#ffffff"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="list"
                size={48}
                color="#8bd5fc"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No hay eventos disponibles</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchEventTracks}
              >
                <Text style={styles.refreshButtonText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddEventTrack")} // Asegúrate de que esta screen exista
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomColor: "#e0e0e0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  counterBadge: {
    backgroundColor: "#8bd5fc",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8bd5fc",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    color: "#8bd5fc",
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8f9fa",
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    color: "#FF5252",
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  errorDetail: {
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#8bd5fc",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#8bd5fc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  trackCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    flexDirection: "row",
    height: 120,
  },
  trackImage: {
    width: 120,
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  trackImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6f6fe",
  },
  trackInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f6fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  eventsCount: {
    color: "#0077b6",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
    fontSize: 16,
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: "#8bd5fc",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#8bd5fc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#8bd5fc',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
