// components/Stars.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getAvgStars } from "../service/service";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Stars() {
  const [data, setData] = useState([]);
  const [collapsedTracks, setCollapsedTracks] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const res = await getAvgStars();
      if (res.success) {
        setData(res.data);
        const initial = {};
        res.data.forEach((track) => (initial[track.id] = false));
        setCollapsedTracks(initial);
      }
    };
    load();
  }, []);

  const toggleTrack = (trackId) => {
    setCollapsedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const toggleAll = () => {
    const next = !allCollapsed;
    const updated = {};
    data.forEach((track) => {
      updated[track.id] = next;
    });
    setCollapsedTracks(updated);
    setAllCollapsed(next);
  };

  const renderStars = (avg) => {
    const stars = [];
    const full = Math.floor(avg);
    const half = avg - full >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <FontAwesome key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i === full && half) {
        stars.push(
          <FontAwesome
            key={i}
            name="star-half-full"
            size={16}
            color="#FFD700"
          />
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={16} color="#FFD700" />
        );
      }
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Rating por evento</Text>
        <TouchableOpacity onPress={toggleAll}>
          <Ionicons
            name={allCollapsed ? "eye-outline" : "eye-off-outline"}
            size={26}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {!allCollapsed &&
        data.map((track) => {
          const events = track.events;
          if (events.length === 0) return null;

          const isCollapsed = collapsedTracks[track.id];

          return (
            <View key={track.id} style={styles.trackContainer}>
              <View style={styles.trackHeaderRow}>
                <Text style={styles.trackTitle}>{track.name}</Text>
                <TouchableOpacity onPress={() => toggleTrack(track.id)}>
                  <Ionicons
                    name={
                      isCollapsed
                        ? "chevron-forward-outline"
                        : "chevron-down-outline"
                    }
                    size={22}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>

              {!isCollapsed &&
                events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.ratingContainer}
                    onPress={() =>
                      navigation.navigate("Feedbacks", {
                        eventId: event.id,
                        eventName: event.name,
                      })
                    }
                  >
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <View style={styles.starRow}>
                      {renderStars(event.avg_stars || 0)}
                      <Text style={styles.label}>
                        {event.avg_stars !== null
                          ? ` ${event.avg_stars.toFixed(1)}`
                          : " Sin calificaciones"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  trackContainer: {
    marginBottom: 32,
  },
  trackHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
});
