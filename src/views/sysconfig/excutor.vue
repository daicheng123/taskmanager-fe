<template>
  <div
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="拼命加载中"
    element-loading-background="rgba(0, 0, 0, 0.5)"
  >
    <div class="operateButtons">
      <el-button icon="el-icon-edit" type="success" @click="handleAdd">新增节点</el-button>
      <el-button :loading="refreshLoading" icon="el-icon-refresh" type="warning" @click="refreshNode({ 'type': 'all'})">刷新节点</el-button>
      <el-button icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
      <div class="searchOption">
        <el-input v-model="listQuery.hostName__icontains" class="searchInput" placeholder="请输入节点名称" clearable @keyup.enter.native="loadData" />
        <el-input v-model="listQuery.ipAddr__icontains" class="searchInput" placeholder="请输入节点ip" clearable @keyup.enter.native="loadData" />
        <el-select v-model="listQuery.status" class="searchInput" placeholder="请选择状态" clearable @change="loadData">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
    </div>
    <el-dialog :visible.sync="dialogShow" title="执行器节点信息" @closed="close">
      <el-row :gutter="20">
        <el-form
          ref="elForm"
          class="executorForm"
          :model="formData"
          :rules="formRules"
          size="medium"
          label-width="100px"
        >
          <el-col :span="14">
            <el-form-item label="节点名称" prop="hostName">
              <el-input
                v-model="formData.hostName"
                :maxlength="100"
                :style="{width: '90%'}"
                placeholder="请输入节点名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="IP地址" prop="ipAddr">
              <el-input
                v-model="formData.ipAddr"
                :maxlength="100"
                :style="{width: '90%'}"
                placeholder="请输入节点ip地址"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="SSH端口" prop="sshPort">
              <el-input
                v-model="formData.sshPort"
                :maxlength="5"
                :style="{width: '80%'}"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="登陆账号" prop="accountName">
              <el-input
                v-model="formData.accountName"
                :maxlength="100"
                :style="{width: '90%'}"
                placeholder="请输入用户名(root)"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="登陆密码" prop="accountPassword">
              <el-input
                v-model="formData.accountPassword"
                :maxlength="30"
                :style="{width: '90%'}"
                placeholder="请输入登陆密码"
                clearable
                show-password
              />
              <el-tooltip content="点击进行连接测试。" placement="right">
                <el-button :loading="testLoading" type="text" size="mini" icon="el-icon-sort" style="margin-left: 5px;" @click="testNode()" />
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="密钥分发">
              <el-checkbox v-model="formData.shouldDelivery" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="执行路径" prop="executePath">
              <el-input
                v-model="formData.executePath"
                :maxlength="500"
                :style="{width: '90%'}"
                placeholder="请输入任务运行目录"
              />
            </el-form-item>
          </el-col>
          <el-col :span="23">
            <el-form-item label="备注信息" prop="remarks">
              <el-input
                v-model="formData.remarks"
                :maxlength="500"
                :autosize="{minRows: 4, maxRows: 8}"
                :style="{width: '100%'}"
                type="textarea"
                placeholder="请输入备注信息"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :push="17">
            <el-button type="danger" @click="close()">取消</el-button>
            <el-button v-if="basicStatus=='create'" type="success" @click="saveNode()">保存</el-button>
            <el-button v-else-if="basicStatus=='update'" type="success" @click="update()">更新</el-button>
          </el-col>
        </el-form>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      fullscreenLoading: false,
      refreshLoading: false,
      testLoading: false,
      dialogShow: false,
      listQuery: {
        status: undefined

      },
      basicStatus: 'create',
      formData: {
        hostName: '',
        ipAddr: '',
        sshPort: 22,
        accountName: '',
        accountPassword: '',
        executePath: '',
        shouldDelivery: undefined,
        remarks: ''
      },
      formRules: {
        hostName: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
        ipAddr: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
        sshPort: [{ required: true, message: '请输入SSH端口', trigger: 'blur' }],
        accountName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        accountPassword: [{ required: true, message: '请输入登陆密码', trigger: 'blur' }],
        executePath: [{ required: true, message: '请输入任务运行目录', trigger: 'blur' }]

      },
      statusOptions: [
        { label: '未知', value: 0 },
        { label: '正常', value: 1 },
        { label: '不可达', value: 2 }
      ]
    }
  },
  methods: {
    handleAdd() {
      this.dialogShow = true
    },
    batchDelete() {},
    refreshNode() {},
    loadData() {},
    testNode() {},
    close() {
      this.dialogShow = false
    },
    saveNode() {
      this.$refs.elForm.validate(valid => {
        if (valid) {
            
        } else {
          this.$message.error('请校验输入信息合法性')
          return false
        }
      })
    }
  }
}
</script>
<style  lang="scss" scoped>
.operateButtons{
    // float: right;
    margin: 10px 30px 0 30px;
}

.executorForm{
    ::v-deep .el-form-item__label{
        color: #7998b6;
    }
}
.searchOption {
    float:right;
 .searchInput{
     width:180px;
     margin-right: 5px;
    }
}
</style>
