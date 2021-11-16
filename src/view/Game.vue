<template lang="pug">
| Game screen
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "Game",
  beforeRouteLeave(
    from,
    to,
    next
  ) {
    this.$store.dispatch('setPreviousRoute', this.$route.fullPath);

    next();
  }
})
</script>

<style lang="scss" scoped>

</style>