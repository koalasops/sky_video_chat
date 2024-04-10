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
const selectedAudio = ref("");
const selectedVideo = ref("");
const peerId = ref("");
const calltoid = ref("");
const localStream = ref();
const client_video = ref(null);
const my_video = ref(null);
const skyToken = ref();
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
  console.log("Audio Device Info:", audios.value);
  console.log("Camera Device Info", videos.value);
});

const onChange = () => {
  if (selectedAudio.value != "" && selectedVideo.value != "") {
    connectLocalCamera();
  }
};
const connectLocalCamera = async () => {
  const constraints = {
    audio: selectedAudio.value ? { deviceId: { exact: selectedAudio.value } } : false,
    video: selectedVideo.value ? { deviceId: { exact: selectedVideo.value } } : false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    my_video.value.srcObject = stream;
    localStream.value = stream;
    console.log("Detected the camera");
  } catch (e) {
    console.log("Device not found");
  }
};
</script>
<template>
  <Layout>
    <p class="">Room</p>
    <div class="p-4">
      <div class="video-mode flex gap-8">
        <div
          class="relative flex items-center justify-center w-[60%] h-full client-mode rounded-xl overflow-hidden bg-gray-700"
        >
          <video ref="client_video" width="100%" autoplay playsinline></video>
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
          Your Peer ID: <span id="my-id">{{ peerId }}</span>
        </p>
        <input v-model="calltoid" placeholder="call id" class="p-2 w-full" />
        <button
          @click="makeCall"
          class="button--green bg-sky-500 p-2 rounded w-full mt-2"
        >
          Call
        </button>
        <br />
      </div>

      <div class="device-info flex gap-4 mt-4">
        <div class="audio">
          <label for="" class="block">マイク:</label>
          <select v-model="selectedAudio" @change="onChange" class="p-2 w-full">
            <option disabled value="">Please select one</option>
            <option
              v-for="(audio, key, index) in audios"
              v-bind:key="index"
              :value="audio.value"
            >
              {{ audio.text }}
            </option>
          </select>
        </div>
        <div class="camera">
          <label for="" class="block">カメラ:</label>
          <select v-model="selectedVideo" @change="onChange" class="p-2 w-full">
            <option disabled value="">Please select one</option>
            <option
              v-for="(video, key, index) in videos"
              v-bind:key="index"
              :value="video.value"
            >
              {{ video.text }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </Layout>
</template>
