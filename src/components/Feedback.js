// components/Feedback.js
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Feedback({ data }) {
  const renderStars = (stars) => {
    const full = Math.floor(stars);
    const half = stars - full >= 0.5;
    const icons = [];

    for (let i = 0; i < 5; i++) {
      if (i < full) {
        icons.push(
          <FontAwesome key={i} name="star" size={14} color="#FFD700" />
        );
      } else if (i === full && half) {
        icons.push(
          <FontAwesome
            key={i}
            name="star-half-full"
            size={14}
            color="#FFD700"
          />
        );
      } else {
        icons.push(
          <FontAwesome key={i} name="star-o" size={14} color="#FFD700" />
        );
      }
    }

    return icons;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Anónimo</Text>
      </View>
      <View style={styles.stars}>{renderStars(data.stars)}</View>
      {data.comment ? <Text style={styles.comment}>{data.comment}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  name: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    marginBottom: 6,
  },
  comment: {
    fontSize: 13,
    color: "#444",
  },
});
