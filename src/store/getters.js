const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.user_name,
  user_code: state => state.user.user_code,
  user: state => state.user
}
export default getters
