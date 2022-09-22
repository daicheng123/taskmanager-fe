<template>
  <div
    v-loading.fullscreen.lock="fullScreenLoading"
    element-loading-text="加载中..."
    style="height: 100%;"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <el-container>
      <el-header>
        <el-button type="primary" @click="handleAddDangerousCmd()">新增危险命令</el-button>
      </el-header>
      <el-main class="dangerousMain">
        <el-table border :data="dangerousCmdList" style="width: 100%">
          <el-table-column v-if="false" prop="id" label="id" />
          <el-table-column prop="dangerousCmd" align="center" label="危险命令" />
          <el-table-column prop="remarks" align="center" label="备注" />
          <el-table-column fixed="right" align="center" label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="handleEditCmd(scope.row)">编辑</el-button>
              <el-button type="text" @click="handleDeleteCmd(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-show="total>0"
            :current-page="queryList.pageNo"
            :page-sizes="[10,20,30,50]"
            :page-size="queryList.pageSize"
            :total="total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
        <el-dialog :visible.sync="dangerousCmdVisible" title="提示">
          <el-form ref="dangerousCmdRef" :model="dangerousCmdForm" :rules="dangercommandRules" label-width="80px">
            <el-form-item prop="dangerousCommand" label="危险命令">
              <el-input v-model="dangerousCmdForm.dangerousCommand" />
            </el-form-item>
            <el-form-item prop="remarks" label="备注">
              <el-input v-model="dangerousCmdForm.remarks" />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button v-if="dangerousCmdStatus=='create'" type="success" @click="saveDangerousCmd">新 增</el-button>
            <el-button v-else-if="dangerousCmdStatus='update'" type="warning" @click="updateDangerousCmd">更 新</el-button>
          </span>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { dangercmdAdd, dangercmdUpdate, dangercmdDelete, dangercmdList } from '@/api/dangercmd'
export default {
  data() {
    return {
      dangerousCmdList: [],
      queryList: {
        pageNo: 1,
        pageSize: 10
      },
      dangerousCmdForm: {
        dangerousCommand: '',
        remarks: '',
        id: undefined
      },
      fullScreenLoading: undefined,
      total: undefined,
      dangerousCmdStatus: '',
      dangerousCmdVisible: undefined,
      dangercommandRules: {
        dangerousCommand: [],
        remarks: [
          { max: 100, message: '长度最大为100个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.loadDangerousData()
  },
  methods: {
    vaild_dangerousCmd(id) {
      var cmds = this.dangerousCmdList
      return function(rule, value, callback) {
        if (value !== null && value !== '') {
          cmds.forEach(cmd => {
            // 创建
            if (value === cmd.dangerousCmd && id === undefined) {
              callback(new Error('危险命令已存在'))
            // 更新
            } else if (value === cmd.dangerousCmd && id !== cmd.id) {
              callback(new Error('危险命令已存在'))
            }
          })
          callback()
        }
      }
    },
    resetForm() {
      this.dangerousCmdForm = {
        dangerousCommand: '',
        remarks: '',
        id: undefined
      }
      if (this.$refs.dangerousCmdForm) this.$refs.dangerousCmdForm.resetFields()
    },
    loadDangerousData() {
      this.fullscreenLoading = true
      dangercmdList(this.queryList).then((res) => {
        this.total = res.data.count
        this.dangerousCmdList = res.data.rows
        this.fullscreenLoading = false
      })
    },
    handleSizeChange(val) {
      this.queryList.pageSize = val
      this.loadDangerousData()
    },
    handlePageChange(val) {
      this.queryList.pageNo = val
      this.loadDangerousData()
    },
    handleEditCmd(row) {
      this.resetForm()
      var cmdData = JSON.parse(JSON.stringify(row))
      this.dangerousCmdVisible = true
      this.dangerousCmdStatus = 'update'
      this.dangerousCmdForm.dangerousCommand = cmdData.dangerousCmd
      this.dangerousCmdForm.remarks = cmdData.remarks
      this.dangerousCmdForm.id = cmdData.id
      this.dangercommandRules.dangerousCommand = [
        { required: true, message: '请输入危险命令', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
        { validator: this.vaild_dangerousCmd(row.id), trigger: 'blur' }
      ]
    },
    handleAddDangerousCmd() {
      this.resetForm()
      this.dangerousCmdVisible = true
      this.dangerousCmdStatus = 'create'
      this.dangercommandRules.dangerousCommand = [
        { required: true, message: '请输入危险命令', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
        { validator: this.vaild_dangerousCmd(), trigger: 'blur' }
      ]
    },

    handleDeleteCmd(id) {
      this.$confirm('此操作将删除该条危险命令，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        dangercmdDelete(id).then((res) => {
          if (res.code === 0) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.dangerousCmdList.splice(this.dangerousCmdList.findIndex(command => command.id === id), 1)
            if (this.dangerousCmdList.length === 0) {
              this.queryList.pageNo--
              this.loadDangerousData()
            }
          } else {
            this.$message({
              message: res.msg,
              type: 'error'
            })
          }
        })
      }).catch(() => {
        this.$message({
          message: '删除已取消',
          type: 'info'
        })
      })
    },
    saveDangerousCmd() {
      this.$refs.dangerousCmdRef.validate((valid) => {
        if (valid) {
          dangercmdAdd(this.dangerousCmdForm).then((res) => {
            this.dangerousCmdVisible = false
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '保存成功'
              })
              this.loadDangerousData()
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
      })
    },
    updateDangerousCmd() {
      this.$refs.dangerousCmdRef.validate((valid) => {
        if (valid) {
          dangercmdUpdate(this.dangerousCmdForm).then((res) => {
            this.dangerousCmdVisible = false
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: '保存成功'
              })
              this.loadDangerousData()
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
      })
    },
    cancel() {
      this.dangerousCmdVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
%inputShadw {
  box-shadow: 3px 2px 2px #dddddd;
  border-radius: 4px;
  margin-right: 10px;
}

.el-container {
    .el-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        ::v-deep .el-input,.el-autocomplete,.el-input--suffix{
        width: 16vw;
        @extend %inputShadw
            }
        }
    }

    .dangerousMain {
      padding: 0 20px auto 20px !important;
        }
</style>
