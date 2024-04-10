<template>
  <Layout>
    <p>Room</p>
    <div class="p-4">
      <div class="video-mode flex gap-8">
        <div class="w-[60%] client-mode rounded-xl overflow-hidden bg-gray-700">
          <video id="their-video" width="100%" autoplay playsinline></video>
        </div>
        <div class="me w-[40%] rounded-xl overflow-hidden bg-gray-400">
          <video id="my-video" muted="true" width="100%" autoplay playsinline></video>
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
<script>
const app_id = process.env.VUE_APP_SKY_APP_ID;
const secret = process.env.VUE_APP_SKY_SECRET_KEY;
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
import {
  nowInSec,
  SkyWayAuthToken,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  uuidV4,
} from "@skyway-sdk/room";

export default {
  data() {
    return {
      app_id: null,
      token: null,
      audios: [],
      videos: [],
      selectedAudio: "",
      selectedVideo: "",
      peerId: "",
      calltoid: "",
      localStream: {},
    };
  },
  mounted() {
    this.app_id = app_id;
    this.token = token;
  },
  methods: {
    onChange() {
      if (this.selectedAudio != "" && this.selectedVideo != "") {
        this.connectLocalCamera();
      }
    },
    connectLocalCamera: async () => {
      const constraints = {
        audio: this.selectedAudio ? { deviceId: { exact: this.selectedAudio } } : false,
        video: this.selectedVideo ? { deviceId: { exact: this.selectedVideo } } : false,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        document.getElementById("my-video").srcObject = stream;
        this.localStream = stream;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
