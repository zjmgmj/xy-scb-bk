<template lang="pug">
el-dialog(width="875px", title="选择物资", :visible="true", :append-to-body="appendToBody", top="10px", @close="close")
  .content(style="height: 90vh; position: relative;")    
    erplr-panel.border(:right-padding="false")
      div(slot="left")
        .ft-15.bg-gray.padding-sm 品名大类
        left-tree(ref="leftTree", :data="treeData", :props="treeProps", @nodeClick="treeNodeClick")
      .erp-content(slot="right")        
        .row
          .col
            el-input(v-model="searchKey", size="mini", placeholder="品名、材质、规格、产地、助记码")
          el-button.ml-10(size="mini", type="primary", @click="searchHandler") 查询
        .table-content
          basic-elx-table(
            :id="tableId",
            :tableValue="tableValue",
            :total="totalCount",
            :currentPage="currentPage",
            :pageSize="pageSize",
            :loading="loading"   
            @paginateChange="tableChange",
            @rowSelection="rowSelection")
        .text-right.pt-10
          el-button(@click="close", size="mini") 取消
          el-button(@click="sure", type="primary", size="mini") 确定
</template>
<script>
import erplrPanel from '~/components/erplrPanel'
import basicElxTable from '~/components/basicElxTable'
import leftTree from '@/components/leftTree'
export default {
  components: {
    erplrPanel,
    basicElxTable,
    leftTree
  },
  props: {
    pntreeName: {
      type: String,
      default: ''
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    form: {
      type: Object,
      default: () => {
        return {
          dataperCode: '',
          dataperName: '',
          dataperIsuser:''
        }
      }
    },
    tableValue: {
      type: Object,
      default: () => {
        return {
          hasCbx: false,
          selection: true,
          pageination: true,
          showRowIndex: false,
          tableHead: [
            {lbl: '品名', prop: 'partsnameName'},
            {lbl: '材质', prop: 'goodsMaterial'},
            {lbl: '规格', prop: 'goodsSpec'},
            {lbl: '产地', prop: 'productareaName'}
          ],
          tableData: []
        }
      }
    }
  },  
  data () {
    return {
      dialogShow: true,
      dialogTitle: '数据权限设置',
      tempRoleCodelist: [],
      treeData: [],
      treeProps: {
        children: 'children',
        label: 'text',
        isLeaf: 'leaf'
      },
      tableId: 'goodsWin',
      currentPage: 1,
      totalCount: 0,
      pageSize: 30,
      queryObject: {
        page: this.currentPage,
        start: 0,
        limit: this.pageSize,
        sort: '[{"property":"goodscodeCode","direction":"ASC"}]'
      },
      loading: false,
      searchKey: '',
      options: [{label: '全部启用', value: 1}, {label: '全部停用', value: 2}, {label: '全部角色', value: 3}],
      buttonVal: '',
      tableSelect: [],
      checkNode: {data: {}}
    }
  },
  created () {
    this.getTreeList()
  },
  methods: {
    close() {
      this.$emit('close')
    },
    sure () {
      this.$emit('sure', this.tableSelect)     
    },
    treeNodeClick (obj) {
      let queryBean = {}
      if (obj.data.filterObj) {
        this.currentPage = 1
        queryBean = this.getFilterObj(obj.data.filterObj)
        this.queryObject = {
          page: this.currentPage,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"goodscodeCode","direction":"ASC"}]'
        }
        this.queryObject = Object.assign(this.queryObject, {queryBean: queryBean})  
        this.loadData()
      }
      obj.data = Object.assign(obj.data, queryBean)
      this.checkNode = obj
    },
    searchHandler () {
      this.queryObject = {
        page: this.currentPage,
        start: 0,
        limit: this.pageSize,
        sort: '[{"property":"goodscodeCode","direction":"ASC"}]',
        queryBean: {
          goodsStatus: 0,
          allQueryFilter: this.searchKey
        }
      }
      this.loadData()
    },
    rowSelection (row) {
      this.tableSelect = row
    },
    tableChange (val) {
      this.currentPage = val
      this.queryObject.page = this.currentPage
      this.queryObject.start = (this.currentPage - 1) * this.pageSize
      this.loadData()
    },
    async loadData () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/goodscodeAjax.do', 'post', this.queryObject)
        this.tableValue.tableData = []
        this.tableSelect = []
        this.totalCount = 0
        if (data.goodscodelist) {
          this.tableValue.tableData = data.goodscodelist
          this.totalCount = data.totalCount
        }
        this.loading = false
      } catch (e) {
        this.loading = false
        console.error(e)
      }
    },
    async getTreeList () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!queryGoodscodeTree.do', 'post', {pntreeName: this.pntreeName, pntreeParentcode: 'root'})
        this.treeData = data.children
        this.treeProps = {
          children: 'children',
          label: 'text',
          isLeaf: 'leaf'
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.table-content{
  height calc(100% - 60px)
}
</style>
