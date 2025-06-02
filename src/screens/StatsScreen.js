import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>
      <View style={styles.content}>
        <Text style={styles.text}>Pantalla de estadísticas</Text>
        <Text style={styles.text}>Contenido aquí...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 8,
  },
});