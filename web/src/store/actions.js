const actions = {
  setCurrentlyPlayingSong({ commit }, { songName, artist, albumName }) {
    commit("SONG_MUTATION", { songName, artist, albumName });
  },

  setIsPlaying({ commit }, { isPlaying }) {
    commit("PLAYING_MUTATION", isPlaying);
  },
  async setSongList({ commit }, { id }) {
    const response = await fetch("http://192.168.1.8:4000/songlist", {
      method: "POST",
      body: id,
    });
    const parsedData = await response.json();
    commit("SONGLIST_MUTATION", { parsedData });
  },
  setFixedSongList({ commit }, { parsedData }) {
    commit("SONGLIST_MUTATION", { parsedData });
  },
};

export default actions;
