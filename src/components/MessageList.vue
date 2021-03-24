<template>
    <div id="messages-list" class="messages-box">
      <MessageItem
          v-for="message of messages"
          :key="message.id"
          :message="message"
      />
    </div>
</template>

<script>
import MessageItem from "@/components/MessageItem";
export default {
  name: "MessageList",
  components: {
    MessageItem
  },
  props: ['messages'],
  comments: {
    MessageItem
  }
}
</script>