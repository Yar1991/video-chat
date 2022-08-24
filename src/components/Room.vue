<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue"
import router from "../router";
import { statusUpdate, removeFromRoom } from "../firebase";
import { useStore } from "../store";
import { Peer } from "peerjs";
import Chat from "./Chat.vue";


const chatState = useStore();
const roomId = ref(router.currentRoute.value.params.roomId);

const peerOneVideoElement = ref(null);
const peerTwoVideoElement = ref(null);
const peerOneStream = ref(null);
const peerTwoStream = ref(null);

const peerOneName = ref("");
const peerTwoName = ref("");

const controlBtns = ref(null);
const micOn = ref(true);
const cameraOn = ref(true);
const copyModalOpen = ref(false);


const connectionConstraints = {
  video: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
  audio: true
}

async function initConnection() {
  chatState.peerConnection = new Peer(localStorage.getItem("peerId"));
  peerOneStream.value = await navigator.mediaDevices.getUserMedia(connectionConstraints);
  peerOneVideoElement.value.srcObject = peerOneStream.value;
}

function callPeer(peerId) {
  const call = chatState.peerConnection.call(peerId, peerOneStream.value);
  call.on("stream", (remoteStream) => {
    peerTwoStream.value = remoteStream;
    peerOneVideoElement.value.srcObject = remoteStream;
    peerTwoVideoElement.value.srcObject = peerOneStream.value;
  })
}


function cameraControl() {
  cameraOn.value = !cameraOn.value;
  const videoTrack = peerOneStream.value.getTracks().find(track => track.kind === "video");

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
  } else {
    videoTrack.enabled = true
  }
}

function micControl() {
  micOn.value = !micOn.value;
  const audioTrack = peerOneStream.value.getTracks().find(track => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
  } else {
    audioTrack.enabled = true
  }
}

function toggleChat() {
  if (chatState.openChat) {
    chatState.openChat = false;
  } else {
    chatState.openChat = true;
  }
}

function endCall() {
  removeFromRoom(roomId.value, localStorage.getItem("peerId"), localStorage.getItem("peerTwoId"));
  chatState.peerConnection.destroy();
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(mediaStream => {
      const stream = mediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    });
  router.push({ name: "Lobby" });
  localStorage.clear();
}

function toggleControls() {
  const targetBtns = [...controlBtns.value.children];
  const toggleBtn = targetBtns.pop();
  targetBtns.forEach(btn => {
    if (btn.classList.contains("toggle")) {
      btn.classList.remove("toggle");
      toggleBtn.classList.add("flip");
    } else {
      btn.classList.add("toggle");
      toggleBtn.classList.remove("flip");
    }
  });
}

async function copyRoomId() {
  navigator.clipboard.writeText(roomId.value);
  copyModalOpen.value = true;
  setTimeout(() => {
    copyModalOpen.value = false;
  }, 1500);
}

const statusWatcher = watch(() => chatState.status, () => {
  if (chatState.status === "joined" && localStorage.getItem("peerId") !== chatState.peerTwoData.id) {
    localStorage.setItem("peerTwoName", chatState.peerTwoData.name);
    localStorage.setItem("peerTwoId", chatState.peerTwoData.id);
    peerTwoName.value = chatState.peerTwoData.name;
    setTimeout(() => {
      callPeer(chatState.peerTwoData.id);
    }, 1000)
  } else if (chatState.status === "joined" && localStorage.getItem("peerId") === chatState.peerTwoData.id) {
    peerTwoName.value = localStorage.getItem("peerTwoName");
  } else if (chatState.status === "left" && localStorage.getItem("peerId") !== chatState.peerTwoData.id) {
    peerOneVideoElement.value.srcObject = peerOneStream.value;
    peerTwoName.value = "";
    peerTwoStream.value = null;
    localStorage.removeItem("peerTwoId");
    localStorage.removeItem("peerTwoName");
  } else {
    return;
  }
});


onMounted(async () => {
  await initConnection();
  if (localStorage.getItem("peerTwoId")) callPeer(localStorage.getItem("peerTwoId"));
  statusUpdate(roomId.value, localStorage.getItem("peerId"));
  peerOneName.value = localStorage.getItem("peerName");
  peerTwoName.value = localStorage.getItem("peerTwoName");
  chatState.peerConnection.on("call", (call) => {
    call.answer(peerOneStream.value);
    call.on("stream", (remoteStream) => {
      peerTwoStream.value = remoteStream;
      peerOneVideoElement.value.srcObject = remoteStream;
      peerTwoVideoElement.value.srcObject = peerOneStream.value;
    })
  })
  chatState.peerConnection.on("error", (err) => {
    if (err.type === "peer-unavailable") {
      peerTwoName.value = "";
      removeFromRoom(roomId.value, localStorage.getItem("peerTwoId"), localStorage.getItem("peerId"));
    } else {
      console.log(err);
    }
  });
})

onUnmounted(() => {
  statusWatcher();
})
</script>

<template>
  <section id="room-section">
    <div :class="copyModalOpen ? 'copied-modal active' : 'copied-modal'">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.5C14.7848 1.5 17.4555 2.60625 19.4246 4.57538C21.3938 6.54451 22.5 9.21523 22.5 12C22.5 14.7848 21.3938 17.4555 19.4246 19.4246C17.4555 21.3938 14.7848 22.5 12 22.5C9.21523 22.5 6.54451 21.3938 4.57538 19.4246C2.60625 17.4555 1.5 14.7848 1.5 12C1.5 9.21523 2.60625 6.54451 4.57538 4.57538C6.54451 2.60625 9.21523 1.5 12 1.5V1.5ZM10.692 14.0715L8.3595 11.7375C8.27588 11.6539 8.17661 11.5876 8.06736 11.5423C7.9581 11.497 7.84101 11.4737 7.72275 11.4737C7.60449 11.4737 7.4874 11.497 7.37814 11.5423C7.26889 11.5876 7.16962 11.6539 7.086 11.7375C6.91712 11.9064 6.82225 12.1354 6.82225 12.3743C6.82225 12.6131 6.91712 12.8421 7.086 13.011L10.056 15.981C10.1394 16.065 10.2386 16.1317 10.3479 16.1773C10.4571 16.2228 10.5744 16.2462 10.6927 16.2462C10.8111 16.2462 10.9284 16.2228 11.0376 16.1773C11.1469 16.1317 11.2461 16.065 11.3295 15.981L17.4795 9.8295C17.5642 9.74623 17.6316 9.647 17.6778 9.53755C17.724 9.42809 17.7481 9.31057 17.7487 9.19177C17.7492 9.07297 17.7262 8.95523 17.6811 8.84535C17.6359 8.73547 17.5694 8.63562 17.4854 8.55156C17.4015 8.46751 17.3017 8.4009 17.1919 8.3556C17.0821 8.31029 16.9644 8.28718 16.8455 8.28759C16.7267 8.288 16.6092 8.31193 16.4997 8.358C16.3902 8.40407 16.2909 8.47136 16.2075 8.556L10.692 14.0715Z" />
        </svg>
      </div>
      <p>room id copied to the clipboard</p>
    </div>
    <div class="videos">
      <div class="video-box one">
        <video ref="peerOneVideoElement" class="peer-one" autoplay playsinline></video>
        <span v-if="!chatState.isMobile">{{ !peerTwoStream ? peerOneName : peerTwoName }}</span>
      </div>
      <div v-if="peerTwoName" class="video-box two">
        <video ref="peerTwoVideoElement" class="peer-two" autoplay playsinline></video>
        <span v-if="peerTwoStream && !chatState.isMobile">{{ peerTwoStream && peerOneName }}</span>
      </div>
      <div ref="controlBtns" class="controls">
        <button :class="chatState.isMobile ? 'camera-btn toggle' : 'camera-btn'" @click="cameraControl"
          title="camera control">
          <svg v-if="cameraOn" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M0 5C0 4.46957 0.210714 3.96086 0.585786 3.58579C0.960859 3.21071 1.46957 3 2 3H9.5C9.98509 2.99994 10.4537 3.17619 10.8185 3.49593C11.1833 3.81566 11.4195 4.25709 11.483 4.738L14.593 3.356C14.7452 3.28817 14.912 3.25946 15.0781 3.27249C15.2443 3.28551 15.4045 3.33985 15.5443 3.43056C15.6841 3.52128 15.7991 3.6455 15.8786 3.79192C15.9582 3.93835 15.9999 4.10235 16 4.269V11.731C15.9999 11.8975 15.9581 12.0614 15.8786 12.2077C15.7991 12.354 15.6843 12.4781 15.5446 12.5688C15.4049 12.6595 15.2448 12.7139 15.0788 12.727C14.9128 12.7401 14.7462 12.7116 14.594 12.644L11.483 11.262C11.4195 11.7429 11.1833 12.1843 10.8185 12.5041C10.4537 12.8238 9.98509 13.0001 9.5 13H2C1.46957 13 0.960859 12.7893 0.585786 12.4142C0.210714 12.0391 0 11.5304 0 11V5Z"
              fill="black" />
          </svg>
          <svg v-else viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M10.961 12.365C11.2462 12.0611 11.4288 11.6753 11.483 11.262L14.593 12.644C14.7452 12.7119 14.912 12.7406 15.0781 12.7275C15.2443 12.7145 15.4045 12.6602 15.5443 12.5695C15.6841 12.4787 15.7991 12.3545 15.8786 12.2081C15.9582 12.0617 15.9999 11.8977 16 11.731V4.26902C15.9999 4.1025 15.9581 3.93865 15.8786 3.79234C15.7991 3.64603 15.6843 3.5219 15.5446 3.43121C15.4049 3.34052 15.2448 3.28614 15.0788 3.27301C14.9128 3.25988 14.7462 3.28841 14.594 3.35602L11.483 4.73802C11.4195 4.25711 11.1833 3.81568 10.8185 3.49595C10.4537 3.17621 9.98509 2.99996 9.5 3.00002H4.272L10.962 12.365H10.961ZM0.847 3.36502C0.585222 3.54982 0.371653 3.79478 0.224258 4.07931C0.0768632 4.36383 -4.60143e-05 4.67959 2.06539e-08 5.00002V11C2.06539e-08 11.5305 0.210714 12.0392 0.585786 12.4142C0.960859 12.7893 1.46957 13 2 13H7.728L0.847 3.36602V3.36502ZM10.593 15.29L0.593 1.29002L1.407 0.710022L11.407 14.71L10.593 15.29Z"
              fill="black" />
          </svg>
        </button>
        <button :class="chatState.isMobile ? 'mic-btn toggle' : 'mic-btn'" @click="micControl"
          title="microphone control">
          <svg v-if="micOn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 16C14.206 16 16 14.206 16 12V6C16 3.783 14.215 1.979 12.021 1.979C11.9506 1.97943 11.8805 1.98781 11.812 2.004C10.7853 2.05378 9.81693 2.49636 9.10738 3.24016C8.39783 3.98395 8.00136 4.97205 8 6V12C8 14.206 9.794 16 12 16Z"
              fill="black" />
            <path
              d="M11 19.931V22H13V19.931C16.939 19.436 20 16.073 20 12H18C18 15.309 15.309 18 12 18C8.691 18 6 15.309 6 12H4C4 16.072 7.061 19.436 11 19.931Z"
              fill="black" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21.707 20.293L18.307 16.893C19.4029 15.4974 19.999 13.7745 20 12H18C17.999 13.2443 17.6076 14.4569 16.881 15.467L15.432 14.017C15.8006 13.4085 15.9969 12.7114 16 12V6C16 3.783 14.215 1.979 12.021 1.979C11.951 1.979 11.881 1.988 11.812 2.004C10.7852 2.05378 9.81693 2.49636 9.10738 3.24016C8.39783 3.98395 8.00136 4.97205 8 6V6.586L3.707 2.293L2.293 3.707L20.293 21.707L21.707 20.293ZM6 12H4C4 16.072 7.06 19.436 11 19.931V22H13V19.931C13.7739 19.8323 14.529 19.62 15.241 19.301L13.692 17.753C13.1427 17.9159 12.5729 17.9991 12 18C8.691 18 6 15.309 6 12Z"
              fill="black" />
            <path
              d="M8.00699 12.067C8.02498 13.1026 8.44438 14.0908 9.17679 14.8232C9.90919 15.5556 10.8974 15.975 11.933 15.993L8.00699 12.067Z"
              fill="black" />
          </svg>

        </button>
        <button :class="chatState.isMobile ? 'copy-btn toggle' : 'copy-btn'" @click="copyRoomId" title="copy room id">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.085 3C7.18844 2.70742 7.38008 2.45413 7.63351 2.27503C7.88694 2.09593 8.18967 1.99984 8.5 2H11.5C11.8103 1.99984 12.1131 2.09593 12.3665 2.27503C12.6199 2.45413 12.8116 2.70742 12.915 3H14.5C14.8978 3 15.2794 3.15804 15.5607 3.43934C15.842 3.72064 16 4.10218 16 4.5V9.207C14.8716 8.88666 13.6704 8.93544 12.5717 9.34623C11.4731 9.75702 10.5345 10.5083 9.89308 11.4903C9.25167 12.4724 8.94102 13.6338 9.00649 14.8049C9.07196 15.976 9.51013 17.0956 10.257 18H5.5C5.10218 18 4.72064 17.842 4.43934 17.5607C4.15804 17.2794 4 16.8978 4 16.5V4.5C4 4.10218 4.15804 3.72064 4.43934 3.43934C4.72064 3.15804 5.10218 3 5.5 3H7.085ZM8.5 3C8.36739 3 8.24021 3.05268 8.14645 3.14645C8.05268 3.24022 8 3.36739 8 3.5C8 3.63261 8.05268 3.75979 8.14645 3.85355C8.24021 3.94732 8.36739 4 8.5 4H11.5C11.6326 4 11.7598 3.94732 11.8536 3.85355C11.9473 3.75979 12 3.63261 12 3.5C12 3.36739 11.9473 3.24022 11.8536 3.14645C11.7598 3.05268 11.6326 3 11.5 3H8.5ZM19 14.5C19 15.6935 18.5259 16.8381 17.682 17.682C16.8381 18.5259 15.6935 19 14.5 19C13.3065 19 12.1619 18.5259 11.318 17.682C10.4741 16.8381 10 15.6935 10 14.5C10 13.3065 10.4741 12.1619 11.318 11.318C12.1619 10.4741 13.3065 10 14.5 10C15.6935 10 16.8381 10.4741 17.682 11.318C18.5259 12.1619 19 13.3065 19 14.5V14.5ZM16.853 14.854L16.856 14.851C16.9476 14.7583 16.9993 14.6334 17 14.503V14.497C16.9992 14.3657 16.9467 14.24 16.854 14.147L14.854 12.147C14.7602 12.0531 14.633 12.0003 14.5004 12.0002C14.3677 12.0001 14.2404 12.0527 14.1465 12.1465C14.0526 12.2403 13.9998 12.3675 13.9997 12.5001C13.9996 12.6328 14.0522 12.7601 14.146 12.854L15.293 14H12.5C12.3674 14 12.2402 14.0527 12.1464 14.1464C12.0527 14.2402 12 14.3674 12 14.5C12 14.6326 12.0527 14.7598 12.1464 14.8536C12.2402 14.9473 12.3674 15 12.5 15H15.293L14.146 16.146C14.0521 16.2399 13.9994 16.3672 13.9994 16.5C13.9994 16.6328 14.0521 16.7601 14.146 16.854C14.2399 16.9479 14.3672 17.0006 14.5 17.0006C14.6328 17.0006 14.7601 16.9479 14.854 16.854L16.854 14.854H16.853Z"
              fill="black" />
          </svg>
        </button>
        <button :class="chatState.isMobile ? 'message-btn toggle' : 'message-btn'" @click="toggleChat"
          title="open messages">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19.07 4.93002C17.4292 3.27852 15.2636 2.25124 12.9466 2.02526C10.6296 1.79929 8.30635 2.3888 6.37738 3.69215C4.44842 4.99551 3.03463 6.93103 2.37976 9.16503C1.72489 11.399 1.86997 13.7915 2.79 15.93C2.88589 16.1288 2.91735 16.3525 2.88 16.57L2 20.8C1.96609 20.9622 1.97302 21.1303 2.02014 21.2891C2.06727 21.4479 2.15313 21.5926 2.27 21.71C2.3658 21.8051 2.47987 21.8799 2.60533 21.9297C2.73079 21.9795 2.86504 22.0035 3 22H3.2L7.48 21.14C7.69753 21.1139 7.91812 21.1449 8.12 21.23C10.2585 22.15 12.651 22.2951 14.885 21.6403C17.119 20.9854 19.0545 19.5716 20.3579 17.6426C21.6612 15.7137 22.2507 13.3904 22.0248 11.0734C21.7988 8.75638 20.7715 6.59081 19.12 4.95002L19.07 4.93002ZM8 13C7.80221 13 7.60888 12.9414 7.44443 12.8315C7.27998 12.7216 7.1518 12.5654 7.07612 12.3827C7.00043 12.2 6.98063 11.9989 7.01921 11.8049C7.0578 11.611 7.15304 11.4328 7.29289 11.2929C7.43274 11.1531 7.61092 11.0578 7.80491 11.0192C7.99889 10.9807 8.19995 11.0005 8.38268 11.0761C8.56541 11.1518 8.72158 11.28 8.83147 11.4445C8.94135 11.6089 9 11.8022 9 12C9 12.2652 8.89464 12.5196 8.7071 12.7071C8.51957 12.8947 8.26521 13 8 13V13ZM12 13C11.8022 13 11.6089 12.9414 11.4444 12.8315C11.28 12.7216 11.1518 12.5654 11.0761 12.3827C11.0004 12.2 10.9806 11.9989 11.0192 11.8049C11.0578 11.611 11.153 11.4328 11.2929 11.2929C11.4327 11.1531 11.6109 11.0578 11.8049 11.0192C11.9989 10.9807 12.2 11.0005 12.3827 11.0761C12.5654 11.1518 12.7216 11.28 12.8315 11.4445C12.9413 11.6089 13 11.8022 13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8947 12.2652 13 12 13ZM16 13C15.8022 13 15.6089 12.9414 15.4444 12.8315C15.28 12.7216 15.1518 12.5654 15.0761 12.3827C15.0004 12.2 14.9806 11.9989 15.0192 11.8049C15.0578 11.611 15.153 11.4328 15.2929 11.2929C15.4327 11.1531 15.6109 11.0578 15.8049 11.0192C15.9989 10.9807 16.2 11.0005 16.3827 11.0761C16.5654 11.1518 16.7216 11.28 16.8315 11.4445C16.9413 11.6089 17 11.8022 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071C16.5196 12.8947 16.2652 13 16 13Z"
              fill="black" />
          </svg>

        </button>
        <button :class="chatState.isMobile ? 'end-btn toggle' : 'end-btn'" @click="endCall" title="end call">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.756 7.02298L6.829 6.03898C7.12267 5.7694 7.32907 5.41822 7.42173 5.03049C7.51438 4.64277 7.48905 4.23621 7.349 3.86298L6.892 2.63998C6.72089 2.1834 6.38214 1.80923 5.94477 1.59371C5.5074 1.37818 5.00431 1.33751 4.538 1.47998C2.822 2.00498 1.503 3.59998 1.909 5.49398C2.25175 7.06828 2.84101 8.57855 3.655 9.96898C4.625 11.636 5.733 12.869 6.683 13.734C8.117 15.04 10.167 14.713 11.486 13.484C11.8399 13.1543 12.0546 12.702 12.0864 12.2194C12.1181 11.7368 11.9646 11.2602 11.657 10.887L10.817 9.86698C10.5635 9.55871 10.2236 9.33332 9.84102 9.2198C9.45841 9.10628 9.05058 9.10983 8.67 9.22998L7.282 9.66698C6.92353 9.29744 6.60941 8.88734 6.346 8.44498C6.09165 7.99703 5.89349 7.51943 5.756 7.02298V7.02298ZM14.354 1.64598C14.4006 1.69243 14.4375 1.7476 14.4627 1.80835C14.4879 1.86909 14.5009 1.93422 14.5009 1.99998C14.5009 2.06575 14.4879 2.13087 14.4627 2.19162C14.4375 2.25236 14.4006 2.30754 14.354 2.35398L12.707 3.99998L14.354 5.64598C14.4005 5.69247 14.4374 5.74766 14.4625 5.8084C14.4877 5.86914 14.5006 5.93424 14.5006 5.99998C14.5006 6.06573 14.4877 6.13083 14.4625 6.19157C14.4374 6.25231 14.4005 6.3075 14.354 6.35398C14.3075 6.40047 14.2523 6.43735 14.1916 6.46251C14.1308 6.48767 14.0657 6.50062 14 6.50062C13.9343 6.50062 13.8692 6.48767 13.8084 6.46251C13.7477 6.43735 13.6925 6.40047 13.646 6.35398L12 4.70698L10.354 6.35398C10.2601 6.44787 10.1328 6.50062 10 6.50062C9.86723 6.50062 9.73989 6.44787 9.646 6.35398C9.55211 6.2601 9.49937 6.13276 9.49937 5.99998C9.49937 5.86721 9.55211 5.73987 9.646 5.64598L11.293 3.99998L9.646 2.35398C9.59951 2.3075 9.56264 2.25231 9.53748 2.19157C9.51232 2.13083 9.49937 2.06573 9.49937 1.99998C9.49937 1.86721 9.55211 1.73987 9.646 1.64598C9.73989 1.5521 9.86723 1.49935 10 1.49935C10.0657 1.49935 10.1308 1.5123 10.1916 1.53746C10.2523 1.56262 10.3075 1.5995 10.354 1.64598L12 3.29298L13.646 1.64598C13.6924 1.59942 13.7476 1.56248 13.8084 1.53727C13.8691 1.51206 13.9342 1.49909 14 1.49909C14.0658 1.49909 14.1309 1.51206 14.1916 1.53727C14.2524 1.56248 14.3076 1.59942 14.354 1.64598V1.64598Z"
              fill="black" />
          </svg>
        </button>
        <button class="toggle-controls" @click="toggleControls" title="toggle controls">
          <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.0756 3.06753C20.4271 3.41914 20.6246 3.89597 20.6246 4.39315C20.6246 4.89034 20.4271 5.36716 20.0756 5.71878L10.7944 15L20.0756 24.2813C20.4172 24.6349 20.6062 25.1085 20.6019 25.6002C20.5976 26.0918 20.4004 26.5621 20.0528 26.9097C19.7051 27.2573 19.2349 27.4545 18.7433 27.4588C18.2516 27.4631 17.778 27.2741 17.4244 26.9325L6.8175 16.3257C6.46599 15.974 6.26852 15.4972 6.26852 15C6.26852 14.5028 6.46599 14.026 6.8175 13.6744L17.4244 3.06753C17.776 2.71602 18.2528 2.51855 18.75 2.51855C19.2472 2.51855 19.724 2.71602 20.0756 3.06753V3.06753Z"
              fill="black" />
          </svg>
        </button>
      </div>
    </div>
    <Chat />
  </section>
