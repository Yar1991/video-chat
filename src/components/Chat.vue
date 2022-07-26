<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "../store";
import { addMessage, updateMessages } from "../firebase";
import router from "../router";
import { createPicker } from "picmo";

const chatState = useStore();
const messagesContainer = ref(null);
const inputRef = ref(null);
const emojiContainer = ref(null);
const showEmoji = ref(false);
const roomId = ref(router.currentRoute.value.params.roomId);
const messageUpdateWatcher = ref(null);
const scrollChatTimeout = ref(null);
const scrollChatWatcher = ref(null);
const chatOpenWatcher = ref(null);



function sendMessage(e) {
  e.preventDefault();
  if (inputRef.value.textContent === "") return;
  const currentTime = new Date().toTimeString().split(" ");
  const timestamp = new Date().getTime();
  const message = {
    name: localStorage.getItem("peerName"),
    text: inputRef.value.textContent,
    time: `${currentTime[0].split(":")[0]}:${currentTime[0].split(":")[1]}`,
    timestamp
  }
  addMessage(roomId.value, message);
  inputRef.value.textContent = "";
  showEmoji.value = false;
}

chatOpenWatcher.value = watch(() => chatState.openChat, () => {
  if (chatState.openChat) {
    inputRef.value.focus();
    scrollChatTimeout.value = setTimeout(() => {
      messagesContainer.value.scroll({
        top: messagesContainer.value.scrollHeight + 300,
        left: 0,
        behavior: "smooth"
      });
    }, 300);
  }
});

scrollChatWatcher.value = watch(() => chatState.messages, () => {
  scrollChatTimeout.value = setTimeout(() => {
    messagesContainer.value.scroll({
      top: messagesContainer.value.scrollHeight + 300,
      left: 0,
      behavior: "smooth"
    });
  }, 300);
})


onMounted(() => {
  if (!chatState.isMobile) {
    const emojiPicker = createPicker({
      rootElement: emojiContainer.value,
      className: "emoji-picker"
    });

    emojiPicker.addEventListener("emoji:select", (e) => {
      inputRef.value.textContent = `${inputRef.value.textContent}${e.emoji}`;
      inputRef.value.focus();
    });
  }
  messageUpdateWatcher.value = updateMessages(roomId.value);
});

onBeforeUnmount(() => {
  scrollChatWatcher.value();
  messageUpdateWatcher.value();
  chatOpenWatcher.value();
  clearTimeout(scrollChatTimeout.value);
});

</script>

