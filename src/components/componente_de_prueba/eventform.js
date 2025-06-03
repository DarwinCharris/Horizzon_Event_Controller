import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import ImageUriPicker from "./uir";
import { createEvent, getListEventTracks } from "../../service/service";

const CreateEventForm = ({ route }) => {
  const { refreshEvents, closeForm } = route.params || {};

  const [form, setForm] = useState({
    trackId: "",
    eventTrackName: "",
    name: "",
    description: "",
    longDescription: "",
    start: null,
    end: null,
    location: "",
    capacity: "",
    seats: "",
  });

  const [eventTracks, setEventTracks] = useState([]);
  const [speakers, setSpeakers] = useState([""]);
  const [coverUri, setCoverUri] = useState(null);
  const [cardUri, setCardUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [trackModalVisible, setTrackModalVisible] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      const result = await getListEventTracks();
      if (result.success) setEventTracks(result.data);
    };
    fetchTracks();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleTrackSelection = (id, name) => {
    setForm((prev) => ({
      ...prev,
      trackId: parseInt(id), // 🔁 como entero
      eventTrackName: name,
    }));
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return date.toLocaleString(); // Ej: 2/6/2025, 16:30
  };

  const handleSubmit = async () => {
    if (!form.trackId) {
      Alert.alert("Error", "Por favor, selecciona una línea de evento");
      return;
    }

    try {
      setLoading(true);

      const eventData = {
        trackId: parseInt(form.trackId),
        eventTrackName: form.eventTrackName,
        name: form.name,
        description: form.description,
        longDescription: form.longDescription,
        start: form.start?.toISOString(),
        end: form.end?.toISOString(),
        location: form.location,
        capacity: parseInt(form.capacity),
        seats: parseInt(form.seats),
        speakers: speakers.filter((s) => s.trim() !== ""),
        coverPath: coverUri,
        cardPath: cardUri,
      };
      print("Event Data:", eventData.end);
      const response = await createEvent(eventData);
      if (!response.success) throw new Error(response.error);

      Alert.alert("Éxito", "Evento creado correctamente");
      refreshEvents?.();
      closeForm?.();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topbar}>
        <StatusBar backgroundColor="#8BD5FC" barStyle="dark-content" />
        <View style={styles.topbarContent}>
          <Text style={styles.topbarTitle}>Crear Evento</Text>
          <TouchableOpacity onPress={closeForm}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Línea de evento asociado</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setTrackModalVisible(true)}
        >
          <Text
            style={
              form.trackId ? styles.dropdownText : styles.dropdownPlaceholder
            }
          >
            {form.trackId ? form.eventTrackName : "Seleccionar línea de evento"}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={trackModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setTrackModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                {eventTracks.map((track) => (
                  <TouchableOpacity
                    key={track.id}
                    onPress={() => {
                      handleTrackSelection(track.id, track.name);
                      setTrackModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text>{track.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Button
                title="Cancelar"
                onPress={() => setTrackModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

        <Text style={styles.sectionTitle}>Nombre del Evento</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(t) => handleChange("name", t)}
          placeholder="Nombre del Evento"
        />

        <Text style={styles.sectionTitle}>Descripción corta</Text>
        <TextInput
          style={styles.input}
          value={form.description}
          onChangeText={(t) => handleChange("description", t)}
          placeholder="Descripción corta"
        />

        <Text style={styles.sectionTitle}>Descripción larga</Text>
        <TextInput
          style={styles.input}
          value={form.longDescription}
          onChangeText={(t) => handleChange("longDescription", t)}
          placeholder="Descripción larga"
          multiline
        />

        <Text style={styles.sectionTitle}>Fechas y lugar</Text>

        <Text style={styles.subLabel}>Fecha y hora de inicio</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowStartPicker(true)}
        >
          <Text>
            {formatDateTime(form.start) || "Seleccionar fecha de inicio"}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={form.start || new Date()}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={(_, date) => {
              setShowStartPicker(Platform.OS === "ios");
              if (date) handleChange("start", date);
            }}
          />
        )}

        <Text style={styles.subLabel}>Fecha y hora de fin</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowEndPicker(true)}
        >
          <Text>{formatDateTime(form.end) || "Seleccionar fecha de fin"}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={form.end || new Date()}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={(_, date) => {
              setShowEndPicker(Platform.OS === "ios");
              if (date) handleChange("end", date);
            }}
          />
        )}

        <Text style={styles.subLabel}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={form.location}
          onChangeText={(t) => handleChange("location", t)}
          placeholder="Ubicación"
        />

        <Text style={styles.sectionTitle}>Capacidad</Text>
        <TextInput
          style={styles.input}
          value={form.capacity}
          onChangeText={(t) => handleChange("capacity", t)}
          placeholder="Capacidad"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={form.seats}
          onChangeText={(t) => handleChange("seats", t)}
          placeholder="Asientos disponibles"
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Speakers</Text>
        {speakers.map((sp, i) => (
          <TextInput
            key={i}
            style={styles.input}
            value={sp}
            onChangeText={(t) => {
              const updated = [...speakers];
              updated[i] = t;
              setSpeakers(updated);
            }}
            placeholder={`Speaker ${i + 1}`}
          />
        ))}
        <Button
          title="Agregar speaker"
          onPress={() => setSpeakers([...speakers, ""])}
        />

        <Text style={styles.sectionTitle}>Portada del evento</Text>
        <ImageUriPicker onUriPicked={setCoverUri} currentUri={coverUri} />
        {coverUri && (
          <Image source={{ uri: coverUri }} style={styles.imagePreview} />
        )}

        <Text style={styles.sectionTitle}>Imagen de tarjeta</Text>
        <ImageUriPicker onUriPicked={setCardUri} currentUri={cardUri} />
        {cardUri && (
          <Image source={{ uri: cardUri }} style={styles.imagePreview} />
        )}

        <View style={styles.submitContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#4285f4" />
          ) : (
            <Button
              title="Crear Evento"
              onPress={handleSubmit}
              color="#4285f4"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topbar: {
    backgroundColor: "#8BD5FC",
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topbarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topbarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  subLabel: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#aaa",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: "70%",
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  submitContainer: {
    marginTop: 30,
    marginBottom: 60,
  },
});

export default CreateEventForm;
