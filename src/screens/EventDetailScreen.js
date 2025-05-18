import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventData } = route.params;

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
  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{eventData.name}</Text>
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
        </View>
      </ScrollView>
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
    paddingHorizontal: 50, // Aumentamos el padding horizontal
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    flex: 1,
    marginLeft: 30, // Añadimos margen izquierdo para la flecha
    marginRight: 20, // Y margen derecho para balancear
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
  speakerIconContainer: {
    backgroundColor: '#8bd5fc',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default EventDetailScreen;