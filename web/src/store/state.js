const state = {
  songList: [
    {
      albumName: "",
      artist: "",
      id: "",
      songName: "",
      size: null,
    },
  ],
  currentlyPlayingSong: {
    songName: "",
    albumName: "",
    artist: "",
  },
  isPlaying: false,
  favoriteSongs: [],
};
export default state;
