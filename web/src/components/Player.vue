<template>
  <div id="player">
    <div id="song-details">
      {{ this.$store.getters.getCurrentlyPlayingSong.artist }}
      <br />
      {{ this.$store.getters.getCurrentlyPlayingSong.albumName }}
      <br />
      {{ this.$store.getters.getCurrentlyPlayingSong.songName }}
    </div>
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
    <audio src="http://192.168.1.8:4000/"></audio>
  </div>
</template>

<script>
export default {
  emits: ['songChanged'],
  name: "Player",
  data() {
    return {
     isPlaying: false,
      audio: null
    }
  },
  mounted() {
    this.audio = document.querySelector('#audio')
  },
  methods: {
    handlePlay() {
      if (!this.$store.getters.getIsPlaying) {
        this.$store.dispatch("setIsPlaying", {isPlaying: true})
        this.audio.play()
      }
    },
    handlePause() {
      if (this.$store.getters.getIsPlaying) {
        this.$store.dispatch("setIsPlaying", {isPlaying: false})
        this.audio.pause()
      }
    },
    async handlePrevious() {
      const currentSong = this.$store.getters.getCurrentlyPlayingSong
      const songList = this.$store.getters.getSongList
      const currSongId = songList.findIndex(item => {
        if (item.songName === currentSong.songName && item.albumName === currentSong.albumName && item.artist === currentSong.artist) {
          return true
        }
      })
      let newSong
      let newSongId
      if (currSongId === -1) {
        newSongId = songList.length - 1
        newSong = songList[newSongId]
      }
      else if (currSongId !== 0) {
        newSongId = currSongId - 1
         newSong = songList[newSongId]
      } else {
        newSongId = songList.length - 1
        newSong = songList[newSongId]
      }
      const { songName, artist, albumName } = newSong
      this.audio.children[0].src = `http://192.168.1.8:4000/${artist}/${albumName}/${songName}`;
      await this.$store.dispatch('setIsPlaying', { isPlaying: true })
      await this.$store.dispatch('setCurrentlyPlayingSong', {songName, artist, albumName})
      this.$emit('songChanged', {currSongId: newSongId, artist, albumName, songName})
      this.audio.load()
      this.audio.play()
    },

    async handleNext() {
      const currentSong = this.$store.getters.getCurrentlyPlayingSong
      const songList = this.$store.getters.getSongList
      const previousSongId = songList.findIndex(item => {
        if (item.songName === currentSong.songName && item.albumName === currentSong.albumName && item.artist === currentSong.artist) {
          return true
        }
      })
      let newSong
      let newSongId
      if (previousSongId !== songList.length - 1) {
        newSongId = previousSongId + 1
        newSong = songList[newSongId]
      } else {
        newSongId = 0
        newSong = songList[0]
      }
      const { songName, artist, albumName } = newSong
      this.audio.children[0].src = `http://192.168.1.8:4000/${artist}/${albumName}/${songName}`;
      await this.$store.dispatch("setIsPlaying", {isPlaying: true})
      await this.$store.dispatch('setCurrentlyPlayingSong', {songName, artist, albumName})
      this.$emit('songChanged', {currSongId: newSongId, artist, albumName, songName})
      this.audio.load()
      this.audio.play()
    }
  }
}
</script>

<style scoped>
#player {
  display: flex;
  flex-direction: row;
  background: tomato;
  height: 100%;
  justify-content: flex-start;
  align-items: center;
}

#player-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-basis: 20%;
}
#song-details {
  flex-basis: 40%;
  align-items: center;
}
</style>
