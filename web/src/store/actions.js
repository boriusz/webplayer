const actions = {
  setCurrentlyPlayingSong({ commit }, { songName, artist, albumName }) {
    commit("SONG_MUTATION", { songName, artist, albumName });
  },

  setIsPlaying({ commit }, { isPlaying }) {
    commit("PLAYING_MUTATION", isPlaying);
  },
  async setSongList({ commit, state }, { id }) {
    if (id === -1) {
      const parsedData = state.favoriteSongs;
      commit("SONGLIST_MUTATION", { parsedData });
      return;
    }
    const response = await fetch("http://192.168.1.8:4000/songlist", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: id,
    });
    const parsedData = await response.json();
    commit("SONGLIST_MUTATION", { parsedData });
  },
  setFixedSongList({ commit }, { parsedData }) {
    commit("SONGLIST_MUTATION", { parsedData });
  },
  setFavoriteSongs({ commit }, songList) {
    commit("FAVORITE_SONGS_MUTATION", songList);
  },
};

export default actions;
