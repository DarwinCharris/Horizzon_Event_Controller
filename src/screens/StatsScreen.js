// StatsScreen.js
import React from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import SubsPerEvent from "../components/SubsPerEvent";
import Stars from "../components/Stars";

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Estadísticas</Text>
        <SubsPerEvent />
        <Stars />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
});
