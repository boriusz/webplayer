<template>
  <div class="image-container">
    <img @click="handleClick" class="cover-image" :src="imageSource" alt="alternative">
  </div>
</template>

<script>
export default {
  name: "Cover",
  props: ["source", 'id', 'size'],
  emits: ['coverClick'],
  data() {
    return {
      imageSource: `http://192.168.1.8:4000/${this.source}`
    }
  },
  methods: {
    handleClick() {
      this.$emit('coverClick', this.id)
    }
  }
};
</script>

<style scoped>
.image-container {
  display: flex;
}
.cover-image {
  width: 100%;
  height: 100%;
}
</style>
