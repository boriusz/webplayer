<template>
  <div
    :class="isActive ? 'song-active' : 'song'"
    @mouseover="isHover = true"
    @mouseout="isHover = false"
  >
    <div class="album-name">{{ albumName }}</div>
    <div class="song-name">{{ songName }}</div>
    <div class="song-size">
      {{ Math.round((size / 1024 / 1024) * 100) / 100 }}MB
    </div>
    <div class="song-play" @click="handlePlay" v-show="isHover">
      {{ this.$store.getters.getIsPlaying && isActive ? "Stop" : "Play" }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Song",
  emits: ["activate"],
  props: ["songName", "albumName", "size", "artist"],
  data() {
    return {
      isHover: false,
      isActive: false,
      audio: null,
    };
  },
  mounted() {
    this.audio = document.querySelector("#audio");
  },
  methods: {
    handlePlay() {
      const currSongPlaying = this.$store.getters.getCurrentlyPlayingSong
      if (this.$store.getters.getIsPlaying && currSongPlaying?.songName === this.songName) {
        this.audio.pause()
        this.$store.dispatch('setIsPlaying', {isPlaying: false})
        return
      }
      if (!this.$store.getters.getIsPlaying && currSongPlaying?.songName === this.songName) {
        this.audio.play()
        this.$store.dispatch('setIsPlaying', {isPlaying: true})
        return
      }
      this.$store.dispatch("setCurrentlyPlayingSong", {
        songName: this.songName,
        albumName: this.albumName,
        artist: this.artist,
        playing: true,
      });
      const { artist, albumName, songName } = this;
      const songList = this.$store.getters.getSongList;
      const currSongId = songList.findIndex((song) => {
        if (
          song.albumName === albumName &&
          song.artist === artist &&
          song.songName === songName
        ) {
          return true;
        }
      });
      this.audio.children[0].src = `http://192.168.1.8:4000/${this.artist}/${this.albumName}/${this.songName}`;
      this.$store.dispatch("setIsPlaying", { isPlaying: true });
      this.$emit("songChanged", { songName, albumName, artist, currSongId });
      this.audio.load()
      this.audio.play();
    },
  },
};
</script>

<style scoped>
.song:hover {
  background: blue;
  color: white;
}

.song,
.song-active {
  line-height: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.song-active {
  background: blue;
  color: white;
}

.album-name {
  flex-basis: 30%;
}

.song-name {
  flex-basis: 30%;
}

.song-size {
  flex-basis: 30%;
}
</style>
