const mutations = {
  SONG_MUTATION(state, song) {
    state.currentlyPlayingSong = song;
  },
  PLAYING_MUTATION(state, isPlaying) {
    state.isPlaying = isPlaying;
  },
  SONGLIST_MUTATION(state, data) {
    state.songList = data.parsedData;
  },
};

export default mutations;
