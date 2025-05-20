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
  ActivityIndicator,
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

  const [speakers, setSpeakers] = useState([""]); // Array de strings
  const [coverUri, setCoverUri] = useState(null);
  const [cardUri, setCardUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "trackId",
      "eventTrackName",
      "name",
      "description",
      "longDescription",
      "start",
      "end",
      "location",
      "capacity",
      "seats",
    ];

    requiredFields.forEach((field) => {
      if (!form[field]?.trim()) {
        errors[field] = "Este campo es requerido";
      }
    });

    if (isNaN(form.capacity) || form.capacity <= 0) {
      errors.capacity = "Capacidad debe ser número positivo";
    }

    if (isNaN(form.seats) || form.seats <= 0) {
      errors.seats = "Asientos debe ser número positivo";
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.start)) {
      errors.start = "Formato debe ser YYYY-MM-DD";
    }

    if (!dateRegex.test(form.end)) {
      errors.end = "Formato debe ser YYYY-MM-DD";
    }

    if (new Date(form.start) > new Date(form.end)) {
      errors.end = "Fecha fin no puede ser anterior a fecha inicio";
    }

    if (!coverUri) {
      errors.coverUri = "Imagen de portada requerida";
    }

    if (!cardUri) {
      errors.cardUri = "Imagen de tarjeta requerida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleSpeakerChange = (index, value) => {
    const updated = [...speakers];
    updated[index] = value;
    setSpeakers(updated);
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, ""]);
  };

  const removeSpeaker = (index) => {
    if (speakers.length > 1) {
      const updated = speakers.filter((_, i) => i !== index);
      setSpeakers(updated);
    }
  };

  const formatDateForAPI = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const eventData = {
        eventTrackId: form.trackId,
        eventTrackName: form.eventTrackName,
        name: form.name,
        description: form.description,
        longDescription: form.longDescription,
        initialDate: formatDateForAPI(form.start),
        finalDate: formatDateForAPI(form.end),
        location: form.location,
        capacity: parseInt(form.capacity),
        availableSeats: parseInt(form.seats),
        speakers: speakers.filter(name => name.trim() !== ""), // Filtramos nombres vacíos
        coverPath: coverUri,
        cardPath: cardUri,
      };

      console.log("Datos a enviar:", JSON.stringify(eventData, null, 2));

      const response = await createEvent(eventData);
      
      if (!response.success) {
        throw new Error(response.error || "Error al crear evento");
      }

      Alert.alert("Éxito", "Evento creado correctamente");
      resetForm();
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
  };

  const resetForm = () => {
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
    setSpeakers([""]); // Reset a array con un string vacío
    setCoverUri(null);
    setCardUri(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Información Básica</Text>
      
      {[
        ["trackId", "ID del Track (eventTrackId)", "text"],
        ["eventTrackName", "Nombre del Track", "text"],
        ["name", "Nombre del Evento*", "text"],
        ["description", "Descripción corta*", "text"],
        ["longDescription", "Descripción larga*", "text"],
      ].map(([key, placeholder]) => (
        <View key={key}>
          <TextInput
            placeholder={placeholder}
            value={form[key]}
            onChangeText={(text) => handleChange(key, text)}
            style={[
              styles.input,
              formErrors[key] && styles.inputError
            ]}
            multiline={key.includes('Description')}
          />
          {formErrors[key] && <Text style={styles.errorText}>{formErrors[key]}</Text>}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Fechas y Ubicación</Text>
      
      {[
        ["start", "Fecha inicio (YYYY-MM-DD)*", "text"],
        ["end", "Fecha fin (YYYY-MM-DD)*", "text"],
        ["location", "Ubicación*", "text"],
      ].map(([key, placeholder]) => (
        <View key={key}>
          <TextInput
            placeholder={placeholder}
            value={form[key]}
            onChangeText={(text) => handleChange(key, text)}
            style={[
              styles.input,
              formErrors[key] && styles.inputError
            ]}
          />
          {formErrors[key] && <Text style={styles.errorText}>{formErrors[key]}</Text>}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Capacidad</Text>
      
      {[
        ["capacity", "Capacidad total*", "numeric"],
        ["seats", "Asientos disponibles*", "numeric"],
      ].map(([key, placeholder]) => (
        <View key={key}>
          <TextInput
            placeholder={placeholder}
            value={form[key]}
            onChangeText={(text) => handleChange(key, text.replace(/[^0-9]/g, ''))}
            style={[
              styles.input,
              formErrors[key] && styles.inputError
            ]}
            keyboardType="numeric"
          />
          {formErrors[key] && <Text style={styles.errorText}>{formErrors[key]}</Text>}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Speakers</Text>
      {speakers.map((name, index) => (
        <View key={index} style={styles.speakerItem}>
          <View style={styles.speakerInputContainer}>
            <TextInput
              placeholder={`Nombre del speaker ${index + 1}`}
              value={name}
              onChangeText={(text) => handleSpeakerChange(index, text)}
              style={styles.speakerInput}
            />
          </View>
          {speakers.length > 1 && (
            <View style={styles.removeButton}>
              <Button
                title="Eliminar"
                onPress={() => removeSpeaker(index)}
                color="#ff4444"
              />
            </View>
          )}
        </View>
      ))}
      <View style={styles.addButton}>
        <Button
          title="Agregar otro speaker"
          onPress={addSpeaker}
          color="#4285f4"
        />
      </View>

      <Text style={styles.sectionTitle}>Imágenes</Text>
      
      <Text style={styles.label}>Portada del Evento*</Text>
      <ImageUriPicker 
        onUriPicked={setCoverUri} 
        currentUri={coverUri}
      />
      {formErrors.coverUri && <Text style={styles.errorText}>{formErrors.coverUri}</Text>}

      <Text style={styles.label}>Imagen de Tarjeta*</Text>
      <ImageUriPicker 
        onUriPicked={setCardUri} 
        currentUri={cardUri}
      />
      {formErrors.cardUri && <Text style={styles.errorText}>{formErrors.cardUri}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#4285f4" style={styles.loader} />
      ) : (
        <View style={styles.submitButton}>
          <Button
            title="Crear Evento"
            onPress={handleSubmit}
            color="#4285f4"
            disabled={loading}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#4285f4',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fff9f9',
  },
  errorText: {
    color: '#ff4444',
    marginTop: -10,
    marginBottom: 15,
    fontSize: 14,
  },
  speakerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  speakerInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  speakerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: 'white',
  },
  removeButton: {
    width: 90,
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#555',
  },
  submitButton: {
    marginTop: 30,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 30,
  },
});

export default CreateEventForm;