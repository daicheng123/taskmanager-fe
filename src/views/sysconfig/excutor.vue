<template>
  <div
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="拼命加载中"
    element-loading-background="rgba(0, 0, 0, 0.5)"
  >
    <div class="operateButtons">
      <el-button icon="el-icon-edit" type="success" @click="handleAdd">新增节点</el-button>
      <el-button icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
      <div class="searchOption">
        <el-input v-model="listQuery.hostName" class="searchInput" placeholder="请输入节点名称" clearable @keyup.enter.native="loadData" />
        <el-input v-model="listQuery.ipAddr" class="searchInput" placeholder="请输入节点ip" clearable @keyup.enter.native="loadData" />
        <el-select v-model="listQuery.status" class="searchInput" placeholder="请选择状态" clearable @change="loadData">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
    </div>
    <el-table ref="mainTable" :data.sync="exectuorsData" class="mainTable" border @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="false" prop="id" label="id" />
      <el-table-column prop="hostName" width="150" label="名称" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="ipAddr" width="150" label="IP地址" sortable="custom" />
      <el-table-column prop="status" width="140" label="状态" sortable="custom">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="12">
              <el-tag v-if="scope.row.status==1" effect="plain" type="info">{{ '未 知' }}</el-tag>
              <el-tag v-else-if="scope.row.status==2" effect="plain" type="success">{{ '正 常' }}</el-tag>
              <el-tag v-else effect="plain" type="danger">{{ '不可达' }}</el-tag>
            </el-col>
            <el-col :span="6">
              <el-button
                v-show="scope.row.status != 2"
                :loading="scope.row.loading"
                type="text"
                size="medium"
                icon="el-icon-refresh"
                @click="refreshExecutor(scope.row, 'loading', scope)"
              />
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column prop="secretStatus" width="120" label="密钥分发" sortable="custom">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.secretStatus==1" effect="dark" type="info">{{ '未分发' }}</el-tag>
          <el-tag v-else-if="scope.row.secretStatus==2" effect="dark" type="warning">{{ '分发中' }}</el-tag>
          <el-tag v-else-if="scope.row.secretStatus==3" effect="dark" type="success">{{ '已分发' }}</el-tag>
          <el-tag v-else-if="scope.row.secretStatus==4" effect="dark" type="danger">{{ '分发失败' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastOperator" width="120" label="最近修改人" />
      <el-table-column prop="updatedAt" width="160" label="最近修改时间" />
      <el-table-column prop="remarks" width="160" label="备注" />
      <el-table-column fixed="right" label="操作" width="270">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="warning" size="mini" @click="handleDistribute(scope.row)">分发密钥</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-show="count>0"
        :current-page="listQuery.pageNo"
        :page-sizes="[10,20,30,50]"
        :page-size="listQuery.pageSize"
        :total="count"
        background
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    <el-dialog :visible.sync="dialogShow" style="min-width: 500px;" title="执行器节点信息" @closed="close">
      <el-row :gutter="20">
        <el-form
          ref="execForm"
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
                :disabled="basicStatus=='update'"
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
                v-model.number="formData.sshPort"
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
              <el-tooltip v-show="isTest" content="点击进行连接测试。" placement="right">
                <el-button :loading="testLoading" type="text" size="mini" icon="el-icon-sort" style="margin-left: 5px;" @click="testNode()" />
              </el-tooltip>
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
            <el-button v-else-if="basicStatus=='update'" type="success" @click="updateNode()">更新</el-button>
          </el-col>
        </el-form>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from '@/utils/auth'
import { getInfo } from '@/api/user'
import { validateIP, isPort } from '@/utils/validate'
import { addExecutor, listExecutors, deleteExecutor, batchDelExecutor, refreshExecutor, distributeKey, updateExecutor } from '@/api/executor'
export default {
  data() {
    return {
      fullscreenLoading: false,
      refreshLoading: false,
      testLoading: false,
      dialogShow: false,
      listQuery: {
        orderBy: 'updatedAt',
        order: 'DESC',
        searches: {},
        conditions: {},
        pageNo: 1,
        pageSize: 10,
        status: undefined,
        hostName: '',
        ipAddr: ''
      },
      // isTest: true,
      basicStatus: 'create',
      userName: '',
      count: undefined,
      formData: {
        hostName: '',
        ipAddr: '',
        sshPort: 22,
        status: 1,
        // secretStatus: 0,
        accountName: '',
        accountPassword: '',
        executePath: '/opt/taskmanager',
        shouldDelivery: undefined,
        lastOperator: '',
        remarks: ''
      },
      formRules: {
        hostName: [],
        ipAddr: [
          { required: true, message: '请输入IP地址', trigger: 'blur' },
          { validator: validateIP, trigger: 'blur' }
        ],
        sshPort: [
          { required: true, message: '请输入SSH端口', trigger: 'blur' },
          { validator: isPort, trigger: 'blur' }
        ],
        accountName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        accountPassword: [
          { required: true, message: '请输入登陆密码', trigger: 'blur' }
        ],
        executePath: [
          { required: true, message: '请输入任务运行目录', trigger: 'blur' }
        ]

      },
      exectuorsData: [],
      hintVisible: false,
      multipleSelection: [],
      statusOptions: [
        { label: '未知', value: 1 },
        { label: '正常', value: 2 },
        { label: '不可达', value: 3 }
      ]
    }
  },
  computed: {
    isTest() {
      if (this.formData.ipAddr !== '' && this.formData.accountPassword !== '' && this.formData.accountName !== '') {
        return true
      }
      return false
    }
  },
  created() {
    const token = getToken()
    getInfo(token).then(res => {
      this.userName = res.data.userName
    })
    this.loadData()
  },
  methods: {
    vaild_hostName(id) {
      var exectuorsData = this.exectuorsData
      return function(rule, value, callback) {
        if (value !== null && value !== '') {
          exectuorsData.forEach(ex => {
            // 创建
            if (value === ex.hostName && id === undefined) {
              callback(new Error('执行器名称已存在'))
              // 更新
            } else if (value === ex.hostName && id !== ex.id) {
              callback(new Error('执行器名称已存在'))
            }
          })
          callback()
        }
      }
    },
    refreshExecutor(data, loading, scope) {
      this.$set(scope.row, loading, true)
      var refreshData = {
        id: data.id,
        ipAddr: data.ipAddr,
        sshPort: data.sshPort,
        accountName: data.accountName,
        accountPassword: data.accountPassword
      }
      refreshExecutor(refreshData, 'update').then(res => {
        this.$set(scope.row, loading, false)
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '主机状态刷新成功'
          })
          scope.row.status = 2
        } else {
          this.$message({
            type: 'error',
            message: `刷新失败: ${res.msg}`
          })
          scope.row.status = 3
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: err
        })
        scope.row.status = 3
      })
    },
    batchDelete() {
      this.$confirm('此操作将删除指定的节点,是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waning'
      }).then(() => {
        const idList = []
        this.fullscreenLoading = true
        this.multipleSelection.forEach(item => {
          idList.unshift(item.id)
        })
        batchDelExecutor({ 'idList': idList }).then(res => {
          this.fullscreenLoading = false
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.loadData()
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
      })
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.loadData()
    },
    handlePageChange(val) {
      this.listQuery.pageNo = val
      this.loadData()
    },
    handleDistribute(row) {
      var distributeData = {
        id: row.id,
        ipAddr: row.ipAddr,
        sshPort: row.sshPort,
        accountName: row.accountName,
        accountPassword: row.accountPassword
      }
      this.fullscreenLoading = true
      row.secretStatus = 2
      distributeKey(distributeData).then(res => {
        this.fullscreenLoading = false
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '密钥分发成功！'
          })
          row.secretStatus = 3
        } else {
          this.$message({
            type: 'error',
            message: `分发失败: ${res.msg}`
          })
          row.secretStatus = 4
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: err
        })
        row.secretStatus = 4
      })
    },
    completeQuery() {
      var query = JSON.parse(JSON.stringify(this.listQuery))
      if (query.status !== undefined) {
        query.conditions['status'] = query.status
      }

      if (query.hostName !== '') {
        query.searches['hostName'] = query.hostName
      }

      if (query.ipAddr) {
        query.searches['ipAddr'] = query.ipAddr
      }
      return query
    },
    loadData() {
      const query = this.completeQuery()
      this.fullscreenLoading = true
      console.log(JSON.stringify(query))
      listExecutors(query).then(res => {
        this.fullscreenLoading = false
        if (res.code === 0) {
          this.exectuorsData = res.data.rows
          this.count = res.data.count
          this.fullscreenLoading = false
        } else {
          this.$message({
            type: 'error',
            message: `获取执行器列表失败: ${res.msg}`
          })
        }
      })
    },
    testNode() {
      this.testLoading = true
      refreshExecutor({
        'ipAddr': this.formData.ipAddr,
        'accountName': this.formData.accountName,
        'accountPassword': this.formData.accountPassword,
        'sshPort': this.formData.sshPort
      }, 'create').then(res => {
        this.testLoading = false
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '主机可达!'
          })
          this.status = 2
        } else {
          this.status = 3
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      }).catch(err => {
        this.status = 1
        this.$message({
          type: 'error',
          message: err
        })
      })
    },
    resetForm() {
      this.formData = {
        hostName: '',
        ipAddr: '',
        sshPort: 22,
        status: 1,
        accountName: '',
        accountPassword: '',
        executePath: '/opt/taskmanager',
        shouldDelivery: undefined,
        lastOperator: '',
        remarks: ''
      }
      if (this.$refs.execForm) this.$refs.execForm.resetFields()
    },
    close() {
      this.resetForm()
      this.dialogShow = false
    },
    handleAdd() {
      this.resetForm()
      this.basicStatus = 'create'
      this.dialogShow = true
      this.formRules.hostName = [
        { required: true, message: '请输入节点名称', trigger: 'blur' },
        { validator: this.vaild_hostName(), trigger: 'blur' }
      ]
    },
    handleDelete(id) {
      this.$confirm('此操作将删除指定的节点,是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waning'
      }).then(() => {
        deleteExecutor(id).then((res) => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.loadData()
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }).catch(() => {
          this.$message.error('删除失败，请联系管理员。')
        })
      })
    },
    updateNode() {
      this.$refs.execForm.validate(valid => {
        if (valid) {
          this.formData.lastOperator = this.userName
          this.formData.status = this.status
          this.fullscreenLoading = true
          console.log(this.formData, 'wowo')
          updateExecutor(this.formData).then(res => {
            this.fullscreenLoading = false
            if (res.code === 0) {
              this.dialogShow = false
              this.$message({
                type: 'success',
                message: '更新成功!'
              })
              this.loadData()
            } else {
              this.$message({
                type: 'error',
                message: `更新失败:${res.msg}`
              })
            }
          }).catch(err => {
            this.$message({
              type: 'error',
              message: err
            })
          })
        } else {
          this.$message.error('请校验输入信息合法性')
        }
      })
    },
    saveNode() {
      this.$refs.execForm.validate(valid => {
        if (valid) {
          this.formData.lastOperator = this.userName
          this.formData.status = this.status
          this.fullscreenLoading = true
          addExecutor(this.formData).then(res => {
            this.dialogShow = false
            this.fullscreenLoading = false
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '新增成功!'
              })
              this.loadData()
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
        } else {
          this.$message.error('请校验输入信息合法性')
          return false
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSortChange(column) {
      this.listQuery.orderBy = column.prop
      switch (column.order) {
        case 'descending':
          this.listQuery.order = 'DESC'
          break
        case 'ascending':
          this.listQuery.order = 'ASC'
          break
        default:
          this.listQuery.order = 'DESC'
      }
      this.loadData()
    },
    handleEdit(row) {
      this.resetForm()
      this.status = 1
      this.basicStatus = 'update'
      this.dialogShow = true
      this.formData = JSON.parse(JSON.stringify(row))
      this.formRules.hostName = [
        { required: true, message: '请输入节点名称', trigger: 'blur' },
        { validator: this.vaild_hostName(row.id), trigger: 'blur' }
      ]
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
.mainTable {
        margin:10px auto 0 30px;
        // width: 96%;
        margin-right: 5px;
    }
.pagination-container {
  margin: 10px 0 0 30px;
}
</style>
