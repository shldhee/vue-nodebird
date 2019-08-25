<template>
  <v-container>
    <div>
      <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
    </div>
  </v-container>
</template>

<script>
import PostCard from '~/components/PostCard'

export default {
  components: {
    PostCard
  },
  data() {
    return {
      name: 'Nuxt.js'
    }
  },
  computed: {
    me() {
      return this.$store.state.users.me
    },
    mainPosts() {
      return this.$store.state.posts.mainPosts
    },
    hasMorePosts() {
      return this.$store.state.posts.hasMorePosts
    }
  },
  methods: {
    onScroll() {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (this.hasMorePosts) {
          this.$store.dispatch('posts/loadPosts')
        }
      }
    }
  },
  fetch({ store }) {
    store.dispatch('posts/loadPosts')
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  }
}
</script>

<style></style>
