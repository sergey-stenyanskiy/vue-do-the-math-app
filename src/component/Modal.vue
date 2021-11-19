<template lang="pug">
teleport(to="body")
  transition(name="fade")
    .modal-overlay(v-if="show" @click="$emit('overlay-clicked'), $emit('dialog-action', '')")
  transition(name="fade" @after-leave="$emit('fade-ended')")
    .modal(v-if="show" tabindex="-1" ref="modal")
      h2.modal-title
        slot(name="title")
      .mb-2
      .modal-content
        slot(name="content")
      .modal-actions
        .modal-action-confirm
          TextButton(@click="$emit('dialog-action', 'ok')")
            template(v-slot:child) На главный экран
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TextButton from './TextButton.vue'

export default defineComponent({
  name: 'Modal',
  components: {
    TextButton
  },
  props: {
    show: {
      type: Boolean,
      default: true
    },
  },
  emits: ['overlay-clicked', "fade-ended", "dialog-action"],
  watch: {
    show(value: boolean) {
      if (value) {
        this.$nextTick(this.focusModal);
      }
    }
  },
  methods: {
    focusModal() {
      const modal = this.$refs.modal as HTMLDivElement;

      modal.focus();
    },
  }
});
</script>

<style lang="scss" scoped>

.fade-enter-active, .fade-leave-active {
  opacity: 1;
  transition: opacity, 0.1s ease-in;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 1000;
  background: white;
  border-radius: 4px;
  width: 400px;
  padding: 16px;

  font-family: arial;

  box-shadow: 0 0 16px rgba(0,0,0,0.2);

  color: #828282;
}

.modal-title {
  font-weight: bold;
  font-size: 20px;
  margin: 0;
}

.modal-content {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.2);
  cursor: default;
  z-index: 999;
}
</style>