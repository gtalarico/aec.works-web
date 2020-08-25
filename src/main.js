import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './filters'

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

import VueWaypoint from 'vue-waypoint'
import { debounce } from './utils'

Vue.use(VueWaypoint)
// Vue.use(VueFormulate)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// window.addEventListener('scroll', debounce(() => {
//   const dist = document.defaultView.scrollY
//   document.querySelector('.sidebar').style.marginTop = `${dist}px`
// }))
// window.removeEventListener('scroll')
