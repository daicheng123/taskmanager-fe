<template>
  <div v-loading="loading">
    <el-card class="box-card" shadow="always">
      <div slot="header" class="clearfix">
        <span style="font-size:25px;font-weight: bold">用户信息</span>
      </div>
      <div class="boxing-item">
        <el-row>
          <el-col :span="4">用户名</el-col>
          <el-col :span="20">{{ userInfo.userCode }}</el-col>
        </el-row>
      </div>
      <el-divider />
      <div class="boxing-item">
        <el-row>
          <el-col :span="4">姓名</el-col>
          <el-col :span="20">{{ userInfo.userName }}</el-col>
        </el-row>
      </div>
      <el-divider />
      <div class="boxing-item">
        <el-row>
          <el-col :span="4">邮箱地址</el-col>
          <el-col :span="20">{{ userInfo.email }}</el-col>
        </el-row>
      </div>
      <el-divider />
      <div class="boxing-item">
        <el-row>
          <el-col :span="4">注册时间</el-col>
          <el-col :span="20">{{ userInfo.createdAt }}</el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>
<script>
import { getInfo } from '@/api/user'
export default {
  data() {
    return {
      userInfo: {
        userName: '',
        userCode: '',
        email: '',
        createdAt: undefined
      },
      loading: false
    }
  },
  created() {
    this.GetUserInfo()
  },

  methods: {
    // formatCreateDate(dateStr) {
    //   return formatDateTime(dateStr)
    // },
    async GetUserInfo() {
      this.loading = true
      await getInfo().then(res => {
        this.loading = false
        if (res.code === 0) {
          this.userInfo = res.data
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: err
        })
      })
    }
  }
}
</script>
<style  lang="scss" scoped>
.box-card{
  margin: 3vh 2vw;
  .boxing-item {
    margin: 5px;
    padding: 5px;
    color: #5f6368;
  }
}
</style>
