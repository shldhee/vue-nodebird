export const state = () => ({
  mainPosts: [],
  hasMorePosts: true,
  imagePaths: []
})

const totalPosts = 101
const limit = 10 // backend에서 불러오는 수

export const mutations = {
  addMainPost(state, payload) {
    state.mainPosts.unshift(payload)
    state.imagePaths = []
  },
  removeMainPost(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.id)
    state.mainPosts.splice(index, 1)
  },
  addComment(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId)
    state.mainPosts[index].Comments.unshift(payload)
  },
  loadComments({ commit, payload }) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId)
    state.mainPosts[index].Comments = payload
  },
  // loadPosts(state, payload) {
  //   if (payload.reset) {
  //     state.mainPosts = payload.data
  //   } else {
  //     state.mainPosts = state.mainPosts.concat(payload.data)
  //   }
  //   state.hasMorePost = payload.data.length === 10
  // },
  async loadPosts(state) {
    if (state.hasMorePost) {
      try {
        const res = await this.$axios.get(
          `http://localhost:3085/posts?offset=${state.mainPosts.length}&limit=10`
        )
        commit('loadPosts', res.data)
        console.log(state)
        return
      } catch (err) {
        console.error(err)
      }
    }
  },
  concatImagePaths(state, payload) {
    state.imagePaths = state.imagePaths.concat(payload)
  },
  removeImagePaht(state, payload) {
    state.imagePaths.splice(payload, 1)
  }
}

export const actions = {
  add({ commit, state }, payload) {
    this.$axios
      .post(
        'http://localhost:3085/post',
        {
          content: payload.content,
          imagePaths: state.imagePaths
        },
        {
          withCredentials: true
        }
      )
      .then(res => {
        commit('addMainPost', res.data)
      })
      .catch(() => {})
  },
  remove({ commit }, payload) {
    this.$axios
      .delete(`http://localhost:3085/post/${payload.postId}`, {
        withCredentials: true
      })
      .then(() => {
        commit('removeMainPost', payload)
      })
      .catch(err => {
        console.error(err)
      })
  },
  addComment({ commit }, payload) {
    commit('addComment', payload)
  },
  loadComment({ commit, payload }) {
    this.$axios
      .get(`http://localhost:3085/post/${payload.postId}/comments`)
      .then(res => {
        commit('loadComments', res.data)
      })
      .catch(err => {
        console.error(err)
        next(err)
      })
  },
  loadPosts({ commit, state }, payload) {
    if (state.hasMorePosts) {
      commit('loadPosts', payload)
    }
  },
  uploadImages({ commit }, payload) {
    this.$axios
      .post('http://localhost:3085/post/images', payload, {
        withCredentials: true
      })
      .then(res => {
        commit('concatImagePaths', res.data)
      })
      .catch(() => {})
  }
}
