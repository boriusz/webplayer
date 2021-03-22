const getters = {
  getCurrentlyPlayingSong(state) {
    return state.currentlyPlayingSong;
  },
  getIsPlaying(state) {
    return state.isPlaying;
  },
  getSongList(state) {
    return state.songList;
  },
  getFavoriteSongsList(state) {
    return state.favoriteSongs;
  },
};

export default getters;
