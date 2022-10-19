<template>
  <div
    v-loading.fullscreen.lock="fullScreenLoading"
    element-loading-text="加载中..."
    style="height: 100%;"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <el-container>
      <el-header>
        <div>
          <el-input
            v-model="listQuery.scriptName"
            style="width: 16vw; margin-right: 1vw"
            icon="search"
            placeholder="请输入脚本名称"
            clearable
          />
          <el-select
            v-model="listQuery.tagId"
            filterable
            collapse-tags
            clearable
            placeholder="请选择脚本标签"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- <el-autocomplete
            v-model="queryList.tagId"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入脚本标签"
            clearable
            @select="handleSelect"
          >
            <template slot-scope="{ item }">
              <div class="name">{{ item.proGroup }}</div>
            </template>
          </el-autocomplete> -->
          <el-select
            v-model="listQuery.status"
            filterable
            collapse-tags
            clearable
            placeholder="请选择审核状态"
          >
            <el-option
              v-for="item in auditStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="loadScript()">检 索</el-button>        </div>
        <div>
          <el-button type="warning" icon="el-icon-plus" @click.stop="handleAdd()">新 增</el-button>
        </div>
      </el-header>
      <el-main>
        <el-table
          :data.sync="scriptData"
          highlight-current-row
          stripe
          border
          style="width: 98vw;"
          @sort-change="changeSort"
        >
          <el-table-column v-if="false" prop="id" label="项目ID" width="100" />
          <el-table-column label="脚本名称" prop="scriptName" align="center" sortable width="200" />
          <el-table-column label="所属标签" prop="tagId" align="center" sortable width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.tag.tagName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="当前状态" align="center" sortable>
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status==1" type="info">未审核</el-tag>
              <el-tag v-else-if="scope.row.status==2" type="warning">审核中</el-tag>
              <el-tag v-else-if="scope.row.status==3" type="success">已通过</el-tag>
              <el-tag v-else type="danger">驳回</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastOperator" label="修改人" align="center" />
          <el-table-column prop="updatedAt" label="修改时间" align="center" sortable />
          <el-table-column prop="operationWay" label="处理" align="center" width="260">
            <template slot-scope="scope">
              <el-button :disabled="scope.row.status!=3" type="warning" size="small" @click="handleExecute(scope.row)">执行</el-button>
              <el-button :disabled="scope.row.status==2" type="success" size="small" @click="handleEdit(scope.row.id)">编辑</el-button>
              <el-button
                type="danger"
                size="small"
                @click="remove(scope.$index, scope.row.id)"
              >删除</el-button>
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
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
        <transition name="el-zoom-in-center">
          <div v-show="show" class="transition-box">
            <el-button v-if="basicStatus=='create'" :loading="saveLoading" type="success" size="small" @click="saveScript()">保存</el-button>
            <el-button v-else-if="basicStatus=='update'" :loading="updateLoading" type="success" size="small" @click="updateScript()">更新</el-button>
            <el-button type="danger" size="small" style="margin-left: 3vw;" @click="close()">取消</el-button>
            <div class="scriptForm">
              <el-form ref="scriptForm" :model="scriptForm" :rules="scriptRules" label-width="100px">
                <el-form-item label="脚本名称" prop="scriptName">
                  <el-input v-model="scriptForm.scriptName" />
                </el-form-item>
                <el-form-item label="脚本标签" prop="tagId">
                  <el-select v-model="scriptForm.tagId" placeholder="请选择脚本标签">
                    <el-option
                      v-for="item in tagOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="操作描述">
                  <el-input v-model="scriptForm.remarks" type="textarea" rows="2" resize="none" />
                </el-form-item>
                <el-form-item label="脚本类型" prop="scriptType">
                  <el-radio-group v-model.number="scriptForm.scriptType">
                    <el-radio-button :label="1">{{ 'shell' }}</el-radio-button>
                    <el-radio-button :label="2">{{ 'python' }}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="超时时间(s)" prop="overTime">
                  <el-input-number v-model="scriptForm.overTime" :min="1" :max="30000" />
                </el-form-item>
                <el-form-item label="脚本内容" prop="scriptContent">
                  <el-button v-show="scriptForm.scriptType==1" type="warning" size="mini" @click="checkScriptContent">校验脚本语法</el-button>
                  <el-button type="info" size="mini" @click="debugScriptContent">调试脚本内容</el-button>
                </el-form-item>
              </el-form>
              <CodeEditor ref="editor" v-model="scriptForm.scriptContent" :cm-options.sync="cmOptions" class="transition-script" />
              <transition name="el-zoom-in-top">
                <div v-show="infoShow" class="transition-info-box">
                  <el-button class="cancelButton" type="danger" size="small" @click="closeTest">关闭</el-button>
                  <el-button ref="selectInfo" type="warning" size="small" @click="selectInfo">点击选中编辑</el-button>
                  <el-button v-if="continueStatus=='continueAdd'" type="success" size="small" @click="continueSaveScript">继续新增</el-button>
                  <el-button v-else-if="continueStatus=='continueUpdate'" type="success" size="small" @click="continueSaveUpdate">继续更新</el-button>
                  <CodeEditor ref="infoEditor" v-model="checkScriptResult" :cm-options.sync="cmOptions" />
                </div>
              </transition>
              <transition name="el-zoom-in-top">
                <div v-show="debugShow" class="transition-debug-box">
                  <el-button class="cancelButton" type="danger" size="small" @click="closeDebug">关闭</el-button>
                  <div :style="{display: 'inline-block', width: '300px', margin: 'auto auto auto 5px'}">
                    <el-select v-model="debugServer" filterable placeholder="请选择执行器" size="small">
                      <el-option v-for="option in executorOptions" :key="option.value" :label="option.label" :value="option.value" />
                    </el-select>
                    <el-button :loading="debugLoading" :style="{margin: 'auto auto auto 5px'}" type="info" size="small" @click="debugTest">调试</el-button>
                  </div>
                  <CodeEditor ref="debugEditor" v-model="debugScriptResult" :cm-options="cmOptions" />
                </div>
              </transition>
            </div>
          </div>
        </transition>
        <el-dialog :visible.sync="executorChooseVisible" class="serverSelectDialog" title="执行器选择" width="70%">
          <div> hello </div>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { testScript, createScript, listScript, fetchScript, delete_script, update_script, debug_script } from '@/api/script'
