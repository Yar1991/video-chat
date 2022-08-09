import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { useStore } from "./store";
import { v4 as newId } from "uuid";

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
  const userId = newId();
  const roomData = {
    users: {},
    status: "created",
  };
  roomData.users[userId] = {
    name: username,
  };
  await setDoc(newRoom, {
    ...roomData,
  });
  localStorage.setItem("peerId", `${userId}`);
  localStorage.setItem("peerName", `${username}`);
  return newRoom.id;
}

export async function addToRoom(username, roomId) {
  const room = doc(db, `rooms/${roomId}`);
  const roomData = await getDoc(room);
  if (!roomData.exists()) {
    return false;
  } else {
    const userId = newId();
    const peerTwo = Object.entries(roomData.data().users)[0];
    const roomDataUpdated = {
      status: "joined",
      joinedId: userId,
      users: {
        ...roomData.data().users,
      },
    };
    roomDataUpdated.users[userId] = {
      name: username,
    };
    await setDoc(room, {
      ...roomDataUpdated,
    });
    localStorage.setItem("peerId", `${userId}`);
    localStorage.setItem("peerName", `${username}`);
    localStorage.setItem("peerTwoId", `${peerTwo[0]}`);
    localStorage.setItem("peerTwoName", `${peerTwo[1].name}`);
  }
}

export async function removeFromRoom(roomId, peerId, peerTwoId) {
  const room = doc(db, `rooms/${roomId}`);
  const messages = collection(db, `rooms/${roomId}/messages`);
  const messagesData = await getDocs(messages);
  const roomData = await getDoc(room);
  if (Object.keys(roomData.data().users).length == 1) {
    messagesData.forEach(async (message) => {
      await deleteDoc(doc(db, `rooms/${roomId}/messages/${message.id}`));
    });
    await deleteDoc(room);
    return;
  }
  const peerTwoData = roomData.data().users[peerTwoId];
  const roomDataUpdated = {
    status: "left",
    joinedId: peerId,
    users: {},
  };
  roomDataUpdated.users[peerTwoId] = peerTwoData;
  await setDoc(room, {
    ...roomDataUpdated,
  });
}

export async function statusUpdate(roomId, peerId) {
  const chatState = useStore();
  const room = doc(db, `rooms/${roomId}`);
  return onSnapshot(room, async (doc) => {
    if (doc.data()?.status === "joined") {
      chatState.status = "joined";
      chatState.peerTwoData = {
        id: doc.data().joinedId,
        name: doc.data().users[doc.data().joinedId].name,
      };
    } else if (doc.data()?.status === "left") {
      chatState.status = "left";
      chatState.peerTwoData = {
        id: doc.data().joinedId,
      };
    } else {
      return;
    }
  });
}

export async function addMessage(roomId, message) {
  const messages = collection(db, `rooms/${roomId}/messages`);
  const newMessage = doc(messages);
  await setDoc(newMessage, {
    ...message,
  });
}

export function updateMessages(roomId) {
  const chatState = useStore();
  const messages = collection(db, `rooms/${roomId}/messages`);
  const messagesQuery = query(messages, orderBy("timestamp"));
  return onSnapshot(messagesQuery, async (snapshot) => {
    let updated = [];
    snapshot.forEach((doc) => {
      if (!updated.includes(doc.data())) updated.push(doc.data());
    });
    chatState.messages = [...updated];
  });
}
