<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { newRoom, addToRoom } from "../firebase"
import router from "../router"

const mainSection = ref(null);
const createDialog = ref(null)
const joinDialog = ref(null)
const error = ref("");
const errorTimer = ref(null);
const loading = ref(false);

function openCreateDialog() {
  createDialog.value.showModal();
}

function openJoinDialog() {
  joinDialog.value.showModal();
}

function closeModalOnClick(e) {
  if ((createDialog.value.open || joinDialog.value.open) && e.target.classList.contains("modal")) {
    createDialog.value.close();
    joinDialog.value.close();
  }
}

async function createRoom(e) {
  const username = e.target.username.value;
  loading.value = true;
  const roomId = await newRoom(username)
  router.push({ name: "Room", params: { roomId } });
  createDialog.value.close()
  e.target.username.value = ""
}

async function joinRoom(e) {
  const username = e.target.username.value;
  const roomId = e.target.roomid.value;
  loading.value = true;
  const joinRoom = await addToRoom(username, roomId)
  if (joinRoom === false) {
    loading.value = false;
    error.value = "Invalid room id";
    errorTimer.value = setTimeout(() => {
      error.value = "";
    }, 1500);
    return;
  } else {
    router.push({ name: "Room", params: { roomId } });
    joinDialog.value.close()
    e.target.username.value = ""
    e.target.roomid.value = ""
  }

}

onMounted(() => {
  mainSection?.value.addEventListener("click", closeModalOnClick);
});

onBeforeUnmount(() => {
  mainSection?.value.removeEventListener("click", closeModalOnClick);
  clearTimeout(errorTimer.value);
});

</script>

<template>
  <section ref="mainSection" id="lobby-section">
    <div class="header">
      <div class="logo">
        <img src="/icon.png" alt="logo">
      </div>
      <h2>PeerChat</h2>
    </div>
    <div class="lobby-form">
      <h1>You can create or join a room</h1>
      <div class="form-btns">
        <button type="submit" class="form-btn" @click="openCreateDialog" title="create room">Create</button>
        <button type="submit" class="form-btn" @click="openJoinDialog" title="join room">Join</button>
      </div>
      <dialog ref="createDialog" class="create-modal modal">
        <form method="dialog" @submit.prevent="createRoom">
          <input type="text" name="username" placeholder="Input your name..." required>
          <button class="form-btn">
            Submit
            <div v-if="loading" class="loader-box">
              <span class="loader"></span>
            </div>
          </button>
        </form>
      </dialog>
      <dialog ref="joinDialog" class="join-modal modal">
        <form method="dialog" @submit.prevent="joinRoom">
          <input type="text" name="username" placeholder="Input your name..." required>
          <div class="roomId-box">
            <input type="text" name="roomid" placeholder="Input room id..." required />
            <span class="error">{{ error }}</span>
          </div>
          <button class="form-btn">
            Submit
            <div v-if="loading" class="loader-box">
              <span class="loader"></span>
            </div>
          </button>
        </form>
      </dialog>
    </div>
  </section>
</template>

