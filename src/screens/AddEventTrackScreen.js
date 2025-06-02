import React, { useState, useCallback } from 'react';
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
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { createEventTrack } from '../service/service';

export default function AddEventTrackScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    description: ''
  });
  const [coverUri, setCoverUri] = useState(null);
  const [overlayUri, setOverlayUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  // Función mejorada para convertir a base64
  const convertToBase64 = async (uri) => {
    if (!uri) {
      throw new Error('URI de imagen no válida');
    }

    // Asegurar que el URI tenga el formato correcto
    let adjustedUri = uri;
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      adjustedUri = `file://${uri}`;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(adjustedUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo de imagen no existe');
      }

      const base64 = await FileSystem.readAsStringAsync(adjustedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error en convertToBase64:', error);
      throw new Error('Error al procesar la imagen: ' + error.message);
    }
  };

  // Función optimizada para seleccionar imagen
  const pickImage = useCallback(async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        if (type === 'cover') {
          setCoverUri(uri);
        } else {
          setOverlayUri(uri);
        }
      }
    } catch (error) {
      console.error('Error en pickImage:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!coverUri) {
      Alert.alert('Error', 'La imagen de portada es requerida');
      return;
    }

    try {
      setLoading(true);
      setConverting(true);

      // Convertir imágenes
      let coverBase64, overlayBase64;
      try {
        coverBase64 = await convertToBase64(coverUri);
        overlayBase64 = overlayUri ? await convertToBase64(overlayUri) : null;
      } catch (error) {
        throw new Error('Error al procesar imágenes: ' + error.message);
      } finally {
        setConverting(false);
      }

      // Crear la línea de eventos
      const response = await createEventTrack(
        form.name,
        form.description,
        coverBase64,
        overlayBase64
      );

      if (response.success) {
        Alert.alert('Éxito', 'Línea de eventos creada', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.error || 'Error al crear la línea');
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [form.name, form.description, coverUri, overlayUri, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Línea de Eventos</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre de la línea *</Text>
          <TextInput
            placeholder="Ej: Congreso Tecnológico 2023"
            value={form.name}
            onChangeText={(text) => setForm({...form, name: text})}
            style={styles.input}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            placeholder="Describe esta línea de eventos"
            value={form.description}
            onChangeText={(text) => setForm({...form, description: text})}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Imagen de portada *</Text>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={() => pickImage('cover')}
          >
            {coverUri ? (
              <Image 
                source={{ uri: coverUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={32} color="#8bd5fc" />
                <Text style={styles.imagePlaceholderText}>Agregar imagen principal</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Imagen secundaria (opcional)</Text>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={() => pickImage('overlay')}
          >
            {overlayUri ? (
              <Image 
                source={{ uri: overlayUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={32} color="#8bd5fc" />
                <Text style={styles.imagePlaceholderText}>Agregar imagen secundaria</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.submitButton, 
              (loading || converting) && styles.disabledButton
            ]} 
            onPress={handleSubmit}
            disabled={loading || converting}
          >
            {loading || converting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Crear Línea de Eventos</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f6fe',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#8bd5fc',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#8bd5fc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});