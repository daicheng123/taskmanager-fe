<template>
  <div class="mainDiv">
    <el-button class="operateButton" type="primary" @click="filterHistory">搜 索</el-button>
    <div class="chooseDiv">
      <el-input v-model="listQuery.scriptName" class="scriptInput" placeholder="请输入操作名称" suffix-icon="el-icon-search" @change="loadScript" />
      <el-select v-model="listQuery.status" class="statusSelect" placeholder="请选择审核状态" @change="searchOperate">
        <el-option label="未审核" :value="1" />
        <el-option label="审核中" :value="2" />
        <el-option label="审核通过" :value="3" />
        <el-option label="驳回" :value="4" />
      </el-select>
    </div>
    <div class="table box">
      <el-table
        :data="scriptData"
        class="scriptTable"
        border
        @sort-change="changeSort"
      >
        <el-table-column v-if="false" prop="id" label="操作ID" align="center" />
        <el-table-column prop="scriptName" label="操作名称" align="center" sortable />
        <el-table-column prop="scriptStatus" label="当前状态" align="center" sortable>
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==4" type="danger">驳回</el-tag>
            <el-tag v-else-if="scope.row.status==3" type="success">审核通过</el-tag>
            <el-tag v-else-if="scope.row.status==2" type="warning">审核中</el-tag>
            <el-tag v-else-if="scope.row.status==1" type="warning">未审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationWay" label="处理" align="center">
          <template slot-scope="scope">
            <el-button type="success" size="small" @click="handleView(scope.row.id)">查看内容</el-button>
            <el-button type="warning" size="small" @click="handlePass(scope.row.id)">通过</el-button>
            <el-button type="danger" size="small" @click="handleRefuse(scope.row.id)">驳回</el-button>
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
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      listQuery: {
        scriptName: '',
        status: undefined,
        pageNo: 1,
        pageSize: 10,
        orderBy: 'updatedAt',
        order: 'DESC'
      },
      count: undefined,

      scriptData: []
    }
  },
  methods: {
    loadScript() {},
    handleView(id) {

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
    },
    handleSizeChange(val) {},
    handlePageChange(val) {}
  }
}
</script>
<style lang="scss" scoped>
 %inputShadw {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  margin-right: 10px;
}
    .mainDiv {
        margin:20px 30px 0 30px;
        .operateButton {
            float: right;
        }
        .chooseDiv {
            .scriptInput {
                width: 250px !important;
            }
            ::v-deep .el-input {
            width: 10vw;
            @extend %inputShadw
        }
        }
        .table {
            margin:10px 0 0 0;
        }
        .box {
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.15);
    }
    }
    .scriptTable{}
</style>
