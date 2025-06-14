import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  Image,
  ScrollView,
} from "react-native";
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

      // Limpiar formulario
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre del evento:</Text>
      <TextInput
        placeholder="Nombre del evento"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Descripción:</Text>
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      <Text style={styles.label}>Selecciona imagen de portada:</Text>
      <ImageUriPicker onUriPicked={setCoverUri} />
      {coverUri && (
        <Image source={{ uri: coverUri }} style={styles.imagePreview} />
      )}

      <Text style={styles.label}>Selecciona imagen secundaria (overlay):</Text>
      <ImageUriPicker onUriPicked={setOverlayUri} />
      {overlayUri && (
        <Image source={{ uri: overlayUri }} style={styles.imagePreview} />
      )}

      <View style={styles.submitContainer}>
        <Button
          title={loading ? "Creando..." : "Crear Evento"}
          onPress={handleCreateEvent}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
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
    fontSize: 14,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  submitContainer: {
    marginTop: 20,
  },
});

export default CreateEventTrackForm;
