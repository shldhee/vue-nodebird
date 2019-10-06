<template>
  <div>
    <v-container v-if="post">
      <post-card :post="post"></post-card>
    </v-container>
    <v-container v-else>"해당 게시물이 존재하지 않습니다."</v-container>
  </div>
</template>

<script>
import PostCard from '~/components/PostCard'
export default {
  components: {
    PostCard
  },
  computed: {
    post() {
      return this.$store.state.posts.mainPosts.find(
        v => v.id === parseInt(this.$route.params.id, 10)
      )
    }
  },
  fetch({ store, params }) {
    return store.dispatch('posts/loadPost', params.id)
  },
  head() {
    return {
      title: `${this.post.User.nickname}님의 게시글`,
      meta: [
        {
          hid: 'desc',
          name: 'description',
          content: this.post.content
        },
        {
          hid: 'ogtitle',
          property: 'og:title',
          content: `${this.post.User.nickname}님의 게시글`
        },
        {
          hid: 'ogdesc',
          property: 'og:description',
          content: this.post.content
        },
        {
          hid: 'ogimage',
          property: 'og:image',
          content: this.post.Images[0]
            ? this.post.Images[0].src
            : 'https://vue.nodebird.com/vue-nodebird.png'
        },
        {
          hid: 'ogurl',
          property: 'og:url',
          content: `https://vue.nodebird.com/post/${this.post.id}`
        }
      ],
      link: [{ rel: 'shortcut icon', href: '/vue-nodebird.png' }]
    }
  }
}
</script>

<style lang="scss" scoped></style>
