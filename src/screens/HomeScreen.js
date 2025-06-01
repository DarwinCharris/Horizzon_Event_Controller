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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllEvents } from "../service/service";

import { Modal } from "react-native";
import CreateEventForm from "../components/componente_de_prueba/eventform";

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Nuevo estado para controlar el modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);

      const response = await getAllEvents();

      if (!response.success) {
        throw new Error(response.error);
      }

      const processedEvents = response.data.map((event) => {
        // Procesar speakers para asegurar consistencia
        let speakers = [];
        try {
          if (event.speakers) {
            // Si es string, parsear
            if (typeof event.speakers === "string") {
              speakers = JSON.parse(event.speakers);
            } else {
              speakers = event.speakers;
            }

            // Convertir a formato objeto si es necesario
            if (Array.isArray(speakers)) {
              speakers = speakers.map((speaker) => {
                return typeof speaker === "string"
                  ? { name: speaker, title: "" }
                  : speaker;
              });
            }
          }
        } catch (error) {
          console.error("Error processing speakers:", error);
          speakers = [];
        }

        return {
          ...event,
          speakers: speakers || [],
          formattedStartDate: formatDate(
            event.initial_date || event.initialDate
          ),
          formattedEndDate: formatDate(event.final_date || event.finalDate),
          trackName:
            event.event_track_name || event.eventTrackName || "Sin categoría",
          available_seats: event.available_seats || event.availableSeats || 0,
          // Manejo de imágenes en base64
          coverImageBase64:
            event.coverImageBase64 || event.cover_image || event.coverImage,
          cardImageBase64:
            event.cardImageBase64 || event.card_image || event.cardImage,
        };
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no definida";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const onRefresh = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchEvents();
    });

    fetchEvents();

    return unsubscribe;
  }, [navigation, fetchEvents]);

  const getSpeakerNames = (speakers) => {
    if (!speakers) return [];

    try {
      const parsed =
        typeof speakers === "string" ? JSON.parse(speakers) : speakers;
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((speaker) => {
          return typeof speaker === "string" ? speaker : speaker?.name || "";
        })
        .filter((name) => name.trim());
    } catch (error) {
      console.error("Error parsing speakers:", error);
      return [];
    }
  };

  const renderEventItem = useCallback(
    ({ item }) => {
      const speakerNames = getSpeakerNames(item.speakers);
      const imageUri = item.coverImageBase64?.startsWith("data:image")
        ? item.coverImageBase64
        : `data:image/png;base64,${item.coverImageBase64}`;

      return (
        <TouchableOpacity
          style={styles.eventCard}
          onPress={() =>
            navigation.navigate("EventDetail", {
              eventId: item.id,
              eventData: item,
            })
          }
          activeOpacity={0.8}
        >
          {item.coverImageBase64 ? (
            <Image source={{ uri: imageUri }} style={styles.eventImage} />
          ) : (
            <View style={[styles.eventImage, styles.eventImagePlaceholder]}>
              <Ionicons name="calendar" size={40} color="#8bd5fc" />
            </View>
          )}

          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.name}
            </Text>

            {speakerNames.length > 0 && (
              <View style={styles.speakersContainer}>
                <Ionicons name="people" size={16} color="#8bd5fc" />
                <Text style={styles.speakersText}>
                  {speakerNames.join(", ")}
                </Text>
              </View>
            )}

            <View style={styles.eventMeta}>
              <View style={styles.trackBadge}>
                <Text style={styles.eventTrack} numberOfLines={1}>
                  {item.trackName || "Sin categoría"}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar" size={16} color="#8bd5fc" />
                <Text style={styles.eventDate} numberOfLines={1}>
                  {item.formattedStartDate} - {item.formattedEndDate}
                </Text>
              </View>
            </View>

            <View style={styles.eventFooter}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#8bd5fc" />
                <Text style={styles.eventLocation} numberOfLines={1}>
                  {item.location || "Ubicación no definida"}
                </Text>
              </View>
              <View
                style={[
                  styles.seatsBadge,
                  item.available_seats < 10 && styles.lowSeats,
                ]}
              >
                <Text style={styles.eventSeats}>
                  {item.available_seats} asientos
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  if (loading && events.length === 0) {
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
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
              name="calendar"
              size={48}
              color="#8bd5fc"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchEvents}
            >
              <Text style={styles.refreshButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 🔘 Botón flotante "+" */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* 🪟 Modal con CreateEventForm */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <CreateEventForm
          route={{
            params: {
              refreshEvents: fetchEvents,
              closeForm: () => setShowCreateModal(false),
            },
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 10, // Añadido para mejor espaciado
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
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#8bd5fc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  eventImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6f6fe",
    height: 150,
  },
  eventInfo: {
    padding: 18,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  speakersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  speakersText: {
    color: "#555",
    fontSize: 14,
    marginLeft: 6,
  },
  eventMeta: {
    marginBottom: 14,
  },
  trackBadge: {
    backgroundColor: "#e6f6fe",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  eventTrack: {
    color: "#0077b6",
    fontWeight: "600",
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDate: {
    color: "#555",
    fontSize: 14,
    marginLeft: 6,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  eventLocation: {
    color: "#555",
    fontSize: 14,
    marginLeft: 6,
  },
  seatsBadge: {
    backgroundColor: "#e6f6fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowSeats: {
    backgroundColor: "#ffebee",
  },
  eventSeats: {
    fontWeight: "600",
    color: "#4CAF50",
    fontSize: 14,
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
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#8bd5fc",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
