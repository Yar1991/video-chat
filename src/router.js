import { createRouter, createWebHistory } from "vue-router";
import Lobby from "./components/Lobby.vue";
import Room from "./components/Room.vue";

const routes = [
  {
    name: "Lobby",
    path: "/",
    component: Lobby,
  },
  {
    name: "Room",
    path: "/:roomId",
    component: Room,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
