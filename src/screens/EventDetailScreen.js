import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { editEvent, getEventById, getAllFeedbacks, enviarFeedback } from '../service/service';
import DateTimePicker from '@react-native-community/datetimepicker';
import StarRating from '../components/StartRating';
import { getUserData } from '../service/auth';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventData: initialEventData } = route.params;
  const [eventData, setEventData] = useState(initialEventData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({...initialEventData});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [currentDateField, setCurrentDateField] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    comment: ''
  });
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    loadFeedbacks();
  });

  return unsubscribe;
}, [navigation]);

const loadFeedbacks = async () => {
  setIsLoadingFeedbacks(true);
  try {
    const response = await getAllFeedbacks();
    if (response.success) {
      // Filtrar por evento actual y ordenar por fecha (más nuevos primero)
      const eventFeedbacks = response.data
        .filter(fb => fb.event_id === eventData.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setFeedbacks(eventFeedbacks);
    }
  } catch (error) {
    console.error("Error al cargar feedbacks:", error);
  } finally {
    setIsLoadingFeedbacks(false);
  }
};

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({...eventData});
  };

const handleSave = async () => {
  setIsSaving(true);
  try {
    const dataToSend = {
      id: eventData.id,
      name: editData.name,
      description: editData.description,
      long_description: editData.long_description,
      initial_date: editData.initial_date,
      final_date: editData.final_date,
      location: editData.location,
      capacity: editData.capacity,
      available_seats: editData.available_seats,
      event_track_name: editData.event_track_name || eventData.event_track_name,
      speakers: typeof editData.speakers === 'string' ? 
                editData.speakers : 
                JSON.stringify(editData.speakers || [])
    };

    console.log("Datos a enviar:", JSON.stringify(dataToSend, null, 2)); // Debug

    const response = await editEvent(dataToSend);
    
    if (response.success) {
      alert("Evento actualizado correctamente");
      const updatedResponse = await getEventById(eventData.id);
      if (updatedResponse.success) {
        setEventData(updatedResponse.data);
        setEditData(updatedResponse.data);
      }
      setIsEditing(false);
    } else {
      console.error("Error del servidor:", response.error); // Debug
      alert(`Error del servidor: ${response.error}`);
    }
  } catch (error) {
    console.error("Error completo:", error.response?.data || error.message); // Debug
    alert(`Error: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsSaving(false);
  }
};

const handleSubmitFeedback = async () => {
  if (!newFeedback.comment.trim()) {
    alert('Por favor ingresa un comentario');
    return;
  }

  try {
    setIsSaving(true);
    
    const response = await enviarFeedback({
      eventId: eventData.id,
      stars: newFeedback.stars,
      comment: newFeedback.comment
    });

    if (response.success) {
      // Recargar feedbacks del backend
      await loadFeedbacks();
      alert('¡Gracias por tu feedback!');
      setShowFeedbackModal(false);
      setNewFeedback({ stars: 5, comment: '' });
    } else {
      alert(`Error al enviar feedback: ${response.error}`);
    }
  } catch (error) {
    console.error("Error al enviar feedback:", error);
    alert('Error al enviar feedback');
  } finally {
    setIsSaving(false);
  }
};

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No definido';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const renderSpeakers = () => {
    if (!eventData.speakers || eventData.speakers.length === 0) {
      return <Text style={styles.detailText}>No hay expositores registrados</Text>;
    }

    const speakers = typeof eventData.speakers === 'string' 
      ? JSON.parse(eventData.speakers) 
      : eventData.speakers;

    return speakers.map((speaker, index) => {
      const speakerName = typeof speaker === 'string' ? speaker : speaker?.name;
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
        <StarRating
          rating={feedback.stars}
          size={20}
          editable={false}
        />
        <Text style={styles.feedbackDate}>
          {new Date(feedback.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
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
        [currentDateField]: selectedDate.toISOString()
      });
    }
  };

  const openDatePicker = (field, mode = 'date') => {
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

            <View style={styles.editSection}>
              <Text style={styles.label}>Nombre del Evento</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) => setEditData({...editData, name: text})}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                value={editData.description}
                onChangeText={(text) => setEditData({...editData, description: text})}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Descripción Larga</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                value={editData.long_description}
                onChangeText={(text) => setEditData({...editData, long_description: text})}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Fecha y Hora de Inicio</Text>
              <Pressable
                style={styles.dateInput}
                onPress={() => openDatePicker('initial_date')}
              >
                <Text>{editData.initial_date ? formatDateTime(editData.initial_date) : 'Seleccionar fecha'}</Text>
              </Pressable>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Fecha y Hora de Finalización</Text>
              <Pressable
                style={styles.dateInput}
                onPress={() => openDatePicker('final_date')}
              >
                <Text>{editData.final_date ? formatDateTime(editData.final_date) : 'Seleccionar fecha'}</Text>
              </Pressable>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={editData.location}
                onChangeText={(text) => setEditData({...editData, location: text})}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Capacidad</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(editData.capacity)}
                onChangeText={(text) => setEditData({...editData, capacity: parseInt(text) || 0})}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Asientos Disponibles</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(editData.available_seats)}
                onChangeText={(text) => setEditData({...editData, available_seats: parseInt(text) || 0})}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
                onPress={!isSaving ? handleSave : null}
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

            <View style={styles.editSection}>
              <Text style={styles.label}>Calificación</Text>
              <StarRating
                rating={newFeedback.stars}
                onRate={(stars) => setNewFeedback({...newFeedback, stars})}
                size={30}
                editable={true}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.label}>Comentario</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                placeholder="Escribe tu opinión sobre el evento..."
                value={newFeedback.comment}
                onChangeText={(text) => setNewFeedback({...newFeedback, comment: text})}
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
                style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
                onPress={!isSaving ? handleSubmitFeedback : null}
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
      {/* Header con botón de regreso y edición */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>{eventData.name}</Text>
        <TouchableOpacity 
          onPress={handleEdit}
          style={styles.editButton}
          activeOpacity={0.7}
        >

        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Sección de información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Evento</Text>
            <Text style={styles.detailText}>{eventData.description || 'No hay descripción disponible'}</Text>
            
            {eventData.long_description && (
              <Text style={[styles.detailText, { marginTop: 10 }]}>
                {eventData.long_description}
              </Text>
            )}
          </View>

          {/* Sección de fecha y hora */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha y Hora</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>
                {formatDateTime(eventData.initial_date)} - {formatDateTime(eventData.final_date)}
              </Text>
            </View>
          </View>

          {/* Sección de ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>{eventData.location || 'Ubicación no especificada'}</Text>
            </View>
          </View>

          {/* Sección de capacidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asistencia</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>
                {eventData.available_seats} de {eventData.capacity} asientos disponibles
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { 
                  width: `${((eventData.capacity - eventData.available_seats) / eventData.capacity * 100)}%`,
                  backgroundColor: eventData.available_seats < 10 ? '#FF5252' : '#4CAF50'
                }
              ]} />
            </View>
          </View>

          {/* Sección de expositores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expositores</Text>
            {renderSpeakers()}
          </View>

          {/* Sección de categoría */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="pricetag" size={20} color="#fff" />
              </View>
              <Text style={styles.detailText}>{eventData.trackName || 'Sin categoría'}</Text>
            </View>
          </View>

         {/* Sección de feedbacks */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#8bd5fc',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 10,
    padding: 5,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    zIndex: 10,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    flex: 1,
    marginHorizontal: 30,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#8bd5fc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#8bd5fc',
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: '#8bd5fc',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    flex: 1,
  },
  speakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speakerName: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Estilos para el modal de edición
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  editSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8bd5fc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#8bd5fc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#8bd5fc',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
    sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#8bd5fc',
    paddingBottom: 5,
  },
  addButton: {
    padding: 5,
  },
feedbackContainer: {
  backgroundColor: '#f8f9fa',
  borderRadius: 10,
  padding: 15,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
feedbackHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
feedbackDate: {
  fontSize: 12,
  color: '#777',
  marginLeft: 10,
},
feedbackComment: {
  fontSize: 14,
  color: '#333',
  lineHeight: 20,
  marginTop: 5,
},
});

export default EventDetailScreen;