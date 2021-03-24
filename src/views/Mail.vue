<template>
  <div class="center-block">

    <div class="header">
      <Header
          :user_descr="user_descr"
          @click-exit-button="clickExitButton"
      />
    </div>

    <div class="main">
      <div class="left-block">
        <div class="menu">
          <div class="search-box">
            <i class="fas fa-search unselectable" style="margin-right: 5px; color: #818181;"></i>
            <input ref="search_input" type="search" class="search" placeholder="Поиск"
                   v-model="search_text"
                   v-on:keyup.enter="performSearch">
            <button id="search-clean-button" v-if="search_text" v-on:click="cleanSearch">
              <i class="fas fa-times" style="color: #818181;"></i>
            </button>
          </div>
        </div>


        <DialogList
            :dialogs="dialogs"
            @click-dialog="clickDialog"
        />

      </div>

      <div class="right-block">
        <MessageList
            :messages="messages"
        />
        <div class="pen" v-show="isPenVisible" v-on:keyup.ctrl.enter="clickSendButton">
          <div id="send_text" class="pen-block-input" tabindex="0" contenteditable="true" role="textbox"
               aria-multiline="true"
               ref="sendTextInput"></div>
          <!--          <textarea id="send_text" class="pen-block-input" ref="sendTextInput"></textarea>-->
          <button class="send-button" v-on:click="clickSendButton">
            <i class="far fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import MessageList from '@/components/MessageList'
import DialogList from "@/components/DialogList";
import Header from "@/components/Header";
import axios from "axios";

