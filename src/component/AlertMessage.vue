<template lang="pug">
.alert-message(:class="`alert-message-${variant}`")
  | {{message}}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    message: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'success'
    },
  },
  computed: {
    variantClass() {
      return `alert-message-${this.variant}`;
    }
  }
})
</script>

<style lang="scss" scoped>
.alert-message {
  font-family: arial;
  font-size: 1.05em;
  border-radius: 4px;
  padding: 8px 16px;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  width: 180px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-message-success {
  color: #43A047;
  background: #C8E6C9;
}

.alert-message-warning {
  color: #FFC107;
  background: #FFF8E1;
}

.alert-message-info {
  color: #17A2B8;
  background: #D1ECF1;
}

.alert-message-danger {
  color: #C62828;
  background: #FFEBEE;
}
</style>