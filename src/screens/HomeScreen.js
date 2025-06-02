import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Alert,
  Modal,
  TextInput,
  Pressable,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getAllEventTracks, deleteEventTrack, editEventTrack } from "../service/service";

// --- CONSTANTS ---
const COLORS = {
  primary: "#8bd5fc",
  secondary: "#0077b6",
  background: "#f8f9fa",
  cardBackground: "#ffffff",
  textPrimary: "#2c3e50",
  textSecondary: "#7f8c8d",
  textTertiary: "#95a5a6",
  success: "#4CAF50",
  info: "#2196F3",
  error: "#FF5252",
  danger: "#e74c3c",
  light: "#e6f6fe",
  overlay: "rgba(0, 0, 0, 0.6)",
};

const SIZES = {
  headerTitle: 26,
  subtitle: 16,
  cardTitle: 17,
  cardDescription: 14,
  buttonText: 16,
  modalTitle: 20,
  radius: 14,
  spacing: 16,
};

// --- CUSTOM HOOKS ---
const useEventTracks = (navigation) => {
  const [eventTracks, setEventTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventTracks = useCallback(async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) setRefreshing(true);

      const response = await getAllEventTracks();

      if (!response.success) {
        throw new Error(response.error || "Error desconocido al cargar líneas de evento");
      }

      const processedTracks = response.data.map((track) => ({
        ...track,
        coverImageBase64: track.coverImageBase64 || track.cover_image || track.coverImage,
        overlayImageBase64: track.overlayImageBase64 || track.overlay_image || track.overlayImage,
      }));

      setEventTracks(processedTracks);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setError(error?.message || String(error) || "Error desconocido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setLoading(true);
    fetchEventTracks();
  }, [fetchEventTracks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setLoading(true);
      fetchEventTracks();
    });

    fetchEventTracks();
    return unsubscribe;
  }, [navigation, fetchEventTracks]);

  return {
    eventTracks,
    setEventTracks,
    loading,
    refreshing,
    error,
    onRefresh,
    fetchEventTracks,
  };
};

const useEditModal = (eventTracks, setEventTracks) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const [editModalError, setEditModalError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEditModal = useCallback((track) => {
    if (!track) return;
    setSelectedTrack(track);
    setEditData({
      name: track.name || "",
      description: track.description || "",
    });
    setIsEditing(true);
    setEditModalError(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedTrack) {
      setEditModalError("No se ha seleccionado ninguna línea para guardar.");
      return;
    }
    if (!editData?.name?.trim()) {
      setEditModalError("El nombre es requerido.");
      return;
    }

    setIsSaving(true);
    setEditModalError(null);

    try {
      const response = await editEventTrack({
        id: selectedTrack.id,
        name: editData.name.trim(),
        description: editData.description?.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || "Error al actualizar la línea de eventos");
      }

      setEventTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.id === selectedTrack.id
            ? {
                ...track,
                name: editData.name.trim(),
                description: editData.description?.trim() || track.description,
              }
            : track
        )
      );

      handleCancelEdit();
      Alert.alert("Éxito", "Línea de eventos actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
      setEditModalError(error?.message || String(error) || "Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  }, [editData, selectedTrack, setEventTracks]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditData({ name: "", description: "" });
    setEditModalError(null);
    setSelectedTrack(null);
  }, []);

  const handleNameChange = useCallback((text) => {
    setEditData((prev) => ({ ...prev, name: text || "" }));
    if (editModalError && text?.trim()) {
      setEditModalError(null);
    }
  }, [editModalError]);

  const handleDescriptionChange = useCallback((text) => {
    setEditData((prev) => ({ ...prev, description: text || "" }));
  }, []);

  return {
    isEditing,
    editData,
    editModalError,
    selectedTrack,
    isSaving,
    handleOpenEditModal,
    handleSaveEdit,
    handleCancelEdit,
    handleNameChange,
    handleDescriptionChange,
    setSelectedTrack,
  };
};

// --- COMPONENT DEFINITIONS ---
const Header = React.memo(({ eventTracksCount }) => (
  <View style={styles.header}>
    <View style={styles.titleContainer}>
      <Text style={styles.headerTitle}>Línea de Eventos</Text>
      <View style={styles.counterBadge}>
        <Text style={styles.counterText}>{eventTracksCount}</Text>
      </View>
    </View>
    <Text style={styles.headerSubtitle}>Explora y gestiona tus eventos</Text>
    <Text style={styles.headerHint}>Mantén presionado para ver opciones</Text>
  </View>
));

const LoadingScreen = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Cargando eventos...</Text>
  </View>
));