export default {
  name: 'Mail',
  components: {
    MessageList,
    DialogList,
    Header
  },
  data: function () {
    return {
      isPenVisible: false,
      active_dialog: -1,
      search_text: '',
      config: '',
      messages: [],
      dialogs: [],
      user_descr: {id: '', username: '', password: ''},
    }
  },
  methods: {
    clickDialog(id) {
      let dia

      this.messages = []

      if (this.active_dialog !== -1)
        dia = this.dialogs.filter(t => t.id == this.active_dialog)[0].active = false

      dia = this.dialogs.filter(t => t.id == id)[0]
      dia.active = true
      this.active_dialog = id
      this.isPenVisible = true

      axios
          .get(this.ADDRS + "/dialogs/" + id + "/messages/?messageID=" + dia['idLastMessage'] + "&countMessages=" + this.COUNT_MESSAGES)
          .then(result => {
            for (let mes of result['data']['results']) {
              this.messages.unshift(this.messageProcessing(mes, dia.username))
            }
          })
          .finally(() => {
            this.scrollChatDown()
          })
    },
    scrollChatDown() {
      const messageList = document.getElementById('messages-list')
      messageList.scrollTop = messageList.scrollHeight
    },
    clickSendButton() {
      let message_text = encodeURIComponent(this.$refs.sendTextInput.innerText)
      if (message_text == "")
        return

      let data = {
        // "text": btoa(unescape(encodeURIComponent(document.getElementById("send_text").innerText))),
        "text": btoa(unescape(encodeURIComponent(message_text))),
        "dialogID": this.active_dialog,
      }

      console.log(message_text)
      this.$refs.sendTextInput.textContent = ""
      this.focusInput('sendTextInput')

      axios
          .post(this.ADDRS + '/messages/', data)
          .catch(() => {
            console.log("Error sending the message.")
          })
    },
    performSearch() {
      console.log(this.search_text)
    },
    focusInput: function (inputRef) {
      this.$refs[inputRef].focus();
    },
    cleanSearch() {
      this.search_text = ''
      this.focusInput('search_input')
    },
    clickExitButton() {
      localStorage.username = ''
      localStorage.password = ''
      localStorage.id = ''
      this.$router.push('/auth')
    },
    getDataForLongPolling() {
      let str = ''

      for (let i = 0; i < this.dialogs.length; i++) {
        str += i !== 0 ? " " : "";
        str += this.dialogs[i]['id'] + ' ' + this.dialogs[i]['idLastMessage']
      }

      return str
    },
    dialogProcessing(dialog, active) {
      dialog['textLastMessage'] = decodeURIComponent(escape(atob(dialog['textLastMessage'])))
      dialog['dateLastMessage'] = this.matchDate(dialog['dateLastMessage'])
      for (let val of dialog['owners'])
        if (Object.entries(val)[0][1] != this.user_descr.id)
          dialog['username'] = Object.entries(val)[0][0]
      dialog['active'] = active
      return dialog
    },
    messageProcessing(message, username) {
      message['text'] = decodeURIComponent(escape(atob(message['text'])))
      message['date'] = this.matchDate(message['date'])
      message['username'] = message['ownerID'] == this.user_descr.id ? this.user_descr.username : username
      return message
    },
    matchDate(date) {
      let match = date.match("(.*)-(.*)-(.*)T(.*:.*):.*")
      return match[3] + '.' + match[2] + '.' + match[1] + ' ' + match[4]
    },
    longPollProcessing(data) {
      let dialogsJSON = data['results']

      for (let i = 0; i < dialogsJSON.length; i++) {
        if (this.checkForEntryDialog(dialogsJSON[i]['id'])) {
          // this.dialogs = this.dialogs.filter(t => t.id !== dialogsJSON[i]['id'])
          this.dialogs[i] = this.dialogProcessing(dialogsJSON[i], this.dialogs[i].active)
          if (this.dialogs[i]['id'] === this.active_dialog)
            this.updateChat(this.dialogs[i])
          break
        }
        this.dialogs.unshift(this.dialogProcessing(dialogsJSON[i], false))
      }

      this.dialogs.sort((a, b) => {
        if (a['idLastMessage'] < b['idLastMessage']) return 1
        if (a['idLastMessage'] > b['idLastMessage']) return -1
        return 0
      })

      if (data['next'] !== null)
        axios
            .get(data['next'], this.config)
            .then(result => {
                  console.log(result.data)
                  this.longPollProcessing(result.data)
                  this.longPoll()
                }
            )
    },
    checkForEntryDialog(id) {
      for (let i = 0; i < this.dialogs.length; i++)
        if (this.dialogs[i]['id'] == id)
          return true
      return false
    },
    longPoll() {
      axios
          .get(this.ADDRS + '/users/' + this.user_descr.id + '/longpolling/?data=' + this.getDataForLongPolling(), this.config)
          .then(result => {
                console.log(result.data)
                this.longPollProcessing(result.data)
                this.longPoll()
              }
          )
          .catch(() => {
            this.$router.push('/auth')
          })
    },
    updateChat(dialog) {
      console.log("updateChat")
      axios
        .get(`${this.ADDRS}/dialogs/${dialog.id}/messages/?messageID=${dialog.idLastMessage}&countMessages=${this.COUNT_MESSAGES_FOR_UPDATE}`)
          .then(result => {
            console.log(result['data']['results'])
            for (let mes of result['data']['results']) {
              let message = this.messageProcessing(mes, dialog.username)
              if (message['ownerDialog'] === this.active_dialog) {
                if (this.messages.filter(t => t.id === message['id']).length === 0) {
                  console.log('+')
                  console.log(message)
                  this.messages.unshift(message)
                } else return
              } else return
            }
            this.updateChat(dialog)
          })
          .finally(() => {
            const messageList = document.getElementById('messages-list')
            if (messageList.scrollTop === messageList.scrollHeight)
              this.scrollChatDown()
          })
    },

  },
  mounted: function () {
    if (localStorage.username) this.user_descr['username'] = localStorage.username;
    if (localStorage.password) this.user_descr['password'] = localStorage.password;
    if (localStorage.id) this.user_descr['id'] = localStorage.id;

    this.config = axios.defaults
    this.config.headers['Authorization'] = 'Basic ' + btoa(this.user_descr['username'] + ':' + this.user_descr['password'])
    axios
        .get(this.ADDRS + '/users/check/', this.config)
        .catch(() => {
          localStorage.username = ''
          localStorage.password = ''
          localStorage.id = ''
          this.$router.push('/auth')
        })

    axios
        .get(this.ADDRS + '/users/' + this.user_descr.id + '/longpolling/?data=' + this.getDataForLongPolling(), this.config)
        .then(result => {
          console.log(result.data)
          this.longPollProcessing(result.data)
          this.longPoll()
        })
        .catch(() => {
          this.$router.push('/auth')
        })
  }
}
</script>

<style>
</style>