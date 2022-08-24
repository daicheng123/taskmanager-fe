<template>
 <div
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="拼命加载中"
    element-loading-background="rgba(0, 0, 0, 0.5)">
    <el-input v-model="listQuery.searchContext" class="searchInput" placeholder="请输入分类标签名称" suffix-icon="el-icon-search" @change="showData"/>
    <el-button class="handlerAdd" type="warning" @click="handleCreateTag">新增分类</el-button>
    <el-table
      :data="tagsData"
      class="tagsTable"
      border
      @sort-change="changeSort">
      <el-table-column v-if="false" prop="id" label="分类ID" align="center"/>
      <el-table-column prop="tagName" label="标签名称" align="center" sortable/>
      <el-table-column prop="lastOperator" label="最后操作人" align="center" sortable/>
      <el-table-column prop="updatedAt" label="最后操作时间" align="center" sortable/>
      <el-table-column prop="operate" label="操作" align="center" sortable>
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row.ID)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.ID)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogShow" title="分类标签管理">
      <el-form ref="createForm" :model="tagCreateForm" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="tagCreateForm.tagName"/>
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
import { fetchNow } from '@/utils/index'
import { createTag, listTags } from '@/api/tag'
export default {
    data() {
        return {
          fullscreenLoading: false,
          userName: '',
          total: undefined,
          loading: false,
          listQuery: {
            pageNo: 1,
            pageSize: 10,
            searchContext: '',
            sortBy: '',
            order: '',
            }, 
           tagCreateForm: {
              tagName: '',
              lastOperator: '',
              updatedAt: undefined
           },
           status: '',
           dialogShow: false,
           tagsData:[],
           rules: {
              tagName: [{required: true, message: '请输入标签名称', trigger: 'blur'}]
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
      handleCreateTag() {
        this.dialogShow = true
        this.status = 'create'
      },
      resetForm() {
        this.tagCreateForm = {
            tagName: '',
        }
        if (this.$refs.form) this.$refs.form.resetFields()
    },
      handleEdit() {},
      changeSort(column) {
        if (column.order === 'descending') {
          this.listQuery.ordering = '-' + column.prop
        } else if (column.order === 'ascending') {
          this.listQuery.ordering = column.prop
        } else {
          this.listQuery.ordering = ''
         }
        this.showData()
    },
      createTag() {
        this.$refs.createForm.validate(valid => {
            if (valid) {
                this.fullscreenLoading = true
                this.tagCreateForm.lastOperator = this.userName
                createTag(this.tagCreateForm).then(res => {
                    this.dialogShow = false
                    if (res.code === 0) {
                       this.$message({
                        message: '创建成功',
                        type: 'success',
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
                    this.fullscreenLoading = false

                })
            }
        })
      },
      updateTag() {},
      showData() {
        this.fullscreenLoading = true
        listTags(this.listQuery).then(res => {
          console.log(this.listQuery)
          if (res.code === 0) {
            this.count = res.data.length
            this.tagsData = res.data
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
      handleDelete() {},
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
    margin: 20px 0 0 30px;
 }
 .handlerAdd {
    position: absolute;
    right: 10px;
    top: 20px;

 }
 .tagsTable {
   margin: 10px 20px;
 }
</style>