<template>
  <Teleport to="body">
    <div :class="chatState.openChat ? 'chat-box active' : 'chat-box'">
      <div class="chat-box-header">
        <button class="close-btn" @click="chatState.openChat = false" title="close chat">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <div ref="messagesContainer" class="chat-body">
        <div class="message" v-for="message in chatState.messages">
          <p>{{ message?.text }}</p>
          <div class="message-info">
            <h4>{{ message?.name }}</h4>
            <h4>{{ message?.time }}</h4>
          </div>
        </div>
      </div>
      <div class="chat-form">
        <div class="input-box">
          <p ref="inputRef" class="input" contenteditable="true" spellcheck="true" title="input"
            @keydown.enter.exact="sendMessage"></p>
        </div>
        <button v-if="!chatState.isMobile" class="emoji-btn" title="emojies" @click="showEmoji = !showEmoji">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.968 9.75C4.93541 9.69268 4.8918 9.64237 4.83969 9.60197C4.78758 9.56157 4.72799 9.53187 4.66435 9.5146C4.60071 9.49732 4.53429 9.4928 4.4689 9.5013C4.40351 9.5098 4.34044 9.53115 4.28334 9.56412C4.22623 9.59709 4.17621 9.64103 4.13616 9.69341C4.09611 9.74579 4.06681 9.80558 4.04995 9.86933C4.0331 9.93308 4.02902 9.99953 4.03795 10.0649C4.04689 10.1302 4.06865 10.1931 4.102 10.25C4.49688 10.9344 5.06506 11.5026 5.74935 11.8976C6.43364 12.2926 7.2099 12.5004 8 12.5C8.79007 12.5002 9.56625 12.2923 10.2505 11.8973C10.9348 11.5024 11.503 10.9342 11.898 10.25C11.9314 10.1931 11.9531 10.1302 11.9621 10.0649C11.971 9.99953 11.9669 9.93308 11.9501 9.86933C11.9332 9.80558 11.9039 9.74579 11.8638 9.69341C11.8238 9.64103 11.7738 9.59709 11.7167 9.56412C11.6596 9.53115 11.5965 9.5098 11.5311 9.5013C11.4657 9.4928 11.3993 9.49732 11.3357 9.5146C11.272 9.53187 11.2124 9.56157 11.1603 9.60197C11.1082 9.64237 11.0646 9.69268 11.032 9.75C10.7249 10.2823 10.283 10.7244 9.75067 11.0316C9.2184 11.3388 8.61458 11.5004 8 11.5C7.38543 11.5004 6.78161 11.3388 6.24933 11.0316C5.71706 10.7244 5.27511 10.2823 4.968 9.75V9.75ZM7 5.116V5C7 4.73478 6.89465 4.48043 6.70711 4.29289C6.51957 4.10536 6.26522 4 6 4H3.28C3.128 4 2.97799 4.03466 2.84139 4.10134C2.70479 4.16801 2.58518 4.26495 2.49167 4.38479C2.39815 4.50462 2.33319 4.6442 2.30171 4.79291C2.27023 4.94162 2.27307 5.09555 2.31 5.243L2.621 6.485C2.72916 6.91768 2.97883 7.30179 3.33033 7.57629C3.68184 7.8508 4.11501 7.99993 4.561 8H5C5.50265 8.00012 5.98691 7.81097 6.35641 7.4702C6.72591 7.12943 6.95354 6.66202 6.994 6.161C7.31766 6.05018 7.65793 5.99572 8 6C8.393 6 8.74 6.064 9.006 6.161C9.04647 6.66202 9.2741 7.12943 9.64359 7.4702C10.0131 7.81097 10.4974 8.00012 11 8H11.438C11.884 7.99993 12.3172 7.8508 12.6687 7.57629C13.0202 7.30179 13.2699 6.91768 13.378 6.485L13.689 5.243C13.7259 5.09563 13.7288 4.94179 13.6974 4.79315C13.6659 4.64452 13.601 4.505 13.5076 4.38518C13.4142 4.26537 13.2948 4.16841 13.1583 4.10167C13.0218 4.03492 12.8719 4.00016 12.72 4H10C9.73479 4 9.48043 4.10536 9.2929 4.29289C9.10536 4.48043 9 4.73478 9 5V5.116C8.67249 5.03757 8.33677 4.99863 8 5C7.65 5 7.31 5.04 7 5.116Z"
              fill="black" />
            <path
              d="M16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8V8ZM15 8C15 6.14348 14.2625 4.36301 12.9497 3.05025C11.637 1.7375 9.85652 1 8 1C6.14348 1 4.36301 1.7375 3.05025 3.05025C1.7375 4.36301 1 6.14348 1 8C1 9.85652 1.7375 11.637 3.05025 12.9497C4.36301 14.2625 6.14348 15 8 15C9.85652 15 11.637 14.2625 12.9497 12.9497C14.2625 11.637 15 9.85652 15 8Z"
              fill="black" />
          </svg>

        </button>
        <button type="button" @click="sendMessage" title="send">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.815 12.197L5.283 13.452C5.19641 13.4664 5.11515 13.5034 5.04739 13.5593C4.97963 13.6151 4.92776 13.6878 4.897 13.77L2.3 20.728C2.052 21.368 2.721 21.978 3.335 21.67L21.335 12.67C21.4594 12.6076 21.564 12.5119 21.6371 12.3935C21.7102 12.2751 21.749 12.1387 21.749 11.9995C21.749 11.8603 21.7102 11.7239 21.6371 11.6055C21.564 11.4871 21.4594 11.3913 21.335 11.329L3.335 2.32899C2.721 2.02199 2.052 2.63199 2.3 3.27099L4.898 10.229C4.92876 10.3112 4.98063 10.3839 5.04839 10.4397C5.11615 10.4955 5.19741 10.5325 5.284 10.547L12.816 11.802C12.863 11.8095 12.9058 11.8335 12.9366 11.8697C12.9675 11.9059 12.9845 11.9519 12.9845 11.9995C12.9845 12.0471 12.9675 12.0931 12.9366 12.1293C12.9058 12.1655 12.863 12.1895 12.816 12.197H12.815Z"
              fill="black" />
          </svg>
        </button>
      </div>
      <div v-if="!chatState.isMobile" ref="emojiContainer"
        :class="showEmoji ? 'emoji-container active' : 'emoji-container'"></div>
    </div>
  </Teleport>
