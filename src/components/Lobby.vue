<script setup>
import { ref } from "vue"
import { newRoom, addToRoom } from "../firebase"
import router from "../router"

const createDialog = ref(null)
const joinDialog = ref(null)


function openCreateDialog() {
  createDialog.value.showModal()
}

function openJoinDialog() {
  joinDialog.value.showModal()
}

async function createRoom(e) {
  const username = e.target.username.value;
  const roomId = await newRoom(username)
  router.push({ name: "Room", params: { roomId } })
  createDialog.value.close()
  e.target.username.value = ""
}

function joinRoom(e) {
  const username = e.target.username.value;
  const roomId = e.target.roomid.value;
  addToRoom(username, roomId)
  joinDialog.value.close()
  e.target.username.value = ""
  e.target.roomid.value = ""
}

</script>

<template>
  <section id="lobby-section">
    <div class="lobby-form">
      <h1>You can create a room or join</h1>
      <div class="form-btns">
        <button type="submit" class="form-btn" @click="openCreateDialog">Create</button>
        <button type="submit" class="form-btn" @click="openJoinDialog">Join</button>
      </div>
      <dialog ref="createDialog" class="create-modal modal">
        <form method="dialog" @submit.prevent="createRoom">
          <input type="text" name="username" placeholder="Input your name..." required>
          <button class="form-btn">Submit</button>
        </form>
      </dialog>
      <dialog ref="joinDialog" class="join-modal modal">
        <form method="dialog" @submit.prevent="joinRoom">
          <input type="text" name="username" placeholder="Input your name..." required>
          <input type="text" name="roomid" placeholder="Input room id..." required>
          <button class="form-btn">Submit</button>
        </form>
      </dialog>
    </div>
  </section>
</template>

<style lang="scss">
#lobby-section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .lobby-form {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    background-color: hsl(170, 24%, 44%);
    padding: 2.5rem;
    border-radius: 0.7rem;
    box-shadow: 0 0 15px hsla(0, 0%, 10%, 0.4), 0 5px 25px hsla(0, 0%, 5%, 0.3);

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

      &::backdrop {
        background-color: hsla(0, 0%, 10%, 0.7);
      }

      form {
        background-color: hsl(170, 24%, 44%);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;


        input {
          width: 20rem;
          font-family: inherit;
          font-size: 1rem;
          border: none;
          border-radius: 0.7rem;
          padding: 0.3rem;
        }

        button {
          align-self: center;
        }
      }
    }
  }
}
</style>
