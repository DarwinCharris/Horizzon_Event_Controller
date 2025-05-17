import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const startTime = Date.now();
      
      const response = await fetch('https://horizzon-backend.onrender.com/full-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }

      const data = await response.json();
      
      const processedEvents = data.map(event => ({
        ...event,
        formattedStartDate: formatDate(event.initial_date),
        formattedEndDate: formatDate(event.final_date),
        trackName: event.event_track_name || 'Sin categoría'
      }));

      setEvents(processedEvents);
      console.log(`Datos cargados en ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no definida';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const loadData = async () => {
      await fetchEvents();
    };
    loadData();
  }, [fetchEvents]);

  const renderEventItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { 
        eventId: item.id,
        eventData: item 
      })}
    >
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTrack} numberOfLines={1}>{item.trackName}</Text>
          <Text style={styles.eventDate} numberOfLines={1}>
            {item.formattedStartDate} - {item.formattedEndDate}
          </Text>
        </View>
        <View style={styles.eventFooter}>
          <Text style={styles.eventLocation} numberOfLines={1}>📍 {item.location || 'Ubicación no definida'}</Text>
          <Text style={[
            styles.eventSeats,
            item.available_seats < 10 && { color: '#FF5252' }
          ]}>
            {item.available_seats || 0} asientos
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  if (loading && events.length === 0) {
    return (
      <View style={[styles.loadingContainer, { marginTop: 0 }]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Cargando eventos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { marginTop: 0 }]}>
        <Text style={styles.errorText}>Error al cargar los eventos</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { marginBottom: 0 }]}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 20 }]}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
            progressViewOffset={90} // Ajustado para el TopNavBar
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchEvents}>
              <Text style={styles.refreshButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#6200ee',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#FF5252',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
    paddingTop: 10, // Añadido espacio superior
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventMeta: {
    marginBottom: 12,
  },
  eventTrack: {
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    color: '#666',
    fontSize: 14,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLocation: {
    color: '#666',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  eventSeats: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});