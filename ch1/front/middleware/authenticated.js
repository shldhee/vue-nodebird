export default function({ store, redirect }) {
  if (!store.state.users.me) {
    redirect('/')
  }
}

// axios 등 하고 싶은거 다 할 수 있다.
// 페이지에 접근하기 전에 실행
