import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createEvent } from '../service/service';

const CreateEventForm = ({ navigation, onEventCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    trackId: '',
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    coverImage: null,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setForm({ ...form, coverImage: result.assets[0] });
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.trackId) {
      Alert.alert('Error', 'Nombre y Línea de Evento son obligatorios');
      return;
    }

    const response = await createEvent({
      trackId: parseInt(form.trackId),
      name: form.name,
      description: form.description,
      start: form.start,
      end: form.end,
      coverPath: form.coverImage?.uri,
      // Campos adicionales con valores por defecto:
      speakers: [],
      capacity: 100,
      seats: 100,
      cardPath: form.coverImage?.uri, // Misma imagen para card
    });

    if (response.success) {
      Alert.alert('Éxito', 'Evento creado correctamente');
      onEventCreated(); // Actualiza HomeScreen
      navigation.goBack();
    } else {
      Alert.alert('Error', response.error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre del Evento*</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        multiline
        style={[styles.input, { height: 80 }]}
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      <Text style={styles.label}>ID de Línea de Evento*</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={form.trackId}
        onChangeText={(text) => setForm({ ...form, trackId: text })}
      />

      <Text style={styles.label}>Fecha de Inicio</Text>
      <TextInput
        style={styles.input}
        value={form.start}
        onChangeText={(text) => setForm({ ...form, start: text })}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Fecha de Fin</Text>
      <TextInput
        style={styles.input}
        value={form.end}
        onChangeText={(text) => setForm({ ...form, end: text })}
        placeholder="YYYY-MM-DD"
      />

      <Button title="Seleccionar Imagen" onPress={pickImage} />
      {form.coverImage && (
        <Text style={styles.imageText}>Imagen seleccionada ✔️</Text>
      )}

      <Button title="Crear Evento" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  imageText: {
    marginVertical: 10,
    textAlign: 'center',
    color: '#6200ee',
  },
});

export default CreateEventForm;