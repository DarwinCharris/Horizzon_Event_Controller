import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventData } = route.params;

  // Función para formatear fecha y hora
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

  // Función para renderizar expositores
  const renderSpeakers = () => {
    if (!eventData.speakers || eventData.speakers.length === 0) {
      return <Text style={styles.detailText}>No hay expositores registrados</Text>;
    }

    return eventData.speakers.map((speaker, index) => (
      <View key={index} style={styles.speakerContainer}>
        <Ionicons name="person" size={20} color="#6200ee" style={styles.speakerIcon} />
        <View>
          <Text style={styles.speakerName}>{speaker.name || 'Nombre no disponible'}</Text>
          <Text style={styles.speakerTitle}>{speaker.title || 'Título no disponible'}</Text>
        </View>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6200ee" />
        </TouchableOpacity>
        <Text style={styles.title}>{eventData.name}</Text>
      </View>

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
            <Ionicons name="calendar" size={20} color="#6200ee" style={styles.icon} />
            <Text style={styles.detailText}>
              {formatDateTime(eventData.initial_date)} - {formatDateTime(eventData.final_date)}
            </Text>
          </View>
        </View>

        {/* Sección de ubicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#6200ee" style={styles.icon} />
            <Text style={styles.detailText}>{eventData.location || 'Ubicación no especificada'}</Text>
          </View>
        </View>

        {/* Sección de capacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asistencia</Text>
          <View style={styles.detailRow}>
            <Ionicons name="people" size={20} color="#6200ee" style={styles.icon} />
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
            <Ionicons name="pricetag" size={20} color="#6200ee" style={styles.icon} />
            <Text style={styles.detailText}>{eventData.trackName || 'Sin categoría'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    flex: 1,
  },
  speakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  speakerIcon: {
    marginRight: 12,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  speakerTitle: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default EventDetailScreen;