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
    mainPosts() {
      return this.$store.state.posts.mainPosts
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
  fetch({ store, params }) {
    return store.dispatch('posts/loadHashtagPosts', {
      hashtag: encodeURIComponent(params.id),
      reset: true
    })
  },
  mounted() {
    // this.$route.params.id
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  }
}
</script>

<style></style>
