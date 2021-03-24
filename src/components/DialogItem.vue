<template>
  <div class="dialog"
       v-on:click="$emit('click-dialog', dialog.id)"
       v-bind:class="{'dialog-active': dialog.active}"
  >
    <div class="dialog-username">{{ dialog.username }}</div>
    <div class="dialog-date">{{ dialog.dateLastMessage }}</div>
    <div class="dialog-text">
<!--      <span class="dia-who" v-if="dialog.owner">Вы:</span> -->
      <span class="dia-text">{{ dialog.textLastMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "DialogItem",
  props: {
    dialog: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

</style>