</template>


<style lang="scss">
.chat-box {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color: hsl(168, 10%, 45%);
  border-radius: 0.7rem;
  box-shadow: 0px 0px 15px hsla(0, 0%, 11%, 0.4), 0 0 20px hsla(0, 0%, 0%, 0.4),
    0px 0px 25px hsla(0, 0%, 11%, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem;
  opacity: 0;
  clip-path: circle(0% at 120% 120%);
  transition: opacity 0.5s ease-out, clip-path 0.5s ease-out;

  @media (min-width: 500px) {
    width: 70%;
    height: 80%;
  }

  @media (min-width: 1024px) {
    bottom: 3rem;
    right: 3rem;
    width: 27rem;
    height: 80vh;
  }

  &.active {
    opacity: 1;
    clip-path: circle(100%);

  }


  .chat-box-header {
    .close-btn {
      width: 2.5rem;
      height: 2.5rem;
      background: none;
      border: none;
      cursor: pointer;
      will-change: transform;
      transition: transform 0.2s ease, fitler 0.3s ease;

      &:hover>svg {
        filter: contrast(70%);
      }

      &:active {
        transform: scale(0.8);
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  .chat-body {
    height: 100%;
    width: 100%;
    background-color: hsl(0, 0%, 15%);
    border-radius: 0.7rem;
    margin-bottom: 0.5rem;
    box-shadow: inset 0 0 15px hsla(0, 0%, 0%, 0.9);
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      display: none;
    }

    .message {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      gap: 1rem;
      background-color: hsl(168, 3%, 63%);
      border-radius: 0.7rem;
      box-shadow: 0 5px 15px hsla(0, 0%, 0%, 0.4), 0 0 15px hsla(0, 0%, 0%, 0.4);

      p {
        line-height: 1.5;

        &::selection {
          background-color: #fff;
          color: hsl(170, 24%, 34%);
        }
      }

      .message-info {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 {
          font-weight: 500;
          font-size: 0.85rem;
          opacity: 0.7;

          &::selection {
            background-color: #fff;
            color: hsl(170, 24%, 34%);
          }
        }
      }
    }
  }

  .chat-form {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.7rem;

    .input-box {
      position: relative;
      width: 100%;
      max-height: 4rem;
      border-radius: 0.7rem;
      background-color: #fff !important;
      filter: drop-shadow(0 0 10px hsla(0, 0%, 5%, 0.4));
      overflow: hidden;

      @media (max-width: 500px) {
        filter: none;
      }


      .input {
        width: 100%;
        max-height: 4rem;
        line-height: 1.5;
        border: none;
        padding: 0.4rem;
        border-radius: 0.7rem;
        font-size: 1rem;
        overflow-y: scroll;
        z-index: 3;

        &::selection {
          background-color: hsl(170, 14%, 70%);
        }


        &::-webkit-scrollbar {
          display: none;
        }
      }
    }


    button {
      border: none;
      background: none;
      width: 2.5rem;
      height: 2.2rem;
      cursor: pointer;
      will-change: transform;
      transition: transform 0.2s ease, fitler 0.3s ease;

      &:hover>svg {
        filter: contrast(80%);
      }

      &:active {
        transform: scale(0.8);
      }

      svg {
        width: 100%;
        height: 100%;

        path {
          fill: rgb(0, 0, 0);
        }
      }
    }
  }

  .emoji-container {
    position: absolute;
    bottom: 4rem;
    right: 1rem;
    opacity: 0;
    visibility: hidden;
    box-shadow: 0 0 15px hsla(0, 0%, 10%, 0.4), 0 5px 25px hsla(0, 0%, 5%, 0.4);
    border-radius: 0.7rem;
    overflow: hidden;
    transition: opacity 0.3s ease-in, visibility 0.3s ease-in;

    &.active {
      opacity: 1;
      visibility: visible;
      transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
    }

    &>.emoji-picker {
      --background-color: hsl(168, 3%, 63%);
    }
  }

}
</style>