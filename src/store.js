import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore("chatState", () => {
  const status = ref("");
  const peerTwoData = ref({});
  const peerConnection = ref(null);
  const openChat = ref(false);

  return { status, peerTwoData, peerConnection, openChat };
});
