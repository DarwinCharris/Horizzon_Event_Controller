// CreateEventForm.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
} from "react-native";
import ImageUriPicker from "./uir";
import { createEvent } from "../../service/service";

const CreateEventForm = () => {
  const [form, setForm] = useState({
    trackId: "",
    eventTrackName: "",
    name: "",
    description: "",
    longDescription: "",
    start: "",
    end: "",
    location: "",
    capacity: "",
    seats: "",
  });

  const [speakers, setSpeakers] = useState([""]);
  const [coverUri, setCoverUri] = useState(null);
  const [cardUri, setCardUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSpeakerChange = (index, value) => {
    const updated = [...speakers];
    updated[index] = value;
    setSpeakers(updated);
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, ""]);
  };

  const handleSubmit = async () => {
    const {
      trackId,
      eventTrackName,
      name,
      description,
      longDescription,
      start,
      end,
      location,
      capacity,
      seats,
    } = form;

    if (
      !trackId ||
      !eventTrackName ||
      !name ||
      !description ||
      !longDescription ||
      !start ||
      !end ||
      !location ||
      !capacity ||
      !seats ||
      !coverUri ||
      !cardUri
    ) {
      Alert.alert("Campos requeridos", "Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      await createEvent({
        trackId,
        eventTrackName,
        name,
        description,
        longDescription,
        start,
        end,
        location,
        speakers,
        capacity: parseInt(capacity),
        seats: parseInt(seats),
        coverPath: coverUri,
        cardPath: cardUri,
      });
      Alert.alert("Éxito", "Evento creado correctamente");
      // Reiniciar formulario
      setForm({
        trackId: "",
        eventTrackName: "",
        name: "",
        description: "",
        longDescription: "",
        start: "",
        end: "",
        location: "",
        capacity: "",
        seats: "",
      });
      setSpeakers([""]);
      setCoverUri(null);
      setCardUri(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al crear el evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {[
        ["trackId", "ID del Track"],
        ["eventTrackName", "Nombre del Track"],
        ["name", "Nombre del Evento"],
        ["description", "Descripción"],
        ["longDescription", "Descripción Larga"],
        ["start", "Fecha Inicio (YYYY-MM-DD)"],
        ["end", "Fecha Fin (YYYY-MM-DD)"],
        ["location", "Ubicación"],
        ["capacity", "Capacidad"],
        ["seats", "Asientos disponibles"],
      ].map(([key, placeholder]) => (
        <TextInput
          key={key}
          placeholder={placeholder}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
          style={styles.input}
        />
      ))}

      <Text style={styles.label}>Speakers:</Text>
      {speakers.map((speaker, index) => (
        <TextInput
          key={index}
          placeholder={`Speaker ${index + 1}`}
          value={speaker}
          onChangeText={(text) => handleSpeakerChange(index, text)}
          style={styles.input}
        />
      ))}
      <Button title="Agregar otro speaker" onPress={addSpeaker} />

      <Text style={styles.label}>Selecciona imagen de portada:</Text>
      <ImageUriPicker onUriPicked={setCoverUri} />

      <Text style={styles.label}>Selecciona imagen para tarjeta:</Text>
      <ImageUriPicker onUriPicked={setCardUri} />

      <Button
        title={loading ? "Creando..." : "Crear Evento"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
});

export default CreateEventForm;
