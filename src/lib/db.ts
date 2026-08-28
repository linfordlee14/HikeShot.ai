import { collection, doc, setDoc, getDoc, query, where, orderBy, getDocs, onSnapshot, serverTimestamp, Timestamp, addDoc } from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Hike {
  id: string;
  name: string;
  date: string;
  location: string;
  organizerName: string;
  createdAt: Timestamp | Date;
}

export interface Participant {
  id: string;
  hikeId: string;
  name: string;
  joinedAt: Timestamp | Date;
}

export interface Photo {
  id: string;
  hikeId: string;
  participantId: string;
  participantName: string;
  imageUrl: string;
  createdAt: Timestamp | Date;
}

// Generate random short ID for hikes (easier to share)
export const generateHikeId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createHike = async (hike: Omit<Hike, 'id' | 'createdAt'>) => {
  try {
    const id = generateHikeId();
    const hikeRef = doc(db, 'hikes', id);
    const newHike = {
      ...hike,
      id,
      createdAt: serverTimestamp()
    };
    await setDoc(hikeRef, newHike);
    return id;
  } catch (error: any) {
    console.error('Error creating hike:', error);
    if (error?.message?.includes('Failed to fetch') || error?.code === 'unavailable') {
      throw new Error('Could not connect to database. If you are using an ad-blocker (like Brave Shields or uBlock Origin), please disable it for this site and try again.');
    }
    throw error;
  }
};

export const getHike = async (id: string): Promise<Hike | null> => {
  const docRef = doc(db, 'hikes', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Hike;
  }
  return null;
};

export const joinHike = async (hikeId: string, participantName: string) => {
  const participantsRef = collection(db, 'participants');
  const newParticipant = {
    hikeId,
    name: participantName,
    joinedAt: serverTimestamp()
  };
  const docRef = await addDoc(participantsRef, newParticipant);
  return { id: docRef.id, ...newParticipant };
};

export const uploadPhoto = async (hikeId: string, participantId: string, participantName: string, base64DataUrl: string) => {
  try {
    // Add to Firestore directly to bypass Storage CORS/Rules for MVP
    const photosRef = collection(db, 'photos');
    const newPhoto = {
      hikeId,
      participantId,
      participantName,
      imageUrl: base64DataUrl,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(photosRef, newPhoto);
    return { id: docRef.id, ...newPhoto };
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    if (error?.message?.includes('Failed to fetch') || error?.code === 'unavailable') {
      throw new Error('Could not connect to database. If you are using an ad-blocker (like Brave Shields or uBlock Origin), please disable it for this site and try again.');
    }
    throw error;
  }
};

export const subscribeToPhotos = (hikeId: string, callback: (photos: Photo[]) => void) => {
  const q = query(
    collection(db, 'photos'),
    where('hikeId', '==', hikeId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const photos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Photo[];
    callback(photos);
  });
};

export const getHikePhotos = async (hikeId: string): Promise<Photo[]> => {
  const q = query(
    collection(db, 'photos'),
    where('hikeId', '==', hikeId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Photo[];
};
