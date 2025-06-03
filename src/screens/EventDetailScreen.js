import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  editEvent,
  getEventById,
  getAllFeedbacks,
  enviarFeedback,
  deleteEvent,
} from "../service/service";
import DateTimePicker from "@react-native-community/datetimepicker";
import StarRating from "../components/StartRating";

const EventDetailScreen = ({ route, navigation }) => {
  const { eventData: initialEventData } = route.params;
  const [eventData, setEventData] = useState(initialEventData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...initialEventData });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState("date");
  const [currentDateField, setCurrentDateField] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    stars: 5,
    comment: "",
    userName: "",
  });
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [speakersList, setSpeakersList] = useState([]);
  const [newSpeaker, setNewSpeaker] = useState("");
  const [editingSpeakerIndex, setEditingSpeakerIndex] = useState(null);
  const [editingSpeakerName, setEditingSpeakerName] = useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFeedbacks();
    });

    initializeSpeakers();

    return unsubscribe;
  }, [navigation]);

  const initializeSpeakers = () => {
    try {
      let speakers = [];
      if (eventData.speakers) {
        speakers =
          typeof eventData.speakers === "string"
            ? JSON.parse(eventData.speakers)
            : Array.isArray(eventData.speakers)
            ? eventData.speakers
            : [];
      }

      const normalizedSpeakers = speakers
        .map((speaker) =>
          typeof speaker === "string" ? speaker : speaker?.name || ""
        )
        .filter((name) => name.trim() !== "");

      setSpeakersList(normalizedSpeakers);
    } catch (e) {
      console.warn("Error al inicializar speakers:", e);
      setSpeakersList([]);
    }
  };

  const loadFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await getAllFeedbacks();

      if (response.success) {
        const eventFeedbacks = response.data
          .filter((fb) => fb.event_id === eventData.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFeedbacks(eventFeedbacks);
      } else {
        throw new Error(response.error || "Error al cargar feedbacks");
      }
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      setError("No se pudieron cargar los feedbacks");
      setErrorDetails(error.message);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...eventData });
    initializeSpeakers();
    setError(null);
    setErrorDetails(null);
  };

  const retryRequest = async (fn, retries = 2, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, delay));
        return retryRequest(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setErrorDetails(null);

    try {
      const validationErrors = [];

      if (!editData.name?.trim())
        validationErrors.push("El nombre del evento es requerido");
      if (!editData.description?.trim())
        validationErrors.push("La descripción es requerida");
      if (new Date(editData.final_date) < new Date(editData.initial_date)) {
        validationErrors.push(
          "La fecha final no puede ser anterior a la inicial"
        );
      }
      if (editData.available_seats > editData.capacity) {
        validationErrors.push(
          "Los asientos disponibles no pueden exceder la capacidad"
        );
      }

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      const capacity = Math.max(0, parseInt(editData.capacity) || 0);
      const available_seats = Math.min(
        capacity,
        Math.max(0, parseInt(editData.available_seats) || 0)
      );

      const dataToSend = {
        id: eventData.id,
        name: editData.name.trim(),
        description: editData.description.trim(),
        long_description: editData.long_description?.trim() || null,
        initial_date: new Date(editData.initial_date).toISOString(),
        final_date: new Date(editData.final_date).toISOString(),
        location: editData.location?.trim() || null,
        capacity: capacity,
        available_seats: available_seats,
        event_track_name: editData.event_track_name?.trim() || null,
        speakers: speakersList,
      };

      const response = await retryRequest(() => editEvent(dataToSend));

      if (response.success) {
        setEventData((prev) => ({
          ...prev,
          ...dataToSend,
          trackName: prev.trackName,
          id: prev.id,
        }));

        setIsEditing(false);
        Alert.alert("Éxito", "Evento actualizado correctamente");
      } else {
        throw new Error(
          response.error || `Error ${response.status} al actualizar el evento`
        );
      }
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Response data:", error.response?.data);

      let errorMsg = "Error al guardar los cambios";
      let errorDetailMsg = "";

      if (error.response?.data) {
        errorDetailMsg = JSON.stringify(error.response.data, null, 2);
        if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMsg =
            "Error interno del servidor. Por favor, intente nuevamente.";
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      setErrorDetails(errorDetailMsg || error.message);

      Alert.alert(
        "Error",
        errorMsg,
        [
          { text: "OK", style: "cancel" },
          errorDetails
            ? {
                text: "Ver detalles",
                onPress: () => Alert.alert("Detalles del error", errorDetails),
              }
            : null,
        ].filter(Boolean)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addSpeaker = () => {
    if (newSpeaker.trim() === "") return;

    setSpeakersList([...speakersList, newSpeaker.trim()]);
    setNewSpeaker("");
  };

  const removeSpeaker = (index) => {
    const newList = [...speakersList];
    newList.splice(index, 1);
    setSpeakersList(newList);
  };

  const startEditingSpeaker = (index) => {
    setEditingSpeakerIndex(index);
    setEditingSpeakerName(speakersList[index]);
  };

  const saveEditedSpeaker = () => {
    if (editingSpeakerName.trim() === "") return;

    const newList = [...speakersList];
    newList[editingSpeakerIndex] = editingSpeakerName.trim();
    setSpeakersList(newList);
    cancelEditingSpeaker();
  };

  const cancelEditingSpeaker = () => {
    setEditingSpeakerIndex(null);
    setEditingSpeakerName("");
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: handleDelete, style: "destructive" },
      ]
    );
  };

  const handleDelete = async () => {
    setIsSaving(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await retryRequest(() => deleteEvent(eventData.id));

      if (response.success) {
        Alert.alert("Éxito", "Evento eliminado correctamente");
        navigation.goBack();
      } else {
        throw new Error(
          response.error || `Error ${response.status} al eliminar el evento`
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("No se pudo eliminar el evento");
      setErrorDetails(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      );
      Alert.alert("Error", "No se pudo eliminar el evento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!newFeedback.comment.trim()) {
      setError("Por favor ingresa un comentario");
      return;
    }

    setIsSaving(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await retryRequest(() =>
        enviarFeedback({
          eventId: eventData.id,
          stars: newFeedback.stars,
          comment: newFeedback.comment.trim(),
          userName: newFeedback.userName.trim() || "Anónimo",
        })
      );

      if (response.success) {
        const newFeedbackItem = {
          id: response.data.id || Date.now(),
          event_id: eventData.id,
          user_name: newFeedback.userName.trim() || "Anónimo",
          stars: newFeedback.stars,
          comment: newFeedback.comment.trim(),
          created_at: new Date().toISOString(),
        };

        setFeedbacks((prev) => [newFeedbackItem, ...prev]);
        setShowFeedbackModal(false);
        setNewFeedback({ stars: 5, comment: "", userName: "" });
        Alert.alert("Gracias", "Tu feedback ha sido enviado");
      } else {
        throw new Error(response.error || "Error al enviar feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("No se pudo enviar el feedback");
      setErrorDetails(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      );
      Alert.alert("Error", "No se pudo enviar el feedback");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No definido";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const renderSpeakers = () => {
    if (!eventData.speakers || eventData.speakers.length === 0) {
      return (
        <Text style={styles.detailText}>No hay expositores registrados</Text>
      );
    }

    let speakersList;
    try {
      speakersList =
        typeof eventData.speakers === "string"
          ? JSON.parse(eventData.speakers)
          : eventData.speakers;
    } catch (e) {
      speakersList = [];
    }

    return speakersList.map((speaker, index) => {
      const speakerName = typeof speaker === "string" ? speaker : speaker?.name;
      if (!speakerName) return null;

      return (
        <View key={index} style={styles.speakerContainer}>
          <Ionicons name="person" size={20} color="#8bd5fc" />
          <Text style={styles.speakerName}>{speakerName}</Text>
        </View>
      );
    });
  };

  const renderFeedbacks = () => {
    if (isLoadingFeedbacks) {
      return <ActivityIndicator size="small" color="#8bd5fc" />;
    }

    if (feedbacks.length === 0) {
      return <Text style={styles.detailText}>No hay feedbacks aún</Text>;
    }

    return feedbacks.map((feedback) => (
      <View key={feedback.id} style={styles.feedbackContainer}>
        <View style={styles.feedbackHeader}>
          <StarRating rating={feedback.stars} size={20} editable={false} />
          <Text style={styles.feedbackAuthor}>
            {feedback.user_name || "Anónimo"}
          </Text>
          <Text style={styles.feedbackDate}>
            {new Date(feedback.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <Text style={styles.feedbackComment}>{feedback.comment}</Text>
      </View>
    ));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditData({
        ...editData,
        [currentDateField]: selectedDate.toISOString(),
      });
    }
  };

  const openDatePicker = (field, mode = "date") => {
    setCurrentDateField(field);
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEditing}
      onRequestClose={() => setIsEditing(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Editar Evento</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                {__DEV__ && errorDetails && (
                  <Text style={styles.errorDetailsText}>{errorDetails}</Text>
                )}
              </View>
            )}

            <View style={styles.editSection}>
              <Text style={styles.label}>Nombre del Evento*</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) =>
                  setEditData({ ...editData, name: text })
                }
                placeholder="Nombre requerido"
                maxLength={100}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Descripción*</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                value={editData.description}
                onChangeText={(text) =>
                  setEditData({ ...editData, description: text })
                }
                placeholder="Descripción requerida"
                maxLength={500}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Descripción Larga</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                value={editData.long_description}
                onChangeText={(text) =>
                  setEditData({ ...editData, long_description: text })
                }
                maxLength={1000}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Fecha y Hora de Inicio*</Text>
              <Pressable
                style={styles.dateInput}
                onPress={() => openDatePicker("initial_date")}
              >
                <Text>
                  {editData.initial_date
                    ? formatDateTime(editData.initial_date)
                    : "Seleccionar fecha*"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Fecha y Hora de Finalización*</Text>
              <Pressable
                style={styles.dateInput}
                onPress={() => openDatePicker("final_date")}
              >
                <Text>
                  {editData.final_date
                    ? formatDateTime(editData.final_date)
                    : "Seleccionar fecha*"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={editData.location}
                onChangeText={(text) =>
                  setEditData({ ...editData, location: text })
                }
                maxLength={200}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Capacidad*</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(editData.capacity)}
                onChangeText={(text) =>
                  setEditData({ ...editData, capacity: parseInt(text) || 0 })
                }
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Asientos Disponibles*</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(editData.available_seats)}
                onChangeText={(text) =>
                  setEditData({
                    ...editData,
                    available_seats: parseInt(text) || 0,
                  })
                }
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Expositores</Text>
              <View style={styles.speakerInputContainer}>
                <TextInput
                  style={styles.speakerInput}
                  value={newSpeaker}
                  onChangeText={setNewSpeaker}
                  placeholder="Nombre del expositor"
                  maxLength={100}
                />
                <TouchableOpacity
                  style={styles.addSpeakerButton}
                  onPress={addSpeaker}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.speakersList}>
                {speakersList.map((speaker, index) => (
                  <View key={index} style={styles.speakerItem}>
                    {editingSpeakerIndex === index ? (
                      <View style={styles.editSpeakerContainer}>
                        <TextInput
                          style={styles.editSpeakerInput}
                          value={editingSpeakerName}
                          onChangeText={setEditingSpeakerName}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.saveEditSpeakerButton}
                          onPress={saveEditedSpeaker}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#4CAF50"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEditSpeakerButton}
                          onPress={cancelEditingSpeaker}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#f44336"
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.speakerItemText}>{speaker}</Text>
                        <View style={styles.speakerActions}>
                          <TouchableOpacity
                            style={styles.editSpeakerButton}
                            onPress={() => startEditingSpeaker(index)}
                          >
                            <Ionicons
                              name="create-outline"
                              size={20}
                              color="#8bd5fc"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeSpeakerButton}
                            onPress={() => removeSpeaker(index)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={20}
                              color="#f44336"
                            />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                ))}
                {speakersList.length === 0 && (
                  <Text style={styles.noSpeakersText}>
                    No hay expositores añadidos
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.saveButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Guardar Cambios</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFeedbackModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFeedbackModal}
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Dejar Feedback</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                {__DEV__ && errorDetails && (
                  <Text style={styles.errorDetailsText}>{errorDetails}</Text>
                )}
              </View>
            )}

            <View style={styles.editSection}>
              <Text style={styles.label}>Tu nombre (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Cómo quieres que aparezca tu nombre"
                value={newFeedback.userName}
                onChangeText={(text) =>
                  setNewFeedback({ ...newFeedback, userName: text })
                }
                maxLength={100}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Calificación</Text>
              <StarRating
                rating={newFeedback.stars}
                onRate={(stars) => setNewFeedback({ ...newFeedback, stars })}
                size={30}
                editable={true}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Comentario*</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                placeholder="Escribe tu opinión sobre el evento..."
                value={newFeedback.comment}
                onChangeText={(text) =>
                  setNewFeedback({ ...newFeedback, comment: text })
                }
                maxLength={500}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.saveButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleSubmitFeedback}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Enviar Feedback</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={2}>
          {eventData.name}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash-outline" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Evento</Text>
            <Text style={styles.detailText}>
              {eventData.description || "No hay descripción disponible"}
            </Text>
            {eventData.long_description && (
              <Text style={[styles.detailText, { marginTop: 10 }]}>
                {eventData.long_description}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha y Hora</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>
                {formatDateTime(eventData.initial_date)} -{" "}
                {formatDateTime(eventData.final_date)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>
                {eventData.location || "Ubicación no especificada"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asistencia</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>
                {eventData.available_seats} de {eventData.capacity} asientos
                disponibles
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((eventData.capacity - eventData.available_seats) /
                        eventData.capacity) *
                      100
                    }%`,
                    backgroundColor:
                      eventData.available_seats < 10 ? "#FF5252" : "#4CAF50",
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expositores</Text>
            {renderSpeakers()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="pricetag" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>
                {eventData.trackName || "Sin categoría"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Feedbacks</Text>
              <TouchableOpacity
                onPress={() => setShowFeedbackModal(true)}
                style={styles.addButton}
              >
                <Ionicons name="add-circle" size={24} color="#8bd5fc" />
              </TouchableOpacity>
            </View>
            {renderFeedbacks()}
          </View>
        </View>
      </ScrollView>

      {renderEditModal()}
      {renderFeedbackModal()}

      {showDatePicker && (
        <DateTimePicker
          value={new Date(editData[currentDateField] || new Date())}
          mode={datePickerMode}
          display="default"
          onChange={handleDateChange}
        />
      )}

      {__DEV__ && error && (
        <View style={styles.errorDebug}>
          <Text style={styles.errorDebugText}>Error: {error}</Text>
          {errorDetails && (
            <Text style={styles.errorDebugText}>Detalles: {errorDetails}</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Los estilos permanecen exactamente iguales que en tu código original
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#8bd5fc",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 10,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: 10,
  },
  editButton: {
    marginRight: 15,
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#8bd5fc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#8bd5fc",
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: "#8bd5fc",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    flex: 1,
  },
  speakerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  speakerName: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
  },
  errorDetailsText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 5,
  },
  editSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#8bd5fc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#8bd5fc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#8bd5fc",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#8bd5fc",
    paddingBottom: 5,
  },
  addButton: {
    padding: 5,
  },
  feedbackContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  feedbackDate: {
    fontSize: 12,
    color: "#777",
  },
  feedbackComment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginTop: 5,
  },
  errorDebug: {
    backgroundColor: "#FFEBEE",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  errorDebugText: {
    color: "#D32F2F",
    fontSize: 12,
  },
  speakerInputContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  speakerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#8bd5fc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addSpeakerButton: {
    backgroundColor: "#8bd5fc",
    borderRadius: 10,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  speakersList: {
    marginTop: 10,
  },
  speakerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
    marginBottom: 5,
  },
  speakerItemText: {
    flex: 1,
    fontSize: 16,
  },
  noSpeakersText: {
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  editSpeakerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  editSpeakerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#8bd5fc",
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
  saveEditSpeakerButton: {
    marginHorizontal: 5,
  },
  cancelEditSpeakerButton: {
    marginLeft: 5,
  },
  speakerActions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  editSpeakerButton: {
    marginRight: 5,
  },
  removeSpeakerButton: {
    marginLeft: 5,
  },
});

export default EventDetailScreen;
