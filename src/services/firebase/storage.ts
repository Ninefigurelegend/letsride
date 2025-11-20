import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload profile photo to Firebase Storage
 * @param uri - Local file URI
 * @param userId - User ID for organizing storage
 * @returns Download URL of uploaded image
 */
export async function uploadProfilePhoto(
  uri: string,
  userId: string
): Promise<string> {
  try {
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const filename = `profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, `media/avatars/${userId}/${filename}`);

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Upload event image to Firebase Storage
 * @param uri - Local file URI
 * @param eventId - Event ID for organizing storage
 * @returns Download URL of uploaded image
 */
export async function uploadEventImage(
  uri: string,
  eventId: string
): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `event_${Date.now()}.jpg`;
    const storageRef = ref(storage, `media/events/${eventId}/${filename}`);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading event image:', error);
    throw error;
  }
}

/**
 * Upload chat media (image/video) to Firebase Storage
 * @param uri - Local file URI
 * @param chatId - Chat ID for organizing storage
 * @param messageId - Message ID for organizing storage
 * @param type - Media type (image or video)
 * @returns Download URL of uploaded media
 */
export async function uploadChatMedia(
  uri: string,
  chatId: string,
  messageId: string,
  type: 'image' | 'video'
): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const extension = type === 'video' ? 'mp4' : 'jpg';
    const filename = `${type}_${Date.now()}.${extension}`;
    const storageRef = ref(
      storage,
      `media/chats/${chatId}/${messageId}/${filename}`
    );

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading chat media:', error);
    throw error;
  }
}

