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
  }
}
</script>

<style lang="scss" scoped></style>
