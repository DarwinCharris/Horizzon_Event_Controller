import { convertToBase64 } from "./image_converter";
import axios from "axios";

const API_BASE = "https://horizzon-backend.onrender.com"; // Reemplaza con tu URL real

//---------------------------------------------------CREATE-----------------------------------
export const createEventTrack = async (
  name,
  description,
  coverPath,
  overlayPath
) => {
  try {
    const coverBase64 = await convertToBase64(coverPath);
    const overlayBase64 = await convertToBase64(overlayPath);

    const data = {
      name,
      description,
      coverImageBase64: coverBase64,
      overlayImageBase64: overlayBase64,
    };

    const response = await axios.post(`${API_BASE}/event-track`, data);

    return {
      success: true,
      id: response.data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

export async function createEvent({
  trackId,
  eventTrackName,
  name,
  description,
  longDescription,
  start,
  end,
  location,
  speakers,
  capacity,
  seats,
  coverPath,
  cardPath,
}) {
  try {
    const coverBase64 = await convertToBase64(coverPath);
    const cardBase64 = await convertToBase64(cardPath);

    const data = {
      eventTrackId: trackId,
      name,
      description,
      longDescription,
      speakers: JSON.stringify(speakers),
      initialDate: start,
      finalDate: end,
      location: location,
      capacity,
      availableSeats: seats,
      eventTrackName,
      coverImageBase64: coverBase64,
      cardImageBase64: cardBase64,
    };

    const response = await fetch(`${API_BASE}/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: response.status + ": " + errorBody };
    }

    const responseData = await response.json();
    return { success: true, id: responseData.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function enviarFeedback({ userId, eventId, stars, comment }) {
  try {
    const payload = {
      userId,
      eventId,
      stars,
      comment,
    };

    const response = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: response.status + ": " + errorBody };
    }

    const responseData = await response.json();
    return { success: true, id: responseData.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

//-------------------------------------------------EDIT-------------------------------------

//--------------------------------------------------DELETE-----------------------------------
// Eliminar un feedback por ID
export async function deleteFeedback(feedbackId) {
  try {
    const response = await fetch(`${API_BASE}/delete-feedback/${feedbackId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: response.status + ": " + errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Eliminar un evento por ID (incluye feedbacks asociados)
export async function deleteEvent(eventId) {
  try {
    const response = await fetch(`${API_BASE}/delete-event/${eventId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: response.status + ": " + errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Eliminar un event track por ID (incluye eventos y feedbacks asociados)
export async function deleteEventTrack(trackId) {
  try {
    const response = await fetch(`${API_BASE}/delete-event-track/${trackId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: response.status + ": " + errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

//-------------------------------------------------GET-------------------------------------
// Obtener todos los event tracks
export async function getAllEventTracks() {
  try {
    const response = await fetch(`${API_BASE}/all-event-tracks`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener todos los eventos
export async function getAllEvents() {
  try {
    const response = await fetch(`${API_BASE}/all-events`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener todos los feedbacks
export async function getAllFeedbacks() {
  try {
    const response = await fetch(`${API_BASE}/all-feedbacks`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener un event track por ID (con eventos y feedbacks)
export async function getEventTrackById(trackId) {
  try {
    const response = await fetch(`${API_BASE}/event-track-byid/${trackId}`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener un evento por ID (con feedbacks)
export async function getEventById(eventId) {
  try {
    const response = await fetch(`${API_BASE}/event-byid/${eventId}`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener todos los datos completos (event tracks, eventos, feedbacks)
export async function getFullData() {
  try {
    const response = await fetch(`${API_BASE}/full-data`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
