<script setup>
import { ref, onMounted } from "vue";
import {
  nowInSec,
  SkyWayAuthToken,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  uuidV4,
} from "@skyway-sdk/room";
import { VirtualBackground, BlurBackground } from "skyway-video-processors";
import Swal from "sweetalert2";

const app_id = process.env.VUE_APP_SKY_APP_ID;
const secret = process.env.VUE_APP_SKY_SECRET_KEY;
const audios = ref([]);
const videos = ref([]);
const roomId = ref("");
const roomName = ref("");
const localAudioStream = ref();
const localVideoStream = ref();
const localVideo = ref(null);
const clientVideo = ref(null);

const token = new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: app_id,
      turn: true,
      actions: ["read"],
      channels: [
        {
          id: "*",
          name: "*",
          actions: ["write"],
          members: [
            {
              id: "*",
              name: "*",
              actions: ["write"],
              publication: {
                actions: ["write"],
              },
              subscription: {
                actions: ["write"],
              },
            },
          ],
          sfuBots: [
            {
              actions: ["write"],
              forwardings: [
                {
                  actions: ["write"],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}).encode(secret);

const backgroundProcessor = new VirtualBackground({ image: "../../assets/back.jpg" });

onMounted(async () => {
  await handleCheckDevice();
  await backgroundProcessor.initialize();
  await localPushing();
});

const handleCheckDevice = async () => {
  const deviceInfos = await navigator.mediaDevices.enumerateDevices();
  deviceInfos
    .filter((f) => f.kind == "audioinput")
    .map((audio) =>
      audios.value.push({
        text: audio.label || `Microphone ${audios.value.length + 1}`,
        value: audio.deviceId,
      })
    );
  // Get Camera Device Information
  deviceInfos
    .filter((f) => f.kind === "videoinput")
    .map((video) =>
      videos.value.push({
        text: video.label || `Camera ${videos.value.length - 1}`,
        value: video.deviceId,
      })
    );
  if (audios.value.length == 0) {
    Swal.fire({
      title: "Device Error!",
      text: "Not Found Audio Device",
      icon: "error",
      confirmButtonText: "Close",
    });
  }
  if (videos.value.length == 0) {
    Swal.fire({
      title: "Device Error!",
      text: "Not Found Camera Device",
      icon: "error",
      confirmButtonText: "Close",
    });
  }
};
const localPushing = async () => {
  const localVideo = document.getElementById("local-video");
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     video: videos.value.length > 0 ? true : false,
  //     audio: audios.value.length > 0 ? true : false,
  //   });

  const result = await backgroundProcessor.createProcessedStream();
  const stream = new MediaStream([result.track]);
  localVideo.srcObject = stream;
  localVideoStream.value = stream;
  await localVideo.play();
};
</script>
<template>
  <Layout>
    <p class="">Room</p>
    <div class="p-4">
      <div class="video-mode flex gap-8">
        <div
          id="remote-media-area"
          class="relative flex items-center justify-center w-[60%] h-full client-mode rounded-xl overflow-hidden bg-gray-700"
        >
          <!-- <video ref="client_video" width="100%" autoplay playsinline></video> -->
          <div
            class="absolute w-24 h-24 rounded-full bg-gray-500 dark:bg-white dark:text-gray-900 flex items-center justify-center text-6xl font-bold"
          >
            C
          </div>
        </div>
        <div
          class="relative me flex items-center justify-center w-[40%] h-full rounded-xl overflow-hidden bg-gray-400"
        >
          <video
            id="local-video"
            ref="my_video"
            muted="true"
            width="100%"
            autoplay
            playsinline
          ></video>
          <div
            v-if="!localVideoStream"
            class="absolute w-24 h-24 rounded-full bg-gray-500 dark:bg-white dark:text-gray-900 flex items-center justify-center text-6xl font-bold"
          >
            Y
          </div>
        </div>
      </div>
      <div class="join mt-4 text-start">
        <p>
          Your ID: <span id="my-id">{{ peerId }}</span>
        </p>
        <input
          id="room-name"
          v-model="roomName"
          placeholder="Room Name"
          class="p-2 w-full text-black"
        />
        <button id="join" class="button--green bg-sky-500 p-2 rounded w-full mt-2">
          Join On
        </button>
        <br />
        <div id="button-area"></div>
      </div>
    </div>
  </Layout>
</template>
