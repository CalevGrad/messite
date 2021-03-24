<template>
  <div class="center-block"
       v-on:keyup.enter="EnterButtonClick">
    <div class="header">
      <div class="name-text unselectable">GRADIENT MESSAGER</div>
    </div>
    <div class="authorization">
      <div class="auth-text">АВТОРИЗАЦИЯ</div>
      <div style="text-align: center;"
           v-bind:class="{'red': !regent, 'green': regent}"
      >
        {{ message }}
      </div>
      <input type="login" id="username" class="auth-input" placeholder="Имя пользователя"
             v-model="username"
             v-on:keyup.enter="EnterButtonClick"
      >
      <input type="password" id="password" class="auth-input" placeholder="Пароль"
             v-model="password"
      >
      <div class="auth-buttons">
        <button id="button-enter" class="auth-button" v-on:click="EnterButtonClick">Войти</button>
        <button id="button-registration" class="auth-button" v-on:click="RegistrationButtonClick">Регистрация</button>
      </div>
    </div>
  </div>
</template>

<script>

import axios from "axios";

export default {
  name: "Auth",
  data() {
    return {
      message: '',
      regent: false,
      username: '',
      password: '',
      id: '',
    }
  },
  methods: {
    RegistrationButtonClick() {
      let data = {
        "username": this.username,
        "password": this.password
      }
      axios
          .post(this.ADDRS + '/users/', data)
          .then(() => {
            this.regent = true
            this.message = 'Регистрация прошла успешно!'
          })
          .catch(() => {
            this.regent = false
            this.message = 'Ошибка при регистрации!'
          })
    },
    EnterButtonClick() {
      let config = axios.defaults
      config.headers['Authorization'] = 'Basic ' + btoa(this.username + ':' + this.password)

      axios
          .get(this.ADDRS + '/users/check/', config)
          .then(result => {
            this.regent = true
            this.message = 'Авторизация прошла успешно!'
            localStorage.username = this.username
            localStorage.password = this.password
            localStorage.id = result.data.results['0']['id']
            this.$router.push('/')
          })
          .catch(() => {
            this.regent = false
            this.message = 'Ошибка при авторизации!'
          })
    }
  },
  mounted() {
    if (localStorage.username) this.username = localStorage.username;
    if (localStorage.password) this.password = localStorage.password;
    if (localStorage.id) this.id = localStorage.id;

    let config = axios.defaults
    config.headers['Authorization'] = 'Basic ' + btoa(this.username + ':' + this.password)
    axios
        .get(this.ADDRS + '/users/check/', config)
        .then(() => {
          this.$router.push('/')
        })
  },
}
</script>

<style scoped>
.red {
  color: red;
}

.green {
  color: green;
}
</style>

<!--Authorization, Base64(Basic user:password)-->