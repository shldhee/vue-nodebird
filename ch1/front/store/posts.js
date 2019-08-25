export const state = () => ({
  mainPosts: [],
  hasMorePosts: true
})

const totalPosts = 101
const limit = 10 // backend에서 불러오는 수

export const mutations = {
  addMainPost(state, payload) {
    state.mainPosts.unshift(payload)
  },
  removeMainPost(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.id)
    state.mainPosts.splice(index, 1)
  },
  addComment(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId)
    state.mainPosts[index].Comments.unshift(payload)
  },
  loadPosts(state) {
    const diff = totalPosts - state.mainPosts.length
    const fakePosts = Array(diff > limit ? limit : diff)
      .fill()
      .map(v => ({
        id: Math.random().toString(),
        User: {
          id: 1,
          nickname: '빈희'
        },
        content: `Hello infinite Scroll~ ${Math.random()}`,
        Comments: [],
        Images: []
      }))
    state.mainPosts = state.mainPosts.concat(fakePosts)
    state.hasMorePost = fakePosts.length === limit
  }
}

export const actions = {
  add({ commit }, payload) {
    commit('addMainPost', payload)
    // commit('addMainPost', payload, { root: true});
  },
  remove({ commit }, payload) {
    commit('removeMainPost', payload)
  },
  addComment({ commit }, payload) {
    commit('addComment', payload)
  },
  loadPosts({ commit, state }, payload) {
    if (state.hasMorePosts) {
      commit('loadPosts', payload)
    }
  }
}