const ErrorScreen = React.memo(({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <Ionicons name="warning" size={48} color={COLORS.error} style={styles.errorIcon} />
    <Text style={styles.errorText}>Error al cargar los eventos</Text>
    <Text style={styles.errorDetail}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
));

const EmptyState = React.memo(({ onRefresh }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="list" size={48} color={COLORS.primary} style={styles.emptyIcon} />
    <Text style={styles.emptyText}>No hay líneas de eventos disponibles</Text>
    <Text style={styles.emptyTextSmall}>Crea una nueva para empezar.</Text>
    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
      <Text style={styles.refreshButtonText}>Actualizar</Text>
    </TouchableOpacity>
  </View>
));

const EventTrackCard = React.memo(({ item, onPress, onLongPress, onOptionsPress }) => {
  const imageUri = useMemo(() => {
    if (!item.coverImageBase64) return null;
    return item.coverImageBase64.startsWith("data:image")
      ? item.coverImageBase64
      : `data:image/png;base64,${item.coverImageBase64}`;
  }, [item.coverImageBase64]);

  return (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.trackImage} resizeMode="cover" />
      ) : (
        <View style={[styles.trackImage, styles.trackImagePlaceholder]}>
          <Ionicons name="list" size={40} color={COLORS.primary} />
        </View>
      )}

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {item.name || "Línea sin nombre"}
        </Text>
        <Text style={styles.trackDescription} numberOfLines={3}>
          {item.description || "Sin descripción"}
        </Text>

        {item.eventsCount !== undefined && (
          <View style={styles.eventsBadge}>
            <Ionicons name="calendar" size={16} color={COLORS.secondary} />
            <Text style={styles.eventsCount}>
              {item.eventsCount} {item.eventsCount === 1 ? "evento" : "eventos"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.optionsButton} onPress={onOptionsPress}>
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const OptionsModal = React.memo(({
  visible,
  onRequestClose,
  selectedTrack,
  onViewDetails,
  onEdit,
  onDeleteConfirmation,
}) => {
  if (!selectedTrack) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onRequestClose}
      >
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Opciones</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              {selectedTrack.name || "Sin nombre"}
            </Text>
          </View>

          <TouchableOpacity style={styles.modalOption} onPress={onViewDetails}>
            <Ionicons name="eye" size={24} color={COLORS.success} />
            <Text style={styles.modalOptionText}>Ver detalles</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalOption} onPress={() => onEdit(selectedTrack)}>
            <Ionicons name="create" size={24} color={COLORS.info} />
            <Text style={styles.modalOptionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalOption, styles.deleteOption]}
            onPress={() => onDeleteConfirmation(selectedTrack)}
          >
            <Ionicons name="trash" size={24} color={COLORS.error} />
            <Text style={[styles.modalOptionText, styles.deleteOptionText]}>Eliminar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onRequestClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </TouchableOpacity>
    </Modal>
  );
});

