<template>
  <div
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="拼命加载中"
    element-loading-background="rgba(0, 0, 0, 0.5)"
  >
    <div style="position: relative;">
      <el-input v-model="listQuery.searchContext" class="searchInput" placeholder="请输入分类标签名称" suffix-icon="el-icon-search" @keyup.enter.native="showData" />
      <el-button class="handlerAdd" type="warning" @click="handleCreateTag">新增分类</el-button>
    </div>
    <el-table
      :data="tagsData"
      class="tagsTable"
      border
      @sort-change="changeSort"
    >
      <el-table-column v-if="false" prop="id" label="分类ID" align="center" />
      <el-table-column prop="tagName" label="标签名称" align="center" sortable />
      <el-table-column prop="lastOperator" label="最后操作人" align="center" sortable />
      <el-table-column prop="updatedAt" label="最后操作时间" align="center" sortable />
      <el-table-column prop="operate" label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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
    <el-dialog :visible.sync="dialogShow" title="分类标签管理">
      <el-form ref="createForm" :model="tagForm" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="tagForm.tagName" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button v-if="status === 'create'" type="primary" @click="createTag">新 增</el-button>
        <el-button v-else type="success" @click="updateTag">更 新</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from '@/utils/auth'
import { getInfo } from '@/api/user'
import { createTag, listTags, delTag, updateTag } from '@/api/tag'
export default {
  data() {
    return {
      fullscreenLoading: false,
      userName: '',
      count: undefined,
      loading: false,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        searchContext: '',
        seraches: [],
        orderBy: 'updatedAt',
        order: 'DESC'
      },
      tagForm: {
        id: undefined,
        tagName: '',
        lastOperator: '',
        updatedAt: undefined
      },
      status: '',
      dialogShow: false,
      tagsData: [],
      rules: {
        tagName: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在3到50个字符之间', trigger: 'blur' }]
      }
    }
  },
  created() {
    const token = getToken()
    getInfo(token).then(res => {
      this.userName = res.data.userName
    })
    this.showData()
  },
  methods: {
    vaild_tagName(id) {
      var tags = this.tagsData
      return function(rule, value, callback) {
        if (value !== null && value !== '') {
          tags.forEach(tag => {
            // 创建
            if (value === tag.tagName && id === undefined) {
              callback(new Error('标签名称已存在'))
            // 更新
            } else if (value === tag.tagName && id !== tag.id) {
              callback(new Error('标签名称已存在'))
            }
          })
          callback()
        }
      }
    },
    handleCreateTag() {
      this.resetForm()
      this.dialogShow = true
      this.status = 'create'
      this.rules.tagName.push({ validator: this.vaild_tagName(), trigger: 'blur' })
    },
    handleEdit(row) {
      this.resetForm()
      this.tagForm.tagName = row.tagName
      this.tagForm.id = row.id
      this.status = 'update'
      this.dialogShow = true
      this.rules.tagName.push({ validator: this.vaild_tagName(row.id), trigger: 'blur' })
    },
    resetForm() {
      this.tagForm = {
        tagName: ''
      }
      if (this.$refs.createForm) this.$refs.createForm.resetFields()
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
      this.showData()
    },
    createTag() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          this.fullscreenLoading = true
          this.tagForm.lastOperator = this.userName
          createTag(this.tagForm).then(res => {
            this.dialogShow = false
            if (res.code === 0) {
              this.$message({
                message: '创建成功',
                type: 'success'
              })
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
          }).finally(res => {
            this.showData()
            this.fullscreenLoading = false
          })
        }
      })
    },
    updateTag() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          this.fullscreenLoading = true
          this.tagForm.lastOperator = this.userName
          updateTag(this.tagForm).then(res => {
            this.dialogShow = false
            if (res.code === 0) {
              this.$message({
                message: '创建成功',
                type: 'success'
              })
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
          }).finally(() => {
            this.showData()
            this.fullscreenLoading = false
          })
        } else {
          this.$message({ type: 'error', message: '请校验输入信息合法性' })
        }
      })
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.showData()
    },
    handlePageChange(val) {
      this.listQuery.pageNo = val
      this.showData()
    },
    showData() {
      this.fullscreenLoading = true
      this.listQuery.seraches = [this.listQuery.searchContext]
      listTags(this.listQuery).then(res => {
        if (res.code === 0) {
          this.count = res.data.count
          this.tagsData = res.data.rows
          console.log(this.tagsData)
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: err
        })
      }).finally(res => {
        this.fullscreenLoading = false
      })
    },
    handleDelete(id) {
      this.$confirm('此操作将永久删除选定的分类标签, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delTag(id).then((res) => {
          if (res.code === 0) {
            this.tagsData.splice(this.tagsData.findIndex(tag => tag.id === id), 1)
            if (this.tagsData.length === 0) {
              this.listQuery.pageNo--
              this.showData()
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }).catch(err => {
          this.$message({
            type: 'errpr',
            message: err
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    cancel() {
      this.dialogShow = false
      this.resetForm()
    }
  }
}
</script>
<style lang="scss" scoped>
 .searchInput{
    width: 200px;
    margin: 20px auto 0 30px;
 }
 .handlerAdd {
  // float: right;
  //  box-sizing: border-box;
  //  position: absolute;
   top: 20px;
   right: 30px;
  //  margin-right: 15px;
  //  margin-right: 15px;
 }
 .tagsTable {
   width: 96%;
   margin: 20px 30px 0 30px;
 }
 .pagination-container {
  margin: 10px 0 0 30px;
}
</style>
