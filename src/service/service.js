import { convertToBase64 } from "../service/image_converter";
import axios from "axios";

const API_BASE = "https://horizzon-backend.onrender.com";
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función genérica para manejar errores
const handleRequest = async (requestFunc) => {
  try {
    const response = await requestFunc();
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response
      ? `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      : error.message;
    return { success: false, error: message };
  }
};

//---------------------------------------------------CREATE-----------------------------------
// Crear Event Track
export const createEventTrack = async (
  name,
  description,
  coverPath,
  overlayPath
) => {
  const data = {
    name,
    description,
    coverImageBase64: await convertToBase64(coverPath),
    overlayImageBase64: await convertToBase64(overlayPath),
  };

  return handleRequest(() => api.post("/event-track", data));
};

// Crear Evento
export const createEvent = async ({
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
}) => {
  const data = {
    eventTrackId: trackId,
    name,
    description,
    longDescription,
    speakers: JSON.stringify(speakers),
    initialDate: start,
    finalDate: end,
    location,
    capacity,
    availableSeats: seats,
    eventTrackName,
    coverImageBase64: await convertToBase64(coverPath),
    cardImageBase64: await convertToBase64(cardPath),
  };

  return handleRequest(() => api.post("/event", data));
};

// Enviar Feedback
export const enviarFeedback = async ({ userId, eventId, stars, comment }) => {
  const payload = {
    userId,
    eventId,
    stars,
    comment,
  };

  return handleRequest(() => api.post("/feedback", payload));
};

//-------------------------------------------------EDIT-------------------------------------
// Editar un Event Track
export const editEventTrack = async ({
  id,
  name,
  description,
  coverPath,
  overlayPath,
}) => {
  const body = { id };

  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  if (coverPath !== undefined)
    body.coverImageBase64 = await convertToBase64(coverPath);
  if (overlayPath !== undefined)
    body.overlayImageBase64 = await convertToBase64(overlayPath);

  return handleRequest(() => api.post("/event-track-edit", body));
};

// Editar un Evento
export const editEvent = async ({
  id,
  event_track_id,
  name,
  description,
  long_description,
  speakers,
  initial_date,
  final_date,
  location,
  capacity,
  available_seats,
  coverPath,
  cardPath,
  event_track_name,
}) => {
  const body = { id };

  if (event_track_id !== undefined) body.event_track_id = event_track_id;
  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  if (long_description !== undefined) body.long_description = long_description;
  if (speakers !== undefined) body.speakers = JSON.stringify(speakers);
  if (initial_date !== undefined) body.initial_date = initial_date;
  if (final_date !== undefined) body.final_date = final_date;
  if (location !== undefined) body.location = location;
  if (capacity !== undefined) body.capacity = capacity;
  if (available_seats !== undefined) body.available_seats = available_seats;
  if (event_track_name !== undefined) body.event_track_name = event_track_name;
  if (coverPath !== undefined)
    body.cover_image = await convertToBase64(coverPath);
  if (cardPath !== undefined) body.card_image = await convertToBase64(cardPath);

  return handleRequest(() => api.post("/event-edit", body));
};

//--------------------------------------------------DELETE-----------------------------------
// Eliminar un feedback por ID
export const deleteFeedback = (feedbackId) =>
  handleRequest(() => api.delete(`/delete-feedback/${feedbackId}`));

// Eliminar un evento por ID (incluye feedbacks asociados)
export const deleteEvent = (eventId) =>
  handleRequest(() => api.delete(`/delete-event/${eventId}`));

// Eliminar un event track por ID (incluye eventos y feedbacks asociados)
export const deleteEventTrack = (trackId) =>
  handleRequest(() => api.delete(`/delete-event-track/${trackId}`));

//-------------------------------------------------GET-------------------------------------
export const getAllEventTracks = () =>
  handleRequest(() => api.get("/all-event-tracks"));

export const getAllEvents = () => handleRequest(() => api.get("/all-events"));

export const getAllFeedbacks = () =>
  handleRequest(() => api.get("/all-feedbacks"));

export const getEventTrackById = (trackId) =>
  handleRequest(() => api.get(`/event-track-byid/${trackId}`));

export const getEventById = (eventId) =>
  handleRequest(() => api.get(`/event-byid/${eventId}`));

export const getFullData = () => handleRequest(() => api.get("/full-data"));
