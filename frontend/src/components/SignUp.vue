<template>
  <div class="surface-card p-4 shadow-8 border-round w-full">
    <div class="text-center mb-5">
      <img :src="require(`@/assets/pong.png`)" alt="Image" height="50" class="mb-3">
      <div class="text-900 text-3xl font-medium mb-3">Welcome</div>
    </div>

    <div>
      <label for="email1" class="block text-900 font-medium mb-2">Email</label>
      <InputText v-model="email" id="email1" type="text" class="w-full mb-3" @keyup.enter="SignUpPost()" />

      <label for="username1" class="block text-900 font-medium mb-2">Username</label>
      <InputText v-model="username" id="username1" type="text" class="w-full mb-3" @keyup.enter="SignUpPost()" />

      <label for="password1" class="block text-900 font-medium mb-2">Password</label>
      <InputText v-model="password" id="password1" type="password" class="w-full mb-3" @keyup.enter="SignUpPost()" />

      <div class="flex align-items-center justify-content-between mb-6">
        <div class="flex align-items-center text-indigo-300">
          <Checkbox :binary="true" v-model="checked" class="mr-2"></Checkbox>
          <label>Remember me</label>
        </div>
      </div>

      <Button @click="SignUpPost()" label="Sign Up" icon="pi pi-user" class="w-full"></Button>
    </div>
  </div>
</template>

<style>
#rememberme1 {
  color: #ed80d3;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import store from '@/store';
import router from '@/router';

export default defineComponent ({
  name: "SignUp",
  data() {
    return {
      email: "",
      username: "",
      password: "",
      checked: false,
    };
  },
  methods: {
    async SignUpPost() {
      
      await axios.post('/api/auth/local/signup', {
        email: this.email,
        username: this.username,
        password: this.password,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response: AxiosResponse) => {
        console.log(response);
        store.commit("setHash", response.data.access_token);
        store.commit("setHashRt", response.data.refresh_token);
        store.commit("setUserID", response.data.userId);
        router.push({path: '/profile'});
      })
      .catch((error: AxiosError) => {
        console.log(error);
        if (error.response && error.response.status == 403)
          window.alert("Signup failed : Email already exists");
        else
          window.alert("Signup failed :" + error);
      })
      if (!this.checked)
      {
        console.log("SignUpPost: finished and data safe");
        this.email = "";
        this.username = "";
        this.password = "";
      }
    },
  }
});
</script>
