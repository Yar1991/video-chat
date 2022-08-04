<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "../store";

const chatState = useStore();

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
      <div class="chat-body">

      </div>
      <form class="chat-form">
        <input type="text" placeholder="e.g. hello...">
        <button type="submit">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.815 12.197L5.283 13.452C5.19641 13.4664 5.11515 13.5034 5.04739 13.5593C4.97963 13.6151 4.92776 13.6878 4.897 13.77L2.3 20.728C2.052 21.368 2.721 21.978 3.335 21.67L21.335 12.67C21.4594 12.6076 21.564 12.5119 21.6371 12.3935C21.7102 12.2751 21.749 12.1387 21.749 11.9995C21.749 11.8603 21.7102 11.7239 21.6371 11.6055C21.564 11.4871 21.4594 11.3913 21.335 11.329L3.335 2.32899C2.721 2.02199 2.052 2.63199 2.3 3.27099L4.898 10.229C4.92876 10.3112 4.98063 10.3839 5.04839 10.4397C5.11615 10.4955 5.19741 10.5325 5.284 10.547L12.816 11.802C12.863 11.8095 12.9058 11.8335 12.9366 11.8697C12.9675 11.9059 12.9845 11.9519 12.9845 11.9995C12.9845 12.0471 12.9675 12.0931 12.9366 12.1293C12.9058 12.1655 12.863 12.1895 12.816 12.197H12.815Z"
              fill="black" />
          </svg>
        </button>
      </form>
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
  background-color: hsl(170, 14%, 84%);
  border-radius: 0.7rem;
  box-shadow: 0px 0px 15px hsla(0, 0%, 11%, 0.4),
    0px 0px 25px hsla(0, 0%, 11%, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem;
  opacity: 0;
  clip-path: circle(0% at 120% 120%);
  transition: opacity 0.5s ease-out, clip-path 0.5s ease-out;

  @media (min-width: 1024px) {
    bottom: 3rem !important;
    right: 1rem !important;
    width: 27rem;
    height: 70vh;
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
  }

  .chat-form {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 0.7rem;


    input {
      width: 100%;
      border: none;
      padding: 0.5rem;
      border-radius: 0.7rem;
      filter: drop-shadow(0 0 10px hsla(0, 0%, 5%, 0.4));
    }

    button {
      position: absolute;
      top: 0;
      right: 0;
      border: none;
      background: none;
      width: 2.5rem;
      height: 2.2rem;
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
}
</style>