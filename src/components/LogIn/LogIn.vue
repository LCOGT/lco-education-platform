<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const csrfToken = ref('')
const router = useRouter()

const fetchCsrfToken = async () => {
  try {
    const response = await fetch('http://observation-portal-dev.lco.gtn/accounts/login/?passthrough=true', {
      method: 'GET',
      credentials: 'include'
    })

    const text = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    const tokenElement = doc.querySelector('input[name=csrfmiddlewaretoken]')
    if (tokenElement) {
      csrfToken.value = tokenElement.value
      console.log('CSRF token fetched:', csrfToken.value)
    } else {
      console.error('CSRF token not found')
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error)
  }
}

const login = async () => {
  await fetchCsrfToken()

  if (!csrfToken.value) {
    alert('Failed to fetch CSRF token. Please try again.')
    return
  }

  const loginUrl = 'http://observation-portal-dev.lco.gtn/accounts/login/?passthrough=true'

  const formData = new URLSearchParams()
  formData.append('username', username.value)
  formData.append('password', password.value)
  formData.append('csrfmiddlewaretoken', csrfToken.value)

  console.log('Submitting login request with data:', {
    username: username.value,
    password: password.value,
    csrfmiddlewaretoken: csrfToken.value
  })

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken.value,
        'Referer': 'http://observation-portal-dev.lco.gtn/accounts/login/?passthrough=true'
      },
      credentials: 'include'
    })

    if (response.ok) {
      console.log('Login successful')
      router.push('/')
    } else {
      const errorText = await response.text()
      console.error('Login failed:', errorText)
      alert('Login failed. Please check your username and password.')
    }
  } catch (error) {
    console.error('Error during login:', error)
    alert('An error occurred during login. Please try again.')
  }
}
</script>

<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
        <button type="submit">Log In</button>
      </form>
    </div>
</template>
