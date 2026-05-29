import DefaultTheme from 'vitepress/theme'
import CustomHome from './components/CustomHome.vue'
import BlogList from './components/BlogList.vue'
import HonorList from './components/HonorList.vue'
import PaperList from './components/PaperList.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomHome', CustomHome)
    app.component('BlogList', BlogList)
    app.component('HonorList', HonorList)
    app.component('PaperList', PaperList)
  }
}
