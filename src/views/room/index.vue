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

const app_id = process.env.VUE_APP_SKY_APP_ID;
const secret = process.env.VUE_APP_SKY_SECRET_KEY;
const audios = ref([]);
const videos = ref([]);
const peerId = ref("");
const roomName = ref("");
const localStream = ref();
const client_video = ref(null);
const my_video = ref(null);

const room = ref();
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

onMounted(async () => {
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
  await connectLocalCamera();
  console.log("Audio Device Info:", audios.value);
  console.log("Camera Device Info", videos.value);
});

const connectLocalCamera = async () => {
  try {
    const {
      audio,
      video,
    } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream(); // 2
    video.attach(my_video.value);
    localStream.value.audio = audio;
    localStream.value.video = video;
    await my_video.value.play();
    console.log("Detected the camera");
  } catch (e) {
    console.log("Device not found");
  }
};

const meChannel = ref();
const makeCall = async () => {
  if (roomName.value == "") {
    alert("Input the Room Name");
  }
  const context = await SkyWayContext.Create(token);
  console.log(context);
  room.value = await SkyWayRoom.FindOrCreate(context, {
    type: "p2p",
    name: roomName.value,
  });
  meChannel.value = await room.value.join();
  peerId.value = meChannel.value.id;
  if (localStream.value?.audio || localStream.value?.video) {
    await meChannel.value.publish(localStream.value?.audio);
    await meChannel.value.publish(localStream.value?.video);
  }
  const subscribeAndAttach = (publication) => {
    if (publication.publisher.id === meChannel.value.id) return;

    const subscribeButton = document.createElement("button");
    subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
    const buttonArea = document.getElementById("button-area");
    buttonArea.appendChild(subscribeButton);

    subscribeButton.onclick = async () => {
      const { stream } = await meChannel.value.subscribe(publication.id);

      let newMedia;
      switch (stream.track.kind) {
        case "video":
          newMedia = document.createElement("video");
          newMedia.playsInline = true;
          newMedia.autoplay = true;
          break;
        case "audio":
          newMedia = document.createElement("audio");
          newMedia.controls = true;
          newMedia.autoplay = true;
          break;
        default:
          return;
      }
      stream.attach(newMedia);
      const remoteMediaArea = document.getElementById("remote-area");
      remoteMediaArea.appendChild(newMedia);
    };
  };

  room.value.publications.forEach(subscribeAndAttach);
  room.value.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
};
</script>
<template>
  <Layout>
    <p class="">Room</p>
    <div class="p-4">
      <div class="video-mode flex gap-8">
        <div
          id="remote-area"
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
          <video ref="my_video" muted="true" width="100%" autoplay playsinline></video>
          <div
            v-if="!localStream"
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
        <input v-model="roomName" placeholder="Room Name" class="p-2 w-full text-black" />
        <button
          @click="makeCall"
          class="button--green bg-sky-500 p-2 rounded w-full mt-2"
        >
          Join On
        </button>
        <br />
        <div id="button-area"></div>
      </div>
    </div>
  </Layout>
</template>
