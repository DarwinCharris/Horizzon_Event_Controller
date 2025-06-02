// components/SubsPerEvent.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { getSubsPerEvent } from "../service/service";

const screenWidth = Dimensions.get("window").width;
const COLORS = ["#e9791a", "#ff9a3e", "#ffe501", "#98662e"];

export default function SubsPerEvent() {
  const [data, setData] = useState([]);
  const [collapsedTracks, setCollapsedTracks] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getSubsPerEvent();
      if (res.success) {
        setData(res.data);
        const initialCollapsed = {};
        res.data.forEach((track) => {
          initialCollapsed[track.id] = false;
        });
        setCollapsedTracks(initialCollapsed);
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
    const newValue = !allCollapsed;
    const newState = {};
    data.forEach((track) => {
      newState[track.id] = newValue;
    });
    setCollapsedTracks(newState);
    setAllCollapsed(newValue);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Subscripciones por evento</Text>
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
          const hasEvents = events.length > 0;

          if (!hasEvents) return null;

          const color = COLORS[data.indexOf(track) % COLORS.length];
          const labels = events.map((e) => e.name);
          const values = events.map((e) => parseFloat(e.porcentaje));
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

              {!isCollapsed && (
                <ScrollView horizontal>
                  <BarChart
                    data={{
                      labels,
                      datasets: [{ data: values }],
                    }}
                    width={Math.max(events.length * 80, screenWidth - 40)}
                    height={260}
                    yAxisSuffix="%"
                    fromZero
                    maxValue={100}
                    showValuesOnTopOfBars
                    chartConfig={{
                      backgroundColor: "#fff",
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      decimalPlaces: 0,
                      color: () => color,
                      labelColor: () => "#333",
                    }}
                    verticalLabelRotation={60}
                    style={{ borderRadius: 8 }}
                  />
                </ScrollView>
              )}
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
});
