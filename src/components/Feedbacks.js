import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFeedbacksByEventId } from "../service/service";
import Feedback from "./Feedback";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, eventName } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      const res = await getFeedbacksByEventId(eventId);
      if (res.success) setFeedbacks(res.data);
    };
    fetchData();
  }, [eventId]);

  return (
    <>
      {/* Fuerza el color del área de la barra de estado */}
      <StatusBar backgroundColor="#8bd5fc" barStyle="dark-content" />

      {/* Área superior azul completa */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{eventName || "Evento"}</Text>
        </View>
      </SafeAreaView>

      {/* Contenido */}
      <SafeAreaView style={styles.safeContent}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {feedbacks.length === 0 ? (
            <Text style={styles.empty}>No hay feedbacks para este evento.</Text>
          ) : (
            feedbacks.map((fb) => <Feedback key={fb.id} data={fb} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    backgroundColor: "#8bd5fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#8bd5fc",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 12,
    color: "#333",
    flexShrink: 1,
  },
  safeContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 16,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontStyle: "italic",
  },
});
