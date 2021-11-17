<template lang="pug">
button.round-button(
  :type="type"
  :name="name"
  :id="id"
  :class="[customClass, variantClass]"
  :style="sizeStyle"
)
  slot(name="child")
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RoundButton',
  props: {
    variant: {
      type: String,
      default: 'red'
    },
    type: {
      type: String,
      default: 'button'
    },
    name: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
    class: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '20px'
    }
  },
  computed: {
    customClass() {
      return this.class;
    },
    variantClass() {
      return `round-button-${this.variant}`;
    },
    sizeStyle() {
      return {
        width: this.size,
        height: this.size,
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.round-button {
  border-radius: 100%;
  border: none;
  outline: none;
  font-family: arial;
  font-weight: bold;
  color: black;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  transition: box-shadow, 0.1s ease-in;
}

.round-button:focus {
  box-shadow: 0 2px 4px 2px rgba(0,0,0,0.2);
}

.round-button-red {
  background: #F9734D;
}

.round-button-grey {
  background: #7A7A7A;
}
</style>