<template lang="pug">
SettingsForm
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameSettings } from '@/types/types';

import SettingsForm from '../component/SettingsForm.vue'

export default defineComponent({
  name: 'Home',
  components: {
    SettingsForm
  },
  beforeRouteLeave(
    from,
    to,
    next
  ) {
    this.$store.dispatch('setPreviousRoute', this.$route.fullPath);

    next();
  },
  computed: {
    settings(): GameSettings {
      return this.$store.state.settings;
    }
  }
})
</script>
