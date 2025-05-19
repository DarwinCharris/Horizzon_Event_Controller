// ImageUriPicker.js
import { View, Button, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

const ImageUriPicker = ({ onUriPicked }) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log(uri); // Muestra la URI de la imagen seleccionada
      // Devuelve la URI al componente padre mediante una prop callback
      onUriPicked(uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Seleccionar Imagen" onPress={pickImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

export default ImageUriPicker;