import { listTagOptions } from '@/api/tag'
import { listExecutorOptions } from '@/api/executor'
import { getToken } from '@/utils/auth'
import { getInfo } from '@/api/user'
import CodeEditor from '@/components/CodeEditor'
export default {
  components: { CodeEditor },
  data() {
    return {
      fullScreenLoading: false,
      userName: '',
      userId: undefined,
      listQuery: {
        scriptName: '',
        tagId: undefined,
        searches: {},
        conditions: {},
        status: undefined,
        pageNo: 1,
        pageSize: 10,
        searchContext: '',
        orderBy: 'updatedAt',
        order: 'DESC'
      },
      count: undefined,
      show: false,
      infoShow: false,
      debugShow: false,
      basicStatus: 'create',
      saveLoading: undefined,
      updateLoading: undefined,
      debugLoading: undefined,
      debugScriptResult: '',
      continueStatus: '',
      checkScriptResult: '',
      scriptData: [],
      executorChooseVisible: false,
      auditStatusOptions: [
        { label: '未审核', value: 1 },
        { label: '审核中', value: 2 },
        { label: '审核成功', value: 3 },
        { label: '驳回', value: 4 }
      ],
      debugServer: '',
      executorOptions: [],
      tagOptions: [],
      scriptForm: {
        id: undefined,
        scriptName: '',
        tagId: undefined,
        scriptType: undefined,
        overTime: 60,
        scriptContent: '',
        remarks: '',
        userId: undefined,
        lastOperator: ''
      },
      scriptRules: {
        scriptName: [
          { required: true, message: '请输入操作名称', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50个字符', trigger: 'blur' },
          { pattern: /^[^\s'"\.,，。!@#$%-/?|]+$/, message: '不能包含空格或特殊字符' }
        ],
        tagId: [
          { required: true, message: '请选择脚本分类标签', trigger: 'blur' }
        ],
        scriptType: [
          { required: true, message: '请选择脚本类型', trigger: 'blur' }
        ],
        overTime: [
          { required: true, message: '请输入脚本超时时间', trigger: 'blur' }
        ]
        // scriptContent: [
        //   { validator: validateScriptContent, trigger: 'blur' }
        // ]
      },
      scriptId: undefined,
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-sh',
        theme: 'erlang-dark',
        line: true,
        lineNumbers: true,
        fixedGutter: false,
        autoRefresh: true,
        autofocus: true,
        showCursorWhenSelecting: true
      }
    }
  },
  mounted() {
    this.loadScript()
  },
  created() {
    const token = getToken()
    getInfo(token).then(res => {
      this.userName = res.data.userName
      this.userId = res.data.id
      console.log(res.data, 'user')
    })
    this.loadTagOptions()
    this.loadExecutorOptions()
  },
  methods: {
    handleExecute(row) {
      console.log('haha')
      this.executorChooseVisible = true
      this.scriptId = row.id
    },
    loadExecutorOptions() {
      listExecutorOptions().then(res => {
        if (res.code === 0) {
          var executors = res.data
          executors.forEach(executor => {
            this.executorOptions.unshift({ label: executor.hostName, value: executor.id })
          })
          console.log(this.executorOptions, 'hello')
        } else {
          this.$message({ 'type': 'error', 'message': `获取执行器失败: ${res.msg}` })
        }
      }).catch(err => {
        this.$message({ 'type': 'error', 'message': `获取执行器失败: ${err}` })
      })
    },
    loadTagOptions() {
      listTagOptions().then(res => {
        if (res.code === 0) {
          var tags = res.data
          tags.forEach(tag => {
            this.tagOptions.unshift({ label: tag.tagName, value: tag.id })
          })
        } else {
          this.$message({ 'type': 'error', 'message': `获取分类标签失败: ${res.msg}` })
        }
      }).catch(err => {
        this.$message({ 'type': 'error', 'message': `获取分类标签失败: ${err}` })
      })
    },
    loadScript() {
      var query = this.completeQuery()
      this.fullscreenLoading = true
      listScript(query).then(res => {
        this.fullscreenLoading = false
        if (res.code === 0) {
          this.count = res.data.count
          this.scriptData = res.data.rows
        }
      })
    },
    debugTest() {
      if (this.scriptForm.scriptType === undefined) {
        this.$message({
          showClose: true,
          message: '请选择脚本类型',
          type: 'error'
        })
      } else if (this.scriptForm.scriptContent === '') {
        this.$message({
          showClose: true,
          message: '请输入脚本内容',
          type: 'error'
        })
      } else {
        this.debugLoading = true

        // this.operateForm.debugServer = this.debugServer
        debug_script({
          'serverId': this.debugServer,
          'scriptContent': this.scriptForm.scriptContent,
          'overTime': this.scriptForm.overTime,
          'scriptType': this.scriptForm.scriptType }).then((res) => {
          this.debugLoading = false
          if (res.code !== 0) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: 'error'
            })
          } else {
            var errorInfo = ''
            if (res.msg === '') {
              errorInfo = '无'
            }
            this.debugScriptResult = `执行结果: ${res.data} \n 错误信息: ${errorInfo} `
          }
        })
      }
    },
    bodyCloseSelected() {
      this.show = false
    },
    handleAdd() {
      this.basicStatus = 'create'
      this.resetForm()
      this.show = true
    },
    continueSaveScript() {
      this.infoShow = false
      this.fullScreenLoading = true
      createScript(this.scriptForm).then(res => {
        this.fullScreenLoading = false
        if (res.code === 0) {
          this.show = false
          this.loadScript()
          this.$message({
            message: '脚本添加成功',
            type: 'success'
          })
        } else {
          this.$notify({
            title: '脚本添加失败!',
            message: res.msg,
            type: 'error'
          })
        }
      }).catch(err => {
        this.fullScreenLoading = false
        this.$notify({
          title: '脚本添加失败!',
          message: err,
          type: 'error'
        })
      })
    },
    continueSaveUpdate() {
      this.infoShow = false
      this.fullScreenLoading = true
      update_script(this.scriptForm).then(res => {
        if (res.code === 0) {
          this.show = false
          this.fullScreenLoading = false
          this.$message({
            message: '脚本更新成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      })
    },
    completeQuery() {
      var query = JSON.parse(JSON.stringify(this.listQuery))
      if (query.scriptName !== '') {
        query.searches['scriptName'] = query.scriptName
      }
      if (query.status !== undefined) {
        query.conditions['status'] = query.status
      }
      if (query.tagId !== undefined) {
        query.conditions['tagRefer'] = query.tagId
      }
      return query
    },
    closeTest() {
      this.infoShow = false
    },
    selectInfo() {
      this.checkScriptResult = this.checkScriptResult.replace('In', 'On')
    },
    resetForm() {
      this.scriptForm = {
        scriptName: '',
        tagId: undefined,
        scriptType: undefined,
        overTime: 60,
        scriptContent: '',
        remarks: '',
        lastOperator: '',
        userId: undefined
      }
      this.$refs.scriptForm.resetFields()
    },
    checkScriptContent() {
      if (this.scriptForm.scriptContent === '') {
        this.$message({
          showClose: true,
          message: '请先输入脚本内容',
          type: 'error'
        })
      } else {
        testScript({ 'scriptContent': this.scriptForm.scriptContent }).then(res => {
          if (res.code === 0 && res.data === '') {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '脚本校验通过',
              position: 'top-left'
            })
          } else if (res.code !== 0) {
            this.$message({
              type: 'error',
              message: res.msg,
              position: 'top-left'
            })
          } else {
            this.infoShow = true
            this.continueStatus = ''
            this.checkScriptResult = res.data
          }
        })
      }
    },
    debugScriptContent() {
      if (this.scriptForm.id === undefined) {
        this.$message({
          showClose: true,
          message: '请选择脚本类型',
          type: 'error'
        })
      } else if (this.scriptForm.scriptContent === '') {
        this.$message({
          showClose: true,
          message: '请输入脚本内容',
          type: 'error'
        })
      } else {
        this.debugShow = true
        this.debugScriptResult = ''
      }
    },
    closeDebug() {
      this.debugShow = false
    },
    vaild_scriptName(id) {
      var scripts = this.scriptData
      return function(rule, value, callback) {
        if (value !== null && value !== '') {
          scripts.forEach(script => {
            if (value === script.scriptName && id !== script.id) {
              callback(new Error('标签名称已存在'))
            }
          })
          callback()
        }
      }
    },
    handleEdit(id) {
      this.basicStatus = 'update'
      this.scriptId = id
      fetchScript(id).then(res => {
        console.log(res.data)
        this.scriptForm = res.data
        this.show = true
      })
      this.scriptRules.scriptName = [
        { required: true, message: '请输入操作名称', trigger: 'blur' },
        { min: 3, max: 50, message: '长度在 3 到 50个字符', trigger: 'blur' },
        { pattern: /^[^\s'"\.,，。!@#$%-/?|]+$/, message: '不能包含空格或特殊字符', trigger: 'blur' },
        { validator: this.vaild_scriptName(id), trigger: 'blur' }
      ]
    },
    updateScript() {
      if (this.scriptForm.scriptContent === '') {
        this.$notify({
          title: '错误',
          message: '脚本内容不得为空!',
          type: 'error',
          position: 'top-left'
        })
      } else {
        this.$refs.scriptForm.validate((valid) => {
          if (valid) {
            this.updateloading = true
            this.scriptForm.id = this.scriptId
            this.scriptForm.lastOperator = this.userName
            this.scriptForm.userId = this.userId
            if (this.scriptForm.scriptType === 1) {
              testScript(this.scriptForm).then(res => {
                if (res.data === '') {
                  update_script(this.scriptForm).then(res => {
                    this.updateloading = false
                    this.loadScript()
                    if (res.code === 0) {
                      this.show = false
                      this.$message({
                        message: '脚本更新成功',
                        type: 'success'
                      })
                    } else {
                      this.$message({
                        message: res.msg,
                        type: 'error'
                      })
                    }
                  })
                } else {
                  this.updateLoading = false
                  this.infoShow = true
                  this.checkScriptResult = res.data
                  this.continueStatus = 'continueUpdate'
                }
              })
            } else {
              update_script(this.scriptForm).then(res => {
                this.updateloading = false
                if (res.code === 0) {
                  this.show = false
                  this.$message({
                    message: '脚本更新成功',
                    type: 'success'
                  })
                } else {
                  this.$message({
                    message: res.msg,
                    type: 'error'
                  })
                }
              })
            }
          }
        })
      }
    },
    saveScript() {
      if (this.scriptForm.scriptContent === '') {
        this.$notify({
          title: '错误',
          message: '脚本内容不得为空!',
          type: 'error',
          position: 'top-left'
        })
      } else {
        this.$refs.scriptForm.validate((valid) => {
          if (valid) {
            this.saveLoading = true
            this.scriptForm.lastOperator = this.userName
            this.scriptForm.userId = this.userId
            if (this.scriptForm.scriptType === 1) {
              testScript({ 'scriptContent': this.scriptForm.scriptContent }).then(res => {
                if (res.code === 0 && res.data === '') {
                  this._createScript()
                  // 保存脚本
                } else {
                  this.infoShow = true
                  this.continueStatus = 'continueAdd'
                  this.checkScriptResult = res.data
                  this.saveLoading = false
                }
              })
            } else {
              this._createScript()
            }
          } else {
            this.$message({
              type: 'error',
              message: '请校验配置'
            })
          }
        })
      }
    },
    _createScript() {
      createScript(this.scriptForm).then(res => {
        this.saveLoading = false
        this.loadScript()
        if (res.code === 0) {
          this.close()
          this.$message({
            message: '脚本添加成功',
            type: 'success'
          })
        } else {
          this.$notify({
            title: '脚本添加失败',
            message: res.msg,
            type: 'error'
          })
        }
      }).catch(err => {
        this.saveLoading = false
        this.$notify({
          title: '脚本添加失败',
          message: err,
          type: 'error'
        })
      })
    },
    close() {
      this.show = false
    },
    remove(index, id) {
      this.$confirm('此操作将永久删除该操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delete_script(id).then((res) => {
          if (res.code === 0) {
            this.loadScript()
            this.$message({
              type: 'success',
              message: '删除成功',
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg,
              showClose: true
            })
          }
        })
      })
    },
    changeSort(column) {
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
      this.loadScript()
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.loadScript()
    },
    handlePageChange(val) {
      this.listQuery.pageNo = val
      this.loadScript()
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
        // border-bottom: 1px solid #dddddd;
        display: flex;
        align-items: center;
        justify-content: space-between;
        ::v-deep .el-input,.el-autocomplete,.el-input--suffix{
        width: 16vw;
        @extend %inputShadw
            }
        }
    }

.transition-box{
    position: fixed;
      top:0px;
      right:0px;
      z-index: 99;
      width: 70%;
      height: 100%;
    //   border-radius: 2px;
      background-color:#226BA5;
      color: #fff;
      padding: 35px 20px;
      box-sizing: border-box;
      overflow: auto;
      .transition-script {

      }
}
.scriptForm {
  margin: 5vh auto auto -1vw;
  ::v-deep .el-form-item__label {
      color:#fff
    }
}

.transition-info-box {
    .cancelButton {
      margin:-58px 0 10px 0px
    }
    position: fixed;
    top: 0px;
    right:0px;
    z-index: 100;
    width: 70%;
    height: 400px;
    border-radius: 4px;
    background-color:rgb(212, 85, 11);
    color: #fff;
    padding: 19px 20px;
    box-sizing: border-box;
    overflow:auto;
  }
  .transition-debug-box {
    .cancelButton {
      margin: -58px 0 10px 0px
    }
    position: fixed;
    top: 0px;
    right: 0px;
    z-index: 101;
    width: 1000px;
    height: 400px;
    border-radius: 4px;
    background-color: rgb(126, 128, 134);
    color: #fff;
    padding: 19px 20px;
    box-sizing: border-box;
    overflow:auto;
  }
  .debugDiv {
    margin-left: '2px';
    display: 'inline-block';
    width: '300px' !important;
  }
</style>