const EditModal = React.memo(({
  visible,
  onRequestClose,
  editData,
  onNameChange,
  onDescriptionChange,
  onSave,
  isSaving,
  error,
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onRequestClose}
    statusBarTranslucent={true}
  >
    <Pressable style={styles.editModalOverlay} onPress={onRequestClose}>
      <Pressable style={styles.editModalContent} onPress={(e) => e.stopPropagation()}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.editModalTitle}>Editar Línea de Eventos</Text>

          {error && typeof error === "string" && error.trim() && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.editSection}>
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              style={styles.input}
              value={editData?.name || ""}
              onChangeText={onNameChange}
              placeholder="Nombre requerido"
              editable={!isSaving}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          </View>

          <View style={styles.editSection}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              value={editData?.description || ""}
              onChangeText={onDescriptionChange}
              placeholder="Descripción opcional"
              editable={!isSaving}
              autoCapitalize="sentences"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.cancelEditButton,
                isSaving && styles.disabledButton,
              ]}
              onPress={onRequestClose}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.saveButton,
                (isSaving || !editData?.name?.trim()) && styles.disabledButton,
              ]}
              onPress={onSave}
              disabled={isSaving || !editData?.name?.trim()}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
));

const FloatingActionButton = React.memo(({ onPress }) => (
  <TouchableOpacity style={styles.addButton} onPress={onPress}>
    <MaterialIcons name="add" size={28} color="white" />
  </TouchableOpacity>
));

