import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function newRoom(username) {
  const rooms = collection(db, "rooms");
  const newRoom = doc(rooms);
  await setDoc(newRoom, {
    peerOne: `${username[0].toUpperCase()}${username.slice(1)}`,
  });
  return newRoom.id;
}

export function addToRoom(username, roomId) {
  console.log(username);
  console.log(roomId);
}
