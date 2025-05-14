import RNFS from "react-native-fs";
import * as mime from "react-native-mime-types"; // Opcional para detectar tipo MIME

export const convertToBase64 = async (uri) => {
  try {
    const base64String = await RNFS.readFile(uri, "base64");

    // Detectar tipo MIME (si no lo sabes puedes fijarlo a mano como 'image/jpeg')
    const mimeType = mime.lookup(uri) || "image/jpeg";

    // Agregar encabezado
    const base64WithHeader = `data:${mimeType};base64,${base64String}`;
    return base64WithHeader;
  } catch (error) {
    console.error("Error al convertir a base64:", error);
    throw error;
  }
};