// --- MAIN COMPONENT ---
export default function EventTrackScreen({ navigation }) {
  const {
    eventTracks,
    setEventTracks,
    loading,
    refreshing,
    error: pageError,
    onRefresh,
  } = useEventTracks(navigation);

  const {
    isEditing,
    editData,
    editModalError,
    selectedTrack,
    isSaving,
    handleOpenEditModal,
    handleSaveEdit,
    handleCancelEdit,
    handleNameChange,
    handleDescriptionChange,
    setSelectedTrack,
  } = useEditModal(eventTracks, setEventTracks);

  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const handleDeleteTrack = useCallback(async (trackId) => {
    try {
      const response = await deleteEventTrack(trackId);

      if (!response.success) {
        throw new Error(response.error || "Error al eliminar la línea de eventos");
      }

      setEventTracks((prevTracks) => prevTracks.filter((track) => track.id !== trackId));
      setSelectedTrack(null);
      setShowOptionsModal(false);

      Alert.alert("Éxito", "Línea de eventos eliminada correctamente", [{ text: "OK" }]);
    } catch (error) {
      console.error("Error al eliminar línea de eventos:", error);
      Alert.alert(
        "Error",
        `No se pudo eliminar la línea de eventos: ${error?.message || String(error)}`,
        [{ text: "OK" }]
      );
    }
  }, [setEventTracks, setSelectedTrack]);

  const showDeleteConfirmation = useCallback(
    (track) => {
      if (!track) return;
      setShowOptionsModal(false);
      Alert.alert(
        "Confirmar eliminación",
        `¿Estás seguro de que deseas eliminar la línea de eventos "${
          track.name || "esta línea"
        }"?\n\nEsta acción no se puede deshacer.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => handleDeleteTrack(track.id),
          },
        ]
      );
    },
    [handleDeleteTrack]
  );

  const showTrackOptions = useCallback((track) => {
    setSelectedTrack(track);
    setShowOptionsModal(true);
  }, [setSelectedTrack]);

  const renderEventTrackItem = useCallback(
    ({ item }) => (
      <EventTrackCard
        item={item}
        onPress={() =>
          navigation.navigate("EventTrackDetail", {
            trackId: item.id,
            trackName: item.name,
          })
        }
        onLongPress={() => showTrackOptions(item)}
        onOptionsPress={() => showTrackOptions(item)}
      />
    ),
    [navigation, showTrackOptions]
  );

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[COLORS.primary]}
        tintColor={COLORS.primary}
        progressBackgroundColor="#ffffff"
      />
    ),
    [refreshing, onRefresh]
  );

  if (loading && eventTracks.length === 0) {
    return <LoadingScreen />;
  }

  if (pageError && eventTracks.length === 0 && !isEditing) {
    return <ErrorScreen error={pageError} onRetry={onRefresh} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <Header eventTracksCount={eventTracks.length} />

        <FlatList
          data={eventTracks}
          renderItem={renderEventTrackItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={memoizedRefreshControl}
          ListEmptyComponent={!loading ? <EmptyState onRefresh={onRefresh} /> : null}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />

        <FloatingActionButton onPress={() => navigation.navigate("AddEventTrack")} />

        <OptionsModal
          visible={showOptionsModal}
          onRequestClose={() => setShowOptionsModal(false)}
          selectedTrack={selectedTrack}
          onViewDetails={() => {
            if (!selectedTrack) return;
            setShowOptionsModal(false);
            navigation.navigate("EventTrackDetail", {
              trackId: selectedTrack.id,
              trackName: selectedTrack.name,
            });
          }}
          onEdit={(track) => {
            setShowOptionsModal(false);
            handleOpenEditModal(track);
          }}
          onDeleteConfirmation={showDeleteConfirmation}
        />

        <EditModal
          visible={isEditing}
          onRequestClose={handleCancelEdit}
          editData={editData}
          onNameChange={handleNameChange}
          onDescriptionChange={handleDescriptionChange}
          onSave={handleSaveEdit}
          isSaving={isSaving}
          error={editModalError}
        />
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: SIZES.headerTitle,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginRight: 10,
  },
  counterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 24,
  },
  counterText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  headerSubtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  headerHint: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    color: COLORS.error,
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  errorDetail: {
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: SIZES.buttonText,
  },
  listContainer: {
    paddingHorizontal: SIZES.spacing,
    paddingTop: 8,
    paddingBottom: 80,
  },
  trackCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.spacing,
    flexDirection: "row",
    minHeight: 120,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.textTertiary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  trackImage: {
    width: 110,
    height: "100%",
  },
  trackImagePlaceholder: {
    width: 110,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light,
  },
  trackInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-around",
  },
  trackTitle: {
    fontSize: SIZES.cardTitle,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  trackDescription: {
    fontSize: SIZES.cardDescription,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginTop: "auto",
  },
  eventsCount: {
    color: COLORS.secondary,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },
  optionsButton: {
    padding: 12,
    alignSelf: "flex-start",
    marginLeft: "auto",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 50,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 8,
    color: "#555",
    fontSize: 18,
    lineHeight: 26,
  },
  emptyTextSmall: {
    textAlign: "center",
    marginBottom: 24,
    color: "#777",
    fontSize: 14,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: SIZES.buttonText,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 0,
    width: "100%",
    maxWidth: 340,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: SIZES.modalTitle,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 17,
    marginLeft: 20,
    color: "#333",
    fontWeight: "500",
  },
  deleteOption: {},
  deleteOptionText: {
    color: COLORS.error,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "600",
    fontSize: SIZES.buttonText,
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    padding: 20,
  },
  editModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25, 
    width: "100%", 
    maxHeight: "90%", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  editModalTitle: {
    fontSize: 22, 
    fontWeight: "600",
    color: "#333",
    marginBottom: 25, 
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#FFEBEE", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 20, 
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
  },
  errorBannerText: {
    color: "#B71C1C", 
    textAlign: "left", 
    fontSize: 15,
  },
  editSection: {
    marginBottom: 20, 
  },
  label: {
    fontSize: 16,
    fontWeight: "500", 
    marginBottom: 8,  
    color: "#555",   
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da", 
    borderRadius: 10,
    paddingHorizontal: 15, 
    paddingVertical: 12,   
    fontSize: 16,
    backgroundColor: '#fff', 
    color: '#333',
  },
  multilineInput: {
    minHeight: 100, 
    textAlignVertical: "top",
    paddingTop: 12, 
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30, 
  },
  button: {
    paddingVertical: 15, 
    borderRadius: 25, 
    flex: 1, 
    alignItems: "center",
    marginHorizontal: 5, 
  },
  saveButton: {
    backgroundColor: "#8bd5fc",
  },
  cancelEditButton: {
    backgroundColor: "#e74c3c", 
  },
  disabledButton: {
    opacity: 0.5, 
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});