<template lang="pug">
.app
  MainView
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MainView from './view/MainView.vue'

export default defineComponent({
  name: 'App',
  components: {
    MainView
  }
})
</script>

<style lang="scss">
.app {
  width: 600px;
  margin: auto;
}
</style>
