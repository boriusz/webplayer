<template>
  <div id="app">
    <audio ref="audio" id="audio" type="audio" controls><source type="audio/mp3" id="audio-source" /></audio>
    <header>
      <nav style="height: 100%">
        <Navigation @loadFavorites="loadSongs(-1)"></Navigation>
      </nav>
    </header>
    <section id="main">
      <div id="cover-wrapper">
        <Cover
            class="cover"
          v-for="item in covers"
          @coverClick="loadSongs"
          :key="item.id"
          :id="item.id"
          :source="item.artist + '/' + item.albumName + '/' + item.cover"
        ></Cover>
      </div>
      <div id="songs-container">
        <Song
          v-for="song in this.$store.getters.getSongList"
          :album-name="song.albumName"
          :key="song.id"
          :ref="'song'"
          :artist="song.artist"
          :song-name="song.songName"
          :size="song.songSize"
          @songChanged="handleSongChange"
          @setActive="setActiveSong"
        ></Song>
      </div>
    </section>
    <footer>
      <Player ref="player" @songChanged="handleSongChange"></Player>
    </footer>
  </div>
</template>

<script>
import Cover from "@/components/Cover";
import Song from "@/components/Song";
import Player from "@/components/Player";
import Navigation from "@/components/Navigation";

export default {
  name: "App",
  components: {
    Navigation,
    Player,
    Cover,
    Song,
  },
  data() {
    return {
      covers: [],
      songlist: [],
    };
  },
  async mounted() {
    const response = await fetch(`http://localhost:3000`);
    const parsedResponse = await response.json();
    const { data } = parsedResponse;
    data.forEach((el) => {
      this.covers.push({
        id: el.albumId,
        albumName: el.albumName,
        cover: el.albumCover,
        artist: el.artist,
      });
    });
    await this.loadSongs(0)

    const favoriteSongs = await fetch(`http://localhost:3000/favorites`)
    const parsedFavoriteSongs = await favoriteSongs.json()
    await this.$store.dispatch('setFavoriteSongs', parsedFavoriteSongs )
  },

  methods: {
    async loadSongs(id) {
      await this.$store.dispatch("setSongList", { id });
      await this.handleSongChange({ currSongId: -1 });
      this.setActiveSong()
    },
    async handleSongChange(data) {
      const { artist, albumName, songName } = data;
      if (artist && albumName && songName) {
        await this.$store.dispatch("setCurrentlyPlayingSong", {
          songName: songName,
          albumName: albumName,
          artist: artist,
          playing: true,
        });
        this.$refs.audio.children[0].src = `http://localhost:3000/${artist}/${albumName}/${songName}`;
        await this.$store.dispatch("setIsPlaying", { isPlaying: true });

        this.$refs.audio.load();
        this.$refs.audio.onloadeddata = (e) => {
          this.$refs.player.setSongTime(this.$refs.audio.duration)
          e.target.play();
          this.songTime = Math.floor(e.target.duration)
          e.target.ontimeupdate = (e) => {
            this.currentSongTime = Math.floor(e.target.currentTime)
          };
        };
        this.setActiveSong()
      }
    },
    setActiveSong() {
      const songList = this.$store.getters.getSongList;
      const currentlyPlayingSong = this.$store.getters.getCurrentlyPlayingSong
      const currSongId = songList.findIndex(
          (song) =>
              song.albumName === currentlyPlayingSong.albumName &&
              song.artist === currentlyPlayingSong.artist &&
              song.songName === currentlyPlayingSong.songName
      );
      this.$refs.song.forEach((song) => {
        song.isActive = false;
      });
      if (currSongId !== -1) {
        this.$refs.song[currSongId].isActive = true;
      }
    }
  },
};
</script>

<style>
::-webkit-scrollbar {
  width: 0;
  background: transparent;
}
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  background: rgba(0, 0, 0, .8);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  display: flex;
  flex-direction: column;
}

#audio {
  display: none;
}

#cover-wrapper {
  flex-basis: 25%;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow-y: scroll;
}

#songs-container {
  flex-basis: 75%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
}
footer {
  justify-self: flex-end;
  height: 10vh;
}
header {
  background: darkslategrey;
  color: tomato;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 10vh;
}

section {
  display: flex;
  flex-direction: row;
  height: 80vh;
  width: 100%;
  color: white;
  flex-grow: 0;
  align-items: flex-start;
  justify-content: center;
}

@media (max-width: 680px) {
 section {
   display: flex;
   flex-direction: column;
   height: 80vh;
   width: 100%;
   color: white;
   flex-grow: 0;
   align-items: flex-start;
   justify-content: center;
 }
  #cover-wrapper {
    flex-basis: auto;
    display: flex;
    flex-direction: row;
    height: 100%;
    flex-wrap: nowrap;
    position: relative;
    overflow-x: scroll;
  }
  .cover {
    width: 100%;
    flex-shrink: 0;
  }
  #songs-container {
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    width: 100%;
    flex-basis: 100%;
  }
}
</style>
