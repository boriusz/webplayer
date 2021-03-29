<template>
  <div id="player">
    <div id="song-wrapper">
      <div id="song-details">
        <div>{{ this.$store.getters.getCurrentlyPlayingSong.artist }}</div>
        <div>{{ this.$store.getters.getCurrentlyPlayingSong.albumName }}</div>
        <div>{{ this.$store.getters.getCurrentlyPlayingSong.songName.replace(/.mp3/, '') }}</div>
      </div>
      <div id="player-control">
        <div id="player-buttons">
          <div @click="handlePrevious">
            <img src="images/skip_previous-24px.svg" />
          </div>
          <div v-if="!this.$store.getters.getIsPlaying" @click="handlePlay">
            <img src="images/play_arrow-24px.svg" />
          </div>
          <div v-else-if="this.$store.getters.getIsPlaying" @click="handlePause">
            <img src="images/stop-24px.svg" />
          </div>
          <div @click="handleNext"><img src="images/skip_next-24px.svg" /></div>
        </div>
        <div id="song-time-wrapper">
          <div id="timer">
            <div id="song-current-time">{{getMinuteSecondTime(currentSongTime)}}</div>
            <ProgressBar @pause="handlePause" @play="handlePlay" @skipTo="handleRewind" v-bind:current="currentSongTime" v-bind:max="songTime"></ProgressBar>
            <div id="song-time">{{ getMinuteSecondTime(songTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from "@/components/ProgressBar";
export default {
  components: {ProgressBar},
  emits: ["songChanged"],
  name: "Player",
  data() {
    return {
      isPlaying: false,
      audio: null,
      currentSongTime: 0,
      songTime: 0,
    };
  },
  mounted() {
    this.audio = document.querySelector("#audio");
    this.audio.addEventListener('timeupdate', (e) => {
      const time = e.target.currentTime
      this.currentSongTime = Math.floor(time)
    })
    this.audio.addEventListener('ended', () => {
      this.handleNext()
    })
  },
  methods: {
    getMinuteSecondTime(time) {
      const minutes = Math.floor((time % 3600) / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds < 10 ? '0'+seconds : seconds}`
    },
    handlePlay() {
      const { songName, albumName, artist } = this.$store.getters.getCurrentlyPlayingSong
      if (!songName && !albumName && !artist) {
        this.handleNext()
        return
      }
      if (!this.$store.getters.getIsPlaying) {
        this.$store.dispatch("setIsPlaying", { isPlaying: true });
        this.audio.play();
      }
    },
    handlePause() {
      if (this.$store.getters.getIsPlaying) {
        this.$store.dispatch("setIsPlaying", { isPlaying: false });
        this.audio.pause();
      }
    },
    async handlePrevious() {
      const currentSong = this.$store.getters.getCurrentlyPlayingSong;
      const songList = this.$store.getters.getSongList;
      const currSongId = songList.findIndex(
        (item) =>
          item.songName === currentSong.songName &&
          item.albumName === currentSong.albumName &&
          item.artist === currentSong.artist
      );
      let newSong;
      let newSongId;
      if (currSongId === -1) {
        newSongId = songList.length - 1;
        newSong = songList[newSongId];
      } else if (currSongId !== 0) {
        newSongId = currSongId - 1;
        newSong = songList[newSongId];
      } else {
        newSongId = songList.length - 1;
        newSong = songList[newSongId];
      }
      const { songName, artist, albumName } = newSong;
      this.$emit("songChanged", {
        currSongId: newSongId,
        artist,
        albumName,
        songName,
      });
    },

    async handleNext() {
      const currentSong = this.$store.getters.getCurrentlyPlayingSong;
      const songList = this.$store.getters.getSongList;
      const previousSongId = songList.findIndex(
        (item) =>
          item.songName === currentSong.songName &&
          item.albumName === currentSong.albumName &&
          item.artist === currentSong.artist
      );
      let newSong;
      let newSongId;
      if (previousSongId !== songList.length - 1) {
        newSongId = previousSongId + 1;
        newSong = songList[newSongId];
      } else {
        newSongId = 0;
        newSong = songList[0];
      }
      const { songName, artist, albumName } = newSong;
      this.$emit("songChanged", {
        currSongId: newSongId,
        artist,
        albumName,
        songName,
      });
    },
    setSongTime(time) {
      this.songTime = Math.floor(time)
    },
    handleRewind(time) {
      this.audio.currentTime = this.audio.duration * time
    }
  },
};
</script>

<style scoped>
#timer {
  display: flex;
  flex-direction: row;
  width: 100%;
}
#player {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: darkslategrey;
  color: tomato;
  justify-content: center;
  align-items: center;
}
#player-control {
  flex-basis: 35%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#song-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
}

#song-time-wrapper {
  width: 100%;
  height: 30%;
  display: flex;
  padding-bottom: 10px;
}

#player-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-basis: 20%;
}
#song-details {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  flex-basis: 30%;
  align-items: center;
  justify-content: center;
  height: 100%;
}

@media (max-width: 680px) {
  #song-details {
    display: none;
  }
  #song-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  #player-control {
    flex-basis: 70%;
  }
}
</style>
