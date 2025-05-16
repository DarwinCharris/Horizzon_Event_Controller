// ImageUploader.js
import { View, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { convertToBase64 } from "../../service/image_converter";

//
const ImageUploader = () => {
  //Esta función va a hacer que subas a tu galería
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //Que tan detallada es
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled) {
      //Uri es lo que se va a mandar en el fetch como los parametro de la imagen
      const uri = result.assets[0].uri;
      //La función de service que convierte ese uri en un base64, en los códigos normales no haces esto sino mandar uri a los metodos de service
      const base64String = await convertToBase64(uri);
      //Prueba en consola que salió
      console.log(base64String.substring(0, 100));
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Subir Imagen" onPress={pickImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

export default ImageUploader;