<style lang="scss">
#lobby-section {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: manipulation;


  .header {
    position: absolute;
    top: 0;
    left: 0;
    padding: 2rem;
    display: flex;
    align-items: center;


    .logo {
      width: 4rem;
      height: 4rem;
      margin-inline-end: 1rem;
      animation: anim-logo 0.7s ease-out both;
      animation-delay: 0.8s;

      &>img {
        width: 100%;
        height: 100%;
      }

      @keyframes anim-logo {
        0% {
          opacity: 0;
          transform: scale(0.8) translateY(100%) rotate(0deg);
        }

        20% {
          opacity: 1;
          transform: scale(1) translateY(-25%) rotate(0deg);
        }

        40% {
          opacity: 1;
          transform: scale(1) translateY(-25%) rotate(-20deg);
        }

        60% {
          opacity: 1;
          transform: scale(1) translateY(-25%) rotate(20deg);
        }

        80% {
          opacity: 1;
          transform: scale(1) translateY(-25%) rotate(0deg);
        }

        100% {
          opacity: 1;
          transform: scale(1) translateY(0%) rotate(0deg);
        }
      }
    }

    h2 {
      letter-spacing: 1px;
      font-weight: 600;
      font-size: 1.6rem;
      animation: anim-logo-text 0.7s ease-out both;
      animation-delay: 0.5s;

      @keyframes anim-logo-text {
        from {
          opacity: 0;
          transform: translateY(200%);
        }

        to {
          opacity: 1;
          transform: translateY(0%);
        }
      }
    }

    @media (max-width: 500px) {
      padding: 1rem;
    }
  }


  .lobby-form {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    background-color: hsl(170, 24%, 44%);
    padding: 2.5rem;
    border-radius: 0.7rem;
    box-shadow: 0 0 15px hsla(0, 0%, 10%, 0.4), 0 5px 25px hsla(0, 0%, 5%, 0.4);
    will-change: transform;
    animation: anim-lobby-form 0.7s ease-out both;

    @keyframes anim-lobby-form {
      from {
        opacity: 0;
        transform: translateY(50%);
      }

      to {
        opacity: 1;
        transform: translateY(0%);
      }
    }

    h1 {
      text-align: center;
      font-weight: 500;
      font-size: 1.2rem;
    }

    .form-btns {
      align-self: center;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .form-btn {
      width: 7rem;
      padding: 0.7rem 0;
      border: none;
      background-color: hsl(0, 0%, 15%);
      color: #fff;
      font-size: 1rem;
      font-family: inherit;
      border-radius: 0.7rem;
      filter: drop-shadow(0 5px 5px hsl(0, 0%, 15%, 0.5));
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease, filter 0.2s ease;
      will-change: transform;

      &:hover {
        background-color: hsl(0, 0%, 18%);
      }

      &:active {
        transform: scale(0.95) translateY(0.1rem);
        filter: drop-shadow(0 1px 1px hsl(0, 0%, 15%, 0.7));
        transition: transform 0.1s ease, filter 0.1s ease;
      }
    }

    .modal {
      margin: auto;
      border: none;
      border-radius: 0.7rem;
      box-shadow: 0 0 15px hsla(0, 0%, 10%, 0.4), 0 5px 25px hsla(0, 0%, 5%, 0.3);
      animation: fade-modal 0.7s ease-out;

      @keyframes fade-modal {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      &::backdrop {
        background-color: hsla(0, 0%, 10%, 0.7);
      }

      form {
        background-color: hsl(170, 24%, 44%);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;

        .roomId-box {
          position: relative;


          .error {
            position: absolute;
            top: 115%;
            left: 0;
            color: hsl(0, 70%, 37%);
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 1px;
          }
        }


        input {
          width: min(20rem, 70vw);
          font-family: inherit;
          font-size: 1rem;
          border: none;
          border-radius: 0.7rem;
          padding: 0.3rem;
        }

        button {
          position: relative;
          align-self: center;
          overflow: hidden;

          .loader-box {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-color: hsl(0, 0%, 15%);

            .loader {
              position: absolute;
              margin: auto;
              margin-inline-start: 50%;
              transform: translateX(50%);
              inset: 0;
              width: 0.7rem;
              height: 0.7rem;
              border-radius: 50%;
              display: inline-block;
              color: #FFF;
              box-sizing: border-box;
              animation: animloader 1s linear infinite alternate;
            }

            @keyframes animloader {
              0% {
                box-shadow: -38px -6px, -14px 6px, 14px -6px;
              }

              33% {
                box-shadow: -38px 6px, -14px -6px, 14px 6px;
              }

              66% {
                box-shadow: -38px -6px, -14px 6px, 14px -6px;
              }

              100% {
                box-shadow: -38px 6px, -14px -6px, 14px 6px;
              }
            }
          }

        }
      }

    }
  }
}
</style>
