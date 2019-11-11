<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
  .erp-content(slot="right")
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",
        @row-dbclick="rowDbclick",
        @paginateChange="tableChange",
        @tableRowEdit="rowEdit",
        @tableRowDel="rowDel",
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="仓库设置", :visible="dialogShow", width="800px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")
</template>

<script>
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftSearch from '~/components/leftSearch'
  export default {
    layout: 'backend',
    components: {
      basicElxTable,
      erplrPanel,
      leftSearch,
      buttonGroup,
      editBox
    },
    data () {
      return {
        collapseName: ['1', '2'],
        editForm: {
          warehouseName: '',
          warehouseMnemcode: '',
          warehouseCtype: '',
          areaCode: '',
          warehouseLinkman: '',
          warehousePhone: '',
          warehouseMobile: '',
          warehouseAddr: '',
          warehouseWareplace: 1,
          warehouseOwnSupervise: 0,
          warehouseRemark: ''
        },
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
          // {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        searchFormItems: [
          {lbl: '仓库', prop: 'warehouseCode', val: ''},
          {lbl: '仓库名称', prop: 'warehouseName', val: ''},
          {lbl: '地区', prop: 'areaCode', val: ''}
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '仓库名称', prop: 'warehouseName', width: '100px'},
            {lbl: '仓库代码', prop: 'warehouseCode', width: '100px'},
            {lbl: '助记码', prop: 'warehouseMnemcode'},
            {lbl: '仓库类型', prop: 'warehouseCtype'},
            {lbl: '自有监管库', prop: 'ownSuperviseStr', width: '120px'},
            {lbl: '库位', prop: 'warehouseWareplace'},
            {lbl: '地区', prop: 'areaCode'},
            {lbl: '联系人', prop: 'warehouseLinkman'},
            {lbl: '电话', prop: 'warehousePhone'},
            {lbl: '手机', prop: 'warehouseMobile'},
            {lbl: '地址', prop: 'warehouseAddr'},
            {lbl: '备注', prop: 'warehouseRemark'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'},
                {lbl: '删除', type: 'del'}
              ]
            }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          page: this.currentPage,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"warehouseCode","direction":"DESC"}]'
        },
        loading: true,
        dialogShow: false,
        copyEditForm: {},
        dialogTitle: '新增仓库',
        tableSelect: []
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
        cstmArr: state => state.cstmArr
      })
    },
    created () {
      // this.getMsgTemplateGroup()
      this.copyEditForm = JSON.stringify(this.editForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          'queryBean.likeCol': ['warehouseCode', 'warehouseName', 'areaCode'],
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"warehouseCode","direction":"DESC"}]'
        }
        this.loadData()
      })
    },
    methods: {
      editSave() {
        this.editForm = JSON.parse(this.copyEditForm)
        this.dialogShow = false
        this.loadData()
      },
      editCancel () {
        this.editForm = JSON.parse(this.copyEditForm)
        this.dialogShow = false
      },
      rowSelection (row) {
        this.tableSelect = row
      },
      tableChange (val) {
        console.log(val)
        this.currentPage = val
        this.queryObject.page = this.currentPage
        this.queryObject.start = (this.currentPage - 1) * this.pageSize
        this.loadData()
      },
      buttonGroupClick (type) {
        switch (type) {
          case 'add':
            this.dialogTitle = '新增仓库'
            this.dialogShow = true
            break
          case 'edit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.editForm = JSON.parse(JSON.stringify(this.tableSelect[0]))
            this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.rowDel()
            break
          default:
            console.log('error')
            break
        }
      },
      searchForm (values) {
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.currentPage = 1
        this.queryObject.page = this.currentPage
        this.queryObject.start = 0
        this.loadData()
      },
      rowDbclick (obj) {
        this.rowEdit(obj.row)
      },
      rowEdit (row) {
        this.dialogTitle = '编辑仓库'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            memberCode: list[0].memberCode,
            warehouseId: list[0].warehouseId,
            warehouseCode: list[0].warehouseCode
          }
          this.delete(this.paramsFormat('warehouse', params))
        })
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/warehouseAjax.do', 'post', this.queryObject)
          this.totalCount = 0
          this.tableValue.tableData = []
          if (data.warehouseList.length > 0) {
            this.tableValue.tableData = data.warehouseList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/warehouseAjax!delete.do', 'post', params)
          console.log(data)
          if (data.map.state === '3') {
            this.dialogShow = false
            this.msgShow(this, '删除成功', 'success')
            this.loadData()
          } else {
             this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
        }
      }
    }
  }
</script>
<style>
  .baidu-map{
    width: 100%;
    height: 550px;
  }
  .bm-serch{
  }
</style>
