<template>
  <div
    class="icon"
    :class="{ pointer: clickable }"
    @click="$emit('click')"
    @mouseover="isHovering = true"
    @mouseout="isHovering = false"
  >
    <div class="flex">
      <img :src="isHovering ? iconHoverPath : iconPath" />
      <span class="icon-text" :class="isHovering ? '' : 'muted'">
        <slot></slot>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    clickable: {
      type: Boolean,
      default: false,
    },
    icon: {
      required: true,
      type: String,
    },
    iconHover: {
      required: false,
      type: String,
      default: function () {
        return this.icon
      },
    },
  },
  data() {
    return {
      isHovering: false,
    }
  },
  computed: {
    iconPath() {
      return require(`@/assets/images/${this.icon}.svg`)
    },
    iconHoverPath() {
      return require(`@/assets/images/${this.iconHover}.svg`)
    },
  },
}
</script>

<style lang="scss" scoped>
$icon-height: 24px;

.icon {
  display: inline-block;
  line-height: $icon-height;
  img {
    height: $icon-height;
    width: $icon-height;
    margin-right: 0.3rem;
  }
  .icon-text {
    color: $dark;
    font-size: 0.8rem;
  }
}
</style>
