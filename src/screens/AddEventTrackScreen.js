import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImageUriPicker from "../components/componente_de_prueba/uir";
import { createEventTrack } from "../service/service";

export default function AddEventTrackScreen({ navigation }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [coverUri, setCoverUri] = useState(null);
  const [overlayUri, setOverlayUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!form.name?.trim()) errors.name = "El nombre es requerido";
    if (!coverUri) errors.coverUri = "La imagen de portada es requerida";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await createEventTrack(
        form.name,
        form.description,
        coverUri,
        overlayUri
      );

      if (!response.success) {
        throw new Error(response.error || "Error al crear la línea de eventos");
      }

      Alert.alert("Éxito", "Línea de eventos creada", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error detallado:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Error al conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  }, [form.name, form.description, coverUri, overlayUri, navigation]);

  return (
    <>
      <StatusBar
        backgroundColor="#8BD5FC"
        barStyle="dark-content"
        translucent={false}
      />
      <SafeAreaView style={styles.statusBarBackground} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Línea de Eventos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre de la línea *</Text>
          <View>
            <TextInput
              placeholder="Ej: Congreso Tecnológico 2023"
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              style={[styles.input, formErrors.name && styles.inputError]}
            />
            {formErrors.name && (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            )}
          </View>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            placeholder="Describe esta línea de eventos"
            value={form.description}
            onChangeText={(text) => handleChange("description", text)}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Imagen de portada *</Text>
          <View style={styles.imagePickerContainer}>
            <ImageUriPicker onUriPicked={setCoverUri} currentUri={coverUri} />
            {coverUri && (
              <Image source={{ uri: coverUri }} style={styles.imagePreview} />
            )}
          </View>
          {formErrors.coverUri && (
            <Text style={styles.errorText}>{formErrors.coverUri}</Text>
          )}

          <Text style={styles.label}>Imagen secundaria (opcional)</Text>
          <View style={styles.imagePickerContainer}>
            <ImageUriPicker
              onUriPicked={setOverlayUri}
              currentUri={overlayUri}
            />
            {overlayUri && (
              <Image source={{ uri: overlayUri }} style={styles.imagePreview} />
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                Crear Línea de Eventos
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    backgroundColor: "#8BD5FC",
    height: Platform.OS === "ios" ? 44 : 0,
  },
  topbar: {
    backgroundColor: "#8BD5FC",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    marginBottom: 20,
  },
  inputError: {
    borderColor: "#ff4444",
    backgroundColor: "#fff9f9",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagePickerContainer: {
    marginBottom: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: {
    color: "#ff4444",
    marginTop: -15,
    marginBottom: 20,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#8bd5fc",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
