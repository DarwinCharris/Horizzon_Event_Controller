import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEventTrackById } from '../service/service';

export default function EventTrackDetailScreen({ route, navigation }) {
  const { trackId, trackName } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [trackInfo, setTrackInfo] = useState(null);

  const fetchTrackEvents = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      const response = await getEventTrackById(trackId);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      setTrackInfo(response.data.eventTrack);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error al cargar eventos del track:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trackId]);

  const onRefresh = useCallback(() => {
    fetchTrackEvents();
  }, [fetchTrackEvents]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTrackEvents();
    });

    fetchTrackEvents();

    return unsubscribe;
  }, [navigation, fetchTrackEvents]);

  const renderEventItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { 
        eventId: item.id,
        eventData: item 
      })}
      activeOpacity={0.8}
    >
      {item.coverImageBase64 ? (
        <Image 
          source={{ uri: `data:image/png;base64,${item.coverImageBase64}` }} 
          style={styles.eventImage}
        />
      ) : (
        <View style={[styles.eventImage, styles.eventImagePlaceholder]}>
          <Ionicons name="calendar" size={40} color="#8bd5fc" />
        </View>
      )}
      
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description || 'Sin descripción'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  if (loading && events.length === 0) {
    return (
      <View style={styles.fullScreenCenter}>
        <ActivityIndicator size="large" color="#8bd5fc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#FF5252" style={styles.errorIcon} />
        <Text style={styles.errorText}>Error al cargar los eventos</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTrackEvents}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* NavBar Superior */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8bd5fc" />
          <Text style={styles.navTitle}>{trackName}</Text>
        </TouchableOpacity>
      </View>

      {trackInfo && (
        <View style={styles.trackHeader}>
          {trackInfo.coverImageBase64 ? (
            <Image 
              source={{ uri: `data:image/png;base64,${trackInfo.coverImageBase64}` }} 
              style={styles.trackHeaderImage}
            />
          ) : (
            <View style={[styles.trackHeaderImage, styles.trackHeaderImagePlaceholder]}>
              <Ionicons name="list" size={48} color="#8bd5fc" />
            </View>
          )}
          <Text style={styles.trackHeaderDescription}>{trackInfo.description}</Text>
        </View>
      )}
      
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8bd5fc']}
            tintColor="#8bd5fc"
            progressBackgroundColor="#ffffff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={48} color="#8bd5fc" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No hay eventos en esta línea</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchTrackEvents}>
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
    backgroundColor: '#f8f9fa',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  trackHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  trackHeaderImage: {
    width: '100%',
    height: 180,
  },
  trackHeaderImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f6fe',
  },
  trackHeaderDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#8bd5fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f6fe',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    color: '#FF5252',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorDetail: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#8bd5fc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#8bd5fc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
    fontSize: 16,
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: '#8bd5fc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#8bd5fc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
});