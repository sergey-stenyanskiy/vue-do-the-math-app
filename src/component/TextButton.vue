<template lang="pug">
button.text-button(
  :type="type"
  @click="$emit('click')"
  :class="variantClass"
  :id="id"
  :disabled="disabled"
)
  slot(name="child")
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TextButton',
  props: {
    variant: {
      type: String,
      default: 'primary'
    },
    type: {
      type: String,
      default: 'button'
    },
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  emits: ['click'],
  computed: {
    variantClass() {
      return `text-button-${this.variant}`;
    }
  }
})
</script>

<style lang="scss" scoped>
.text-button {
  border: none;
  outline: none;
  background: transparent;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;

  padding: 2px 4px;
  border-radius: 4px;
}

.text-button-primary {
  transition: color, 0.2s linear;
  color: #29B6F6;
}

.text-button-primary:hover {
  color: #039BE5;
}

.text-button-primary:focus {
  color: #039BE5;
  background: #f4f4f4;
}

</style>