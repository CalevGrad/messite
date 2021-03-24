<template>
  <div class="message">
    <div class="message-top-block">
      <div class="message-owner">{{ message.username }}</div>
      <div class="message-date">{{ message.date }}</div>
    </div>
    <div class="message-text" style="white-space: pre-line">{{ message.text }}</div>
  </div>
</template>

<script>
export default {
  name: "MessageItem",
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  filters: {
    paragraph(value) {
      console.log(value)
      return value.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }
  }
}
</script>