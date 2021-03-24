<template>
  <div class="dialogs-box">
    <DialogItem
      v-for="dialog of dialogs"
      :key="dialog.id"
      :dialog="dialog"
      @click-dialog="clickDialog"
    />
  </div>
</template>

<script>
import DialogItem from "@/components/DialogItem";

export default {
  name: "DialogList",
  props: ['dialogs'],
  components: {
    DialogItem
  },
  methods: {
    clickDialog(id) {
      this.$emit('click-dialog', id)
    }
  }
}
</script>
