<template>
  <div ref="bar" id="progress-bar">
    <div
      :style="{ width: (current / max) * 100 + '%' }"
      id="current-time"
    ></div>
  </div>
</template>

<script>
export default {
  emits: ["skipTo"],
  props: ["current", "max"],
  name: "ProgressBar",
  mounted() {
    this.$refs.bar.addEventListener("mousedown", (e) => {
      let clickedMultiplier
      const wasPlaying = this.$store.getters.getIsPlaying
      const bar = this.$refs.bar
      clickedMultiplier =
          (e.pageX - bar.offsetLeft) / bar.offsetWidth;
      this.$emit("skipTo", clickedMultiplier);
      this.$emit('pause')
      document.onmousemove = (e) => {
        clickedMultiplier =
          (e.pageX - bar.offsetLeft) / bar.offsetWidth;
        this.$emit("skipTo", clickedMultiplier);
      };
      document.onmouseup = (e) => {
        clickedMultiplier =
          (e.pageX - bar.offsetLeft) / bar.offsetWidth;
        this.$emit("skipTo", clickedMultiplier);
        if (wasPlaying) this.$emit('play')
        document.onmousemove = null;
        document.onmouseup = null
      };
    });
  },
};
</script>

<style scoped>
#progress-bar {
  width: 100%;
  height: 80%;
  display: flex;
  overflow: hidden;
  flex-direction: row;
  margin: 0 5px;
  background: grey;
  border-radius: 7px 7px 7px 7px;
}
#current-time {
  background: whitesmoke;
  display: inline-block;
  /*border-radius: 7px 0 0 7px;*/
}
</style>
