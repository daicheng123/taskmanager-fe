<template>
  <div v-loading="loading" class="layout-container">
    <h1 class="title">运维任务管理平台</h1>
    <div class="login">
      <div class="login_container">
        <h1 class="login-text">欢迎登录</h1>
        <el-form
          ref="userLoginFormData"
          :model="userLoginFormData"
          :rules="userLoginFormRules"
        >
          <el-form-item prop="email">
            <el-input
              v-model="userLoginFormData.email"
              prefix-icon="el-icon-user"
              placeholder="请填写邮箱地址"
            />
          </el-form-item>
          <el-form-item prop="userPassword">
            <el-input
              v-model="userLoginFormData.userPassword"
              type="password"
              prefix-icon="el-icon-lock"
              placeholder="请填写密码"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width: 100%;" @click="onUserLogin">登录</el-button>
          </el-form-item>
        </el-form>
        <span>
          <span style="font-size: 14px; color: rgba(0, 0, 0, 0.40);">没有账号？</span>
          <router-link to="/register" style="color: #3875f6;">立即注册</router-link>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      userLoginFormData: {
        email: '',
        userPassword: ''
      },
      userLoginFormRules: {
        email: [{ required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            pattern: RegExp('^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$'),
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          }],
        userPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    onUserLogin() {
      this.$refs.userLoginFormData.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/userLogin', this.userLoginFormData).then(res => {
            this.$router.push('/')
          }).catch(err => {
            this.$message({
              type: 'error',
              message: err
            })
          }).finally(res => {
            this.loading = false
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
  background-color: #999999;
  .title {
    font-size: 26px;
    font-weight: 400;
    color: $light_gray;
    margin: 50px auto 30px auto;
    text-align: center;
    font-weight: bold;
  }
  .login {
    position: absolute;  // 绝对定位符
    left: 50%;   // 距离左侧50%
    top: 50%;    // 距离右侧50%
    transform: translate(-50%,-50%);  // 分别在横轴和纵轴上位移
    display: flex;
    align-items: center;
    justify-content: center;
    // background: url();
    background-color: #999999;
    background-size: cover;
    .login_container{
      z-index: 100;
      width: 400px;
      min-height: 400px;
      padding: 0 40px;
      background: rgb(247, 243, 243);
      // transform: translate(-50%, -50%);
      box-shadow: 0 4px 8px 1px hsla(0, 0%, 47.5%, 0.2);
      .login-text{
         margin-top: 40px;
         margin-bottom: 40px;
         font-size: 22px;
      }
    }
  }

}
</style>
