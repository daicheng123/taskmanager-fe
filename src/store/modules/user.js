import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    user_id: undefined,
    token: getToken(),
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    user_name: '',
    user_code: '',
    email: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_NAME: (state, user_name) => {
    state.user_name = user_name
  },
  SET_USER_CODE: (state, user_code) => {
    state.user_code = user_code
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_USER_ID: (state, user_id) => {
    state.user_id = user_id
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  userLogin({ commit }, loginData) {
    return new Promise((resolve, reject) => {
      login(loginData).then(res => {
        const { code, data } = res
        if (code !== 0) {
          return reject(res)
        }
        commit('SET_TOKEN', data)
        setToken(data)
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(res => {
        const { code, data } = res
        if (code !== 0) {
          return reject(res)
        }
        commit('SET_USER_NAME', data.userName)
        commit('SET_USER_CODE', data.userCode)
        commit('SET_EMAIL', data.email)
        commit('SET_USER_ID', data.id)

        if (data.avatar) {
          commit('SET_AVATAR', data.avatar)
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 登出
  LogOut({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        // commit('SET_ROLES', [])
        removeToken()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

// get user info
// getInfo({ commit, state }) {
//   return new Promise((resolve, reject) => {
//     getInfo(state.token).then(response => {
//       const { data } = response

//       if (!data) {
//         return reject('Verification failed, please Login again.')
//       }
//       const { name, avatar } = data
//       commit('SET_NAME', name)
//       commit('SET_AVATAR', avatar)
//       resolve(data)
//     }).catch(error => {
//       reject(error)
//     })
//   })
// },

// user login
// login({ commit }, userInfo) {
//   const { username, password } = userInfo
//   return new Promise((resolve, reject) => {
//     login({ username: username.trim(), password: password }).then(response => {
//       const { data } = response
//       commit('SET_TOKEN', data.token)
//       setToken(data.token)
//       resolve()
//     }).catch(error => {
//       reject(error)
//     })
//   })
// },

