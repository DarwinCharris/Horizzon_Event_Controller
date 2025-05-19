// CreateEventTrackForm.js
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import ImageUriPicker from "./uir";
import { createEventTrack } from "../../service/service";

const CreateEventTrackForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUri, setCoverUri] = useState(null);
  const [overlayUri, setOverlayUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!name || !description || !coverUri || !overlayUri) {
      Alert.alert("Campos requeridos", "Completa todos los campos e imágenes.");
      return;
    }

    try {
      setLoading(true);
      await createEventTrack(name, description, coverUri, overlayUri);
      Alert.alert("Éxito", "Evento creado correctamente");
      // Opcional: limpiar estado
      setName("");
      setDescription("");
      setCoverUri(null);
      setOverlayUri(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error al crear el evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del evento"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      <Text style={styles.label}>Selecciona imagen de portada:</Text>
      <ImageUriPicker onUriPicked={setCoverUri} />

      <Text style={styles.label}>Selecciona imagen de overlay:</Text>
      <ImageUriPicker onUriPicked={setOverlayUri} />

      <Button
        title={loading ? "Creando..." : "Crear Evento"}
        onPress={handleCreateEvent}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
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

export default CreateEventTrackForm;
