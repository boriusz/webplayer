<template>
  <div
    :class="isActive ? 'song-active' : 'song'"
    @mouseover="isHover = true"
    @mouseout="isHover = false"
  >
    <div class="album-name">{{ albumName }}</div>
    <div class="song-name">{{ songName.replace(/.mp3/, "") }}</div>
    <div class="song-size">
      {{ Math.round((size / 1024 / 1024) * 100) / 100 }}MB
    </div>
    <div class="hoverable" v-show="isHover">
      <div class="song-play" @click="handlePlayPause">
        {{ this.$store.getters.getIsPlaying && isActive ? "Stop" : "Play" }}
      </div>
      <div
        v-if="
          !this.$store.getters.getFavoriteSongsList.find(
            (el) =>
              el.songName === songName &&
              el.artist === artist &&
              el.albumName === albumName
          )
        "
        class="add-to-favorite"
        @click="handleAddToFavorites"
      >
        Add
      </div>
      <div
        v-else
        class="add-to-favorite"
        @click="handleRemoveFromFavorities"
      >
        Remove
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Song",
  emits: ["songChanged"],
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
    handlePlayPause() {
      const currSongPlaying = this.$store.getters.getCurrentlyPlayingSong;
      const isPlaying = this.$store.getters.getIsPlaying;

      if (isPlaying && currSongPlaying?.songName === this.songName) {
        this.$store.dispatch("setIsPlaying", { isPlaying: false });
        this.audio.pause();
        return;
      }
      if (!isPlaying && currSongPlaying?.songName === this.songName) {
        this.$store.dispatch("setIsPlaying", { isPlaying: true });
        this.audio.play();
        return;
      }
      this.$emit("songChanged", this);
    },
    async handleAddToFavorites() {
      const { albumName, songName, artist, size } = this;
      const songData = { albumName, songName, artist, size };
      const favoriteSongs = this.$store.getters.getFavoriteSongsList;
      const isAlreadyFavorite = favoriteSongs.find(
        (song) =>
          song.albumName === albumName &&
          song.artist === artist &&
          song.songName === songName
      );
      if (isAlreadyFavorite) {
        await this.handleRemoveFromFavorities();
        return;
      }
      favoriteSongs.push({
        albumName,
        artist,
        songName,
        songSize: size
      });
      await this.$store.dispatch("setFavoriteSongs", favoriteSongs);
      const body = JSON.stringify({ data: songData });
      await fetch("http://localhost:3000/addToFavorites", {
        headers: {'Content-Type': 'application/json'},
        method: "POST",
        body,
      });
    },
    async handleRemoveFromFavorities() {
      let reload = false
      const { albumName, songName, artist } = this;
      const songData = { albumName, songName, artist };
      if (this.$store.getters.getFavoriteSongsList === this.$store.getters.getSongList) {
        reload = true
      }
      const body = JSON.stringify({ data: songData });
      const favoriteSongs = await this.$store.getters.getFavoriteSongsList;
      const filteredSongs = favoriteSongs.filter((item) =>
        item.songName !== songName
      );
      await this.$store.dispatch("setFavoriteSongs", filteredSongs);
      await fetch("http://localhost:3000/removeFromFavorities", {
        headers: {'Content-Type': 'application/json'},
        method: "POST",
        body,
      });
      if (reload) {
        await this.$store.dispatch('setSongList', {id: -1})
        this.$emit('setActive')
      }
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
  margin: .3rem 0;
}

.hoverable {
  display: flex;
  justify-content: space-around;
  flex-basis: 10%;
  flex-grow: 1;
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
  text-align: left;
}

.song-size {
  flex-basis: 20%;
}

@media (max-width: 680px) {
  .album-name {
    display: none;
  }
  .song-size {
    display: none;
  }
  .song, .song-active {
    justify-content: flex-start;
    padding-left: 2rem;
    margin: .5rem 0;
  }
}
</style>
