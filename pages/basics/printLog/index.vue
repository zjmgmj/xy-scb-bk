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
          :loading="loading"
          @paginateChange="tableChange",
          @rowSelection="rowSelection")
</template>

<script>
  import { mapState } from 'vuex'
  import buttonGroup from '@/components/buttonGroup.vue'
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'

  export default {
    layout: 'backend',
    name: 'BasicsPrintlog',
    components: {
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftSearch
    },
    data() {
      return {
        collapseName: ['1'],
        searchFormItems: [
          { lbl: '起始日期', prop: 'startDate', val: this.date2Str(new Date()) + ' 00:00:00', type: 'datetime' },
          { lbl: '结束日期', prop: 'endDate', val: this.date2Str(new Date()) + ' 23:59:59', type: 'datetime' },
          { lbl: '单据号', prop: 'printlogOptcode', val: '' },
          { lbl: 'IP地址', prop: 'printlogIp', val: '' },
          { lbl: '机器名称', prop: 'printlogHostname', val: '' },
          { lbl: '操作员', prop: 'operatorCode', val: '', type: 'operator' },
          { lbl: '单据类型', prop: 'printlogBilltype', val: '', type: 'select', labelKey: 'billtypeName', valueKey: 'billtypeCode', list: [] },
          {
            lbl: '作废',
            prop: 'invalidFlag',
            val: '',
            type: 'select',
            list: [{ value: '', label: '全部' }, { value: '0', label: '未作废' }, { value: '1', label: '作废' }]
          },
          { lbl: '备注', prop: 'printlogRemark', val: '' }
        ],
        buttonGroupInfo: [
          { lbl: '作废', type: 'invalid', icon: 'el-icon-delete' },
          { lbl: '取消作废', type: 'uninvalid', icon: 'el-icon-add' },
          { lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh' }
        ],
        tableValue: {
          hasCbx: true,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            { lbl: '作废', prop: 'invalidFlagStr', width: '100px' },
            { lbl: '日期', prop: 'printlogDate', width: '100px' },
            { lbl: '操作员', prop: 'operatorName' },
            { lbl: '单据类型', prop: 'billtypeName' },
            { lbl: '单据号', prop: 'printlogOptcode' },
            { lbl: 'IP地址', prop: 'printlogIp' },
            { lbl: '机器名称', prop: 'printlogHostname' },
            { lbl: '备注', prop: 'printlogRemark' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryLogBean: {
            likeCol: ['printlogOptcode', 'printlogIp', 'printlogHostname', 'printlogRemark']
          },
          otherlikeCol: 0,
          sort: '[{"property":"printlogDate","direction":"DESC"}]'
        },
        loading: false,
        tableSelect: [],
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
      })
    },
    mounted() {
      this.$nextTick(() => {
        this.queryObject.limit = this.pageSize
        this.proxy(this, 'scscm/app/billtypeAjax!queryBilltypeCombo.do', 'get', { page: 1, limit: 999 }).then(x => this.searchFormItems[6].list = x.data.billtypeList)
      })
    },
    methods: {
      searchForm(values) {
        for (const key in values) {
          this.queryObject.queryLogBean[key] = values[key]
          if (!this.queryObject.queryLogBean[key]) {
            delete this.queryObject.queryLogBean[key]
          }
        }
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      tableChange(val) {
        this.queryObject.page = this.currentPage = val
        this.loadData()
      },
      rowSelection(row) {
        this.tableSelect = row
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'invalid':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要作废的数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.invalid(true)
            break
          case 'uninvalid':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要取消作废的数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.invalid(false)
            break
          case 'refresh':
            this.$refs.search.searchHandler()
            // this.loadData()
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/billtypePrintAjax!queryPrintlog.do', 'post', this.queryObject)
          if ('printlogList' in data) {
            this.tableValue.tableData = data.printlogList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async invalid(flag) {
        try {
          let msg, confirmMsg, api
          if (flag) {
            msg = '作废成功'
            confirmMsg = '确定要作废当前记录？'
            api = 'scscm/app/billtypePrintAjax!updateInvalid.do'
          } else {
            msg = '取消作废成功'
            confirmMsg = '确定要取消作废当前记录？'
            api = 'scscm/app/billtypePrintAjax!updateUninvalid.do'
          }
          await this.confirmDialog(this, confirmMsg)
          const item = this.tableSelect[0]
          const { data } = await this.proxy(this, api, 'post', { printlogId: item.printlogId })
          if (data.map.state === '3') {
            this.dialogShow = false
            this.msgShow(this, msg, 'success')
            this.loadData()
          } else {
            this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          if (e!=='cancel') console.error(e)
        }
      },
    }
  }
</script>
<style>
</style>
