const mutations = {
  SONG_MUTATION(state, song) {
    state.currentlyPlayingSong = song;
  },
  PLAYING_MUTATION(state, isPlaying) {
    state.isPlaying = isPlaying;
  },
  SONGLIST_MUTATION(state, data) {
    console.log(data.parsedData);
    state.songList = data.parsedData;
    console.log(state.songList);
  },
  FAVORITE_SONGS_MUTATION(state, songList) {
    state.favoriteSongs = songList;
  },
};

export default mutations;
