// src/screens/AddEventScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  Text, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createEvent, getAllEventTracks } from '../service/service';
import { convertToBase64 } from '../service/image_converter';

const AddEventScreen = ({ navigation }) => {
  // Estado del formulario
  const [form, setForm] = useState({
    trackId: '',
    eventTrackName: '',
    name: '',
    description: '',
    longDescription: '',
    start: '',
    end: '',
    location: '',
    capacity: '',
    seats: '',
  });

  const [speakers, setSpeakers] = useState([{ name: '', title: '' }]);
  const [coverBase64, setCoverBase64] = useState(null);
  const [cardBase64, setCardBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventTracks, setEventTracks] = useState([]);
  const [coverUri, setCoverUri] = useState(null);
  const [cardUri, setCardUri] = useState(null);

  // Cargar líneas de eventos disponibles
  useEffect(() => {
    const loadEventTracks = async () => {
      try {
        const response = await getAllEventTracks();
        if (response.success) {
          setEventTracks(response.data);
        }
      } catch (error) {
        console.error('Error loading event tracks:', error);
      }
    };
    loadEventTracks();
  }, []);

  // Función para seleccionar imagen
  const pickImage = async (type) => {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      
      // Convertir a base64
      const base64 = await convertToBase64(uri);
      
      if (type === 'cover') {
        setCoverUri(uri);
        setCoverBase64(base64);
      } else {
        setCardUri(uri);
        setCardBase64(base64);
      }
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Manejar cambios en los speakers
  const handleSpeakerChange = (index, field, value) => {
    const updated = [...speakers];
    updated[index][field] = value;
    setSpeakers(updated);
  };

  // Agregar nuevo speaker
  const addSpeaker = () => {
    setSpeakers([...speakers, { name: '', title: '' }]);
  };

  // Enviar formulario
  const handleSubmit = async () => {
    // Validación
    if (!form.trackId || !form.name || !form.description || 
        !form.start || !form.end || !form.location || 
        !form.capacity || !form.seats || !coverBase64) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      const response = await createEvent({
        trackId: form.trackId,
        eventTrackName: form.eventTrackName || eventTracks.find(t => t.id === form.trackId)?.name || '',
        name: form.name,
        description: form.description,
        longDescription: form.longDescription,
        start: form.start,
        end: form.end,
        location: form.location,
        speakers: speakers,
        capacity: parseInt(form.capacity),
        seats: parseInt(form.seats),
        coverImageBase64: coverBase64,
        cardImageBase64: cardBase64 || coverBase64,
      });

      if (response.success) {
        Alert.alert('Éxito', 'Evento creado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.error || 'Error al crear el evento');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Hubo un problema al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Información Básica</Text>
      
      <Text style={styles.label}>Línea de Evento *</Text>
      <View style={styles.pickerContainer}>
        {eventTracks.map(track => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.trackOption,
              form.trackId === track.id && styles.selectedTrackOption
            ]}
            onPress={() => {
              handleChange('trackId', track.id);
              handleChange('eventTrackName', track.name);
            }}
          >
            <Text style={styles.trackOptionText}>{track.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Nombre del Evento *"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción corta *"
        value={form.description}
        onChangeText={(text) => handleChange('description', text)}
        style={styles.input}
        multiline
      />

      <TextInput
        placeholder="Descripción larga"
        value={form.longDescription}
        onChangeText={(text) => handleChange('longDescription', text)}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <Text style={styles.sectionTitle}>Fechas y Ubicación</Text>

      <TextInput
        placeholder="Fecha de Inicio (YYYY-MM-DD) *"
        value={form.start}
        onChangeText={(text) => handleChange('start', text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Fecha de Fin (YYYY-MM-DD) *"
        value={form.end}
        onChangeText={(text) => handleChange('end', text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Ubicación *"
        value={form.location}
        onChangeText={(text) => handleChange('location', text)}
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Capacidad</Text>

      <TextInput
        placeholder="Capacidad total *"
        value={form.capacity}
        onChangeText={(text) => handleChange('capacity', text)}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Asientos disponibles *"
        value={form.seats}
        onChangeText={(text) => handleChange('seats', text)}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Expositores</Text>

      {speakers.map((speaker, index) => (
        <View key={index} style={styles.speakerContainer}>
          <TextInput
            placeholder={`Nombre del expositor ${index + 1}`}
            value={speaker.name}
            onChangeText={(text) => handleSpeakerChange(index, 'name', text)}
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            placeholder={`Título ${index + 1}`}
            value={speaker.title}
            onChangeText={(text) => handleSpeakerChange(index, 'title', text)}
            style={[styles.input, { flex: 1 }]}
          />
        </View>
      ))}

      <Button title="Agregar expositor" onPress={addSpeaker} />

      <Text style={styles.sectionTitle}>Imágenes</Text>

      <Text style={styles.label}>Imagen de portada *</Text>
      <TouchableOpacity 
        style={styles.imagePickerButton} 
        onPress={() => pickImage('cover')}
      >
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color="#8bd5fc" />
            <Text>Seleccionar imagen de portada</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Imagen para tarjeta (opcional)</Text>
      <TouchableOpacity 
        style={styles.imagePickerButton} 
        onPress={() => pickImage('card')}
      >
        {cardUri ? (
          <Image source={{ uri: cardUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color="#8bd5fc" />
            <Text>Seleccionar imagen para tarjeta</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Crear Evento</Text>
        )}
      </TouchableOpacity>
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
    color: '#333',
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  trackOption: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: '#e6f6fe',
  },
  selectedTrackOption: {
    backgroundColor: '#8bd5fc',
  },
  trackOptionText: {
    color: '#0077b6',
  },
  speakerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  imagePickerButton: {
    height: 150,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: '#8bd5fc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddEventScreen;