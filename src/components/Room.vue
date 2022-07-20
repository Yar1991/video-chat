<script setup>
import { ref, onMounted } from "vue"
import router from "../router";

const peerOneVideoElement = ref(null)
const peerTwoVideoElement = ref(null)
const peerOneStream = ref(null)
const peerTwoStream = ref(null)

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ]
}

const connectionConstraints = {
  video: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
  audio: false
}

async function initConnection() {

  peerOneStream.value = await navigator.mediaDevices.getUserMedia(connectionConstraints)
  peerOneVideoElement.value.srcObject = peerOneStream.value
}


onMounted(() => {
  initConnection()
})
</script>

<template>
  <section id="room-section">
    <div class="videos">
      <div class="video-box">
        <video ref="peerOneVideoElement" class="peer-one" autoplay playsinline></video>
      </div>
      <div class="video-box">
        <video ref="peerTwoVideoElement" class="peer-two" autoplay playsinline></video>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
#room-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2rem;

  .videos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;

    .video-box {
      width: 500px;
      height: 400px;
      overflow: hidden;
      border-radius: 0.7rem;
      background-color: hsl(0, 0%, 0%);

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
