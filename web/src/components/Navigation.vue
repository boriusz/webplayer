<template>
<div id="nav-container">
  <ul>
    <li @click="handleAddToFavorites">Favorites</li>
  </ul>
</div>
</template>

<script>
export default {
  name: "Navigation",
  emits: ['loadFavorites'],
  methods: {
    handleAddToFavorites() {
      this.$emit('loadFavorites')
    }
  }
}
</script>

<style scoped>
#nav-container {
  height: 100%;
}
li {
  list-style-type: none;
}
ul {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-right: 2rem;
}

</style>
