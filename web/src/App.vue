<template>
  <div id="app">
    <audio id="audio" controls onended="handleEnd"><source id="audio-source"></audio>
    <header>Music Player</header>
    <section id="main">
      <div id="cover-wrapper">
        <Cover
          v-for="item in covers"
          @coverClick="loadSongs"
          v-bind:key="item.id"
          v-bind:id="item.id"
          v-bind:source="item.artist + '/' + item.albumName + '/' + item.cover"
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
        ></Song>
      </div>
    </section>
    <footer>
      <Player @songChanged="handleSongChange"></Player>
    </footer>
  </div>
</template>

<script>
import Cover from "@/components/Cover";
import Song from "@/components/Song";
import Player from "@/components/Player";

export default {
  name: "App",
  components: {
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
    const response = await fetch(`http://192.168.1.8:${4000}`);
    const parsedResponse = await response.json();
    const {data, responseData} = parsedResponse
    data.forEach((el) => {
      this.covers.push({
        id: el.albumId,
        albumName: el.albumName,
        cover: el.albumCover,
        artist: el.artist
      });
    });
    await this.$store.dispatch('setFixedSongList', { parsedData: responseData })
    this.handleSongChange({currSongId: -1})
  },

  methods: {
    async loadSongs(id) {
      await this.$store.dispatch('setSongList', {id})
      this.handleSongChange({currSongId: -1})
    },
    handleSongChange({currSongId}) {
      this.$refs.song.forEach(song => {
        song.isActive = false
      })
      if (currSongId !== -1) {
        this.$refs.song[currSongId].isActive = true
        return
      }
      const songList = this.$store.getters.getSongList
      const currSong = this.$store.getters.getCurrentlyPlayingSong
      const songId = songList.findIndex(item => {
        if (item.songName === currSong.songName && item.artist === currSong.artist && item.albumName === currSong.albumName) {
          return true
        }
      })
      if (songId === -1) {
        return
      }
      this.$refs.song[songId].isActive = true
    },
    handleEnd() {
      console.log('ended')
    }
  },

};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  height: 100vh;
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
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
}
footer {
  justify-self: flex-end;
  height: 10vh;
}
header {
  background: tomato;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10vh;
}

section {
  display: flex;
  flex-direction: row;
  height: 80vh;
  width: 100%;
  flex-grow: 0;
  align-items: flex-start;
  justify-content: center;

}
</style>
