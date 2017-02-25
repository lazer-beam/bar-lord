import auth0 from 'auth0-js'
import Promise from 'bluebird'
import { EventEmitter } from 'events'
import { browserHistory } from 'react-router'

import { isTokenExpired } from './jwtHelper'

export default class CustomAuth extends EventEmitter {
  constructor(clientID, domain) {
    super()
    // Configure Auth0
    this.auth0 = new auth0.WebAuth({
      clientID,
      domain,
      responseType: 'token id_token',
      redirectUri: `${window.location.origin}/login`,
    })
    this.auth0.client.login = Promise.promisify(this.auth0.client.login)
    this.auth0.client.userInfo = Promise.promisify(this.auth0.client.userInfo)
    this.auth0.redirect.signupAndLogin = Promise.promisify(this.auth0.redirect.signupAndLogin)
   // this.auth0.parseHash = Promise.promisify(this.auth0.parseHash)

    this.login = this.login.bind(this)
    this.signup = this.signup.bind(this)
  }

  login(username, password) {
    const creds = { username, password, realm: 'Username-Password-Authentication' }
    this.auth0.client.login(creds).then(authResult => {
      this.setToken(authResult.accessToken, authResult.idToken)
      browserHistory.replace('/home')
    }).catch(err => console.log(err.description))
  }

  signup(email, password) {
    const creds = { email, password, connection: 'Username-Password-Authentication' }
    return this.auth0.redirect.signupAndLogin(creds)
  }

  parseHash(hash) {
    this.auth0.parseHash({ hash }).then(authResult => {
      this.setToken(authResult.accessToken, authResult.idToken)
      browserHistory.replace('/dashboard')
      return this.auth0.client.userInfo(authResult.accessToken)
    }).then(profile => {
      this.setProfile(profile)
    }).catch(err => {
      console.log(err)
    })
  }

  loggedIn() {
    const token = this.getToken()
    return !!token && !isTokenExpired(token)
  }

  setToken(accessToken, idToken) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('id_token', idToken)
  }

  setProfile(profile) {
    localStorage.setItem('profile', JSON.stringify(profile))
    this.emit('profile_updated', profile)
  }

  getProfile() {
    const profile = localStorage.getItem('profile')
    return profile ? JSON.parse(localStorage.profile) : {}
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token')
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token')
    localStorage.removeItem('profile')
  }
}