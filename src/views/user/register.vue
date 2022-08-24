<template>
  <div
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-background="rgba(0, 0, 0, 0.5)"
  >
    <div class="layout-container">
      <h1 class="title">运维任务管理平台</h1>
      <div class="register">
        <div class="block-title">
          <!-- <span style="font-size: 19px; line-height: 30px;">欢迎注册</span> -->
          <span style="line-height: 30px;opacity: 0.6;">
            已有账号？
            <router-link to="/login" style="color: rgb(56, 117, 246);">立即登录</router-link>
          </span>
        </div>
        <div class="register_container">
          <el-form
            ref="createForm"
            class="register-form"
            :model="createForm"
            :rules="createFormRules"
            label-position="left"
            label-width="120px"
          >
            <el-form-item label="邮箱地址:" prop="email">
              <el-input v-model="createForm.email" placeholder="请填写邮箱地址" />
            </el-form-item>
            <el-form-item label="邮箱验证码:" prop="emailCode">
              <div>
                <el-input
                  v-model="createForm.emailCode"
                  placeholder="请填写收到的邮箱验证码"
                  style="width: calc(100% - 130px);"
                />
                <el-button
                  type="danger"
                  style="width: 120px; margin-left: 10px; text-align: center;"
                  :disabled="createForm.mail === '' || !enableGetEmail"
                  @click="handleGetEmailCode"
                >{{ getEmailButtonValue }}</el-button>
              </div>
            </el-form-item>
            <el-form-item label="姓名:" prop="userName">
              <el-input
                v-model="createForm.userName"
                prefix-icon="el-icon-user"
                placeholder="请输入姓名"
              />
            </el-form-item>
            <el-form-item label="用户名:" prop="userCode">
              <el-input
                v-model="createForm.userCode"
                prefix-icon="el-icon-user"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item label="密码:" prop="userPassword">
              <el-input
                v-model="createForm.userPassword"
                type="password"
                prefix-icon="el-icon-lock"
                placeholder="请填写密码"
              />
            </el-form-item>
            <el-form-item label="确认密码:" prop="userPassword2">
              <el-input
                v-model="createForm.userPassword2"
                type="password"
                prefix-icon="el-icon-lock"
                placeholder="请确认密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%;" @click="onCreateSubmit">注 册</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { checkEmailExists, checkUserCodeExists, getEmailCode, createUser } from '@/api/user'
export default {
  data() {
    var validateEmail = (rule, value, callback) => {
      checkEmailExists({ email: value }).then(res => {
        if (res.data != null) {
          callback(new Error('邮箱已使用'))
        } else {
          callback()
        }
      })
    }

    var validateUserCode = (rule, value, callback) => {
      checkUserCodeExists({ userCode: value }).then(res => {
        if (res.data != null) {
          callback(new Error('用户名已存在'))
        } else {
          callback()
        }
      })
    }

    var validateUserPwsd_repeat = (rule, value, callback) => {
      if (value === this.createForm.userPassword) {
        callback()
      } else {
        callback(new Error('两次输入密码不一致'))
      }
    }
    return {
      createForm: {
        email: '',
        emailCode: '',
        userName: '',
        userCode: '',
        userPassword: '',
        userPassword2: ''
      },
      fullscreenLoading: false,
      getEmailButtonValue: '发送验证码',
      emailTimeout: 60,
      enableGetEmail: true,
      createFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        emailCode: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        userCode: [{ required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: RegExp('[0-9a-zA-Z]{6,20}'), message: '用户名 6-20 位，且只能包含小写字母及数字', trigger: 'blur' },
          { validator: validateUserCode, trigger: 'blur' }],
        userPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          // 正则？
          {
            pattern: RegExp('(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}'),
            message: '密码必须在 8-16 位，且同时包含大小写字母及数字',
            trigger: 'blur',
            required: true
          }
        ],
        userPassword2: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          // 正则？
          { validator: validateUserPwsd_repeat, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleGetEmailCode() {
      this.$refs.createForm.validateField('email', error => {
        if (error) {
          return false
        } else {
          this.enableGetEmail = false
          getEmailCode({
            email: this.createForm.email
          }).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '验证码推送成功'
              })
            } else {
              this.$message({
                type: 'error',
                message: res.msg
              })
            }
          }).catch(err => {
            console.log(err)
            this.$message({
              type: 'error',
              message: err
            })
          })
          const clock = window.setInterval(() => {
            this.emailTimeout--
            this.getEmailButtonValue = this.emailTimeout
            if (this.emailTimeout < 0) {
              window.clearInterval(clock)
              this.getEmailButtonValue = '点击发送验证码'
              this.emailTimeout = 60
              this.enableGetEmail = true
            }
          }, 1000)
        }
      })
    },
    onCreateSubmit() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          this.fullscreenLoading = true
          createUser(this.createForm).then(res => {
            if (res.code === 0) {
              this.fullscreenLoading = false
              this.$router.push({ path: '/login' })
              this.$message({
                type: 'success',
                message: '用户注册成功！请登录'
              })
            } else {
              this.$message({
                type: 'error',
                message: `用户注册失败: ${res.msg}`
              })
            }
          }).catch(err => {
            console.log(err)
            this.$message({
              type: 'error',
              message: err
            })
          })
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
$dark_gray:#889aa4;
$light_gray:#eee;
.layout-container{
  position: fixed;
  height: 100%;
  width: 100%;
  scroll-behavior: auto;
  background-color: #999999;
  .title {
    font-size: 26px;
    font-weight: 400;
    color: $light_gray;
    margin: 50px auto 30px auto;
    text-align: center;
    font-weight: bold;
  }
  .register {
    background-color: #999999;
    background-size: cover;
    position: absolute;
    left: calc(50% - 300px);
    .block-title{
      text-align: left;
      margin-bottom: 1vh;
    }
    .register_container{
      z-index: 100;
      width: 600px;
      min-height: 400px;
      padding: 40px 40px;
      background: rgb(247, 243, 243);
      box-shadow: 0 4px 8px 1px hsla(0, 0%, 47.5%, 0.2);
      .login-text{
         margin-top: 40px;
         margin-bottom: 40px;
         font-size: 22px;
      }
    }
  }
}

.register-form{
    width: 450px;
    margin: 0 auto;
}
</style>
