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
    this.$refs.bar.addEventListener("click", (e) => {
      const clickedMultiplier =
        ((e.pageX - e.target.offsetLeft) / e.currentTarget.offsetWidth);

      this.$emit("skipTo", clickedMultiplier);
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
