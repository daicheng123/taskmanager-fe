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
            v-model="queryList.scriptName"
            style="width: 16vw; margin-right: 1vw"
            icon="search"
            placeholder="请输入脚本名称"
            clearable
          />
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
            v-model="queryList.status"
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
          <el-button type="primary" icon="el-icon-search" @click="loadData()">检 索</el-button>        </div>
        <div>
          <el-button type="warning" icon="el-icon-plus" @click.stop="handleAdd()">新 增</el-button>
        </div>
      </el-header>
      <el-main>
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
                <el-form-item label="脚本标签" prop="scriptTag">
                  <el-select v-model="scriptForm.scriptTag" placeholder="请选择脚本标签">
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
                  <el-button v-if="continueStatus=='continueAdd'" type="success" size="small" @click="saveOperation">继续新增</el-button>
                  <CodeEditor ref="infoEditor" v-model="checkScriptResult" :cm-options.sync="cmOptions" />
                </div>
              </transition>
            </div>
          </div>
        </transition>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { testScript, createScript } from '@/api/script'
import { listTagOptions } from '@/api/tag'
import { getToken } from '@/utils/auth'
import { getInfo } from '@/api/user'
import CodeEditor from '@/components/CodeEditor'
export default {
  components: { CodeEditor },
  data() {
    return {
      fullScreenLoading: false,
      userName: '',
      queryList: {
        scriptName: '',
        tagId: undefined,
        searches: [],
        conditions: [],
        status: undefined
      },
      show: false,
      infoShow: false,
      basicStatus: 'create',
      saveLoading: undefined,
      updateLoading: undefined,
      continueStatus: '',
      checkScriptResult: '',
      auditStatusOptions: [
        { label: '未审核', value: 1 },
        { label: '审核中', value: 2 },
        { label: '审核成功', value: 3 },
        { label: '驳回', value: 4 }
      ],
      tagOptions: [],
      scriptForm: {
        scriptName: '',
        scriptTag: undefined,
        scriptType: undefined,
        overTime: 60,
        scriptContent: '',
        remarks: '',
        lastOperator: ''
      },
      scriptRules: {
        scriptName: [
          { required: true, message: '请输入操作名称', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50个字符', trigger: 'blur' },
          { pattern: /^[^\s'"\.,，。!@#$%-/?|]+$/, message: '不能包含空格或特殊字符' }
        ],
        scriptTag: [
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
  },
  created() {
    const token = getToken()
    getInfo(token).then(res => {
      this.userName = res.data.userName
    })
    this.loadTagOptions()
  },
  methods: {
    loadTagOptions() {
      listTagOptions().then(res => {
        console.log(res)
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
    loadData() {},
    bodyCloseSelected() {
      this.show = false
    },
    handleAdd() {
      this.show = true
    },
    saveOperation() {

    },
    closeTest() {
      this.infoShow = false
    },
    selectInfo() {
      this.checkScriptResult = this.checkScriptResult.replace('In', 'On')
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
          console.log(JSON.stringify(res))
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
    debugScriptContent() {},
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
            if (this.scriptForm.scriptType === 1) {
              testScript({ 'scriptContent': this.scriptForm.scriptContent }).then(res => {
                if (res.code === 0 && res.data === '') {
                  this.scriptForm.lastOperator = this.userName
                  // 保存脚本
                  createScript(this.scriptForm).then(res => {

                  })
                } else {
                  this.infoShow = true
                  this.continueStatus = ''
                  this.checkScriptResult = res.data
                }
              })
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
    close() {
      this.show = false
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
</style>