</template>

<style lang="scss">
#room-section {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2rem;
  touch-action: manipulation;

  .copied-modal {
    position: absolute;
    top: 3rem;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: hsl(170, 10%, 80%);
    border-radius: 0.7rem;
    padding: 0.5rem 0.8rem;
    color: #111;
    box-shadow: 0 0 15px hsla(0, 0%, 10%, 0.5), 0 0 20px hsla(0, 0%, 10%, 0.5);
    z-index: 3;
    visibility: hidden;
    opacity: 0;
    transform: translate(-50%, -200%);
    transition: visibility 0.5s ease-in-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out;

    @media (max-width: 500px) {
      flex-direction: column;
    }

    &.active {
      opacity: 1;
      transform: translate(-50%, 0%);
      visibility: visible;

    }

    .icon {
      width: 2rem;
      height: 2rem;

      svg {
        height: 100%;
        width: 100%;

        path {
          fill: hsl(170, 24%, 44%);
        }
      }
    }

    p {
      font-weight: 500;

      @media (max-width: 500px) {
        text-align: center;
      }
    }
  }

  .videos {
    height: 100%;
    display: flex;
    padding-top: 1rem;
    justify-content: center;

    .video-box {
      position: relative;
      width: min(900px, 100%);
      height: min(650px, 100%);
      overflow: hidden;
      border-radius: 0.7rem;
      background-color: hsl(0, 0%, 0%);
      box-shadow: 0 0 15px hsla(0, 0%, 10%, 0.4), 0 5px 15px hsla(0, 0%, 5%, 0.5);


      &.one {
        animation: fade-video-one 0.7s ease-out both;
        transform-origin: center top;
        align-self: center;


        @media (min-height: 1000px) {
          height: 70%;
        }

        @keyframes fade-video-one {
          from {
            opacity: 0;
            transform: scale(0.8);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      }

      &.two {
        position: absolute;
        width: min(50%, 400px);
        height: min(40%, 300px);
        top: 2.5rem;
        left: 2.5rem;
        animation: fade-video-two 0.7s ease-out both;

        @keyframes fade-video-two {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @media (max-width: 900px) {
          top: 0.7rem;
          left: 0.7rem;
          height: min(25%, 200px);
        }

      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      span {
        display: inline-block;
        position: absolute;
        bottom: 0.5rem;
        left: 0.5rem;
        background-color: hsla(170, 24%, 44%, 0.4);
        -webkit-backdrop-filter: blur(4px);
        backdrop-filter: blur(4px);
        padding: 0.5rem 1rem;
        border-radius: 0.7rem;
        font-size: 1rem;
        font-weight: 500;
        color: #fff;
      }


    }

    .controls {
      position: absolute;
      bottom: 4rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 3rem;
      will-change: transform;

      @media (max-width: 1000px) {
        bottom: 1rem;
        flex-direction: column;
        left: 90%;
        gap: 1.5rem;
      }

      @media (min-width: 1024px) {
        animation: anim-controls 0.7s ease-out both;

        @keyframes anim-controls {
          from {
            opacity: 0;
            transform: translate(-50%, 200%);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0%);
          }
        }
      }

      button {
        width: 4.4rem;
        height: 4.4rem;
        background-color: hsl(170, 24%, 44%);
        border: none;
        border-radius: 50%;
        padding: 1rem;
        filter: drop-shadow(0 5px 5px rgba(23, 23, 23, 0.6)) drop-shadow(0 0 15px rgba(23, 23, 23, 0.4));
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
        will-change: transform;

        @media (max-width: 500px) {
          width: 4rem;
          height: 4rem;
        }

        &:hover {
          background-color: hsl(170, 24%, 54%);
        }

        &:active {
          transform: scale(0.95) translateY(0.1rem);
          filter: drop-shadow(0 1px 1px hsl(0, 0%, 15%, 0.7));
          transition: transform 0.1s ease, filter 0.1s ease;
        }

        &.toggle-controls {
          display: none;

          @media (max-width: 1000px) {
            display: inline-block;
          }
        }

        &.toggle {
          transform: translateX(150%);
          opacity: 0;
        }

        &.flip {
          background-color: hsl(0, 0%, 94%);
          transform: scale(0.8) rotate(180deg);
        }
      }




    }
  }
}
</style>
