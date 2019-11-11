<template lang="pug">
  el-dialog(
    :width="cfg.width",
    :title="cfg.title",
    :visible="true",
    :append-to-body="appendToBody",
    :top="cfg.top",
    @close="close")
    .content(style="height: 90vh; position: relative;")
      erplr-panel.border(:right-padding="false")
        div(slot="left")
          left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
        .erp-content(ref="content", slot="right", style="padding: 0")
          basic-elx-table.table-content(
            ref="table",
            :tableValue="tableValue",
            :total="totalCount",
            :currentPage="currentPage",
            :pageSize="queryObject.limit",
            :loading="loading"
            :checkMethod="checkMethod",
            @cellClick="cellClick",
            @paginateChange="tableChange",
            @rowSelection="rowSelection")
          .toggle(@click="toggleSelectView")
            .toggle-icon(:class="{'el-icon-caret-top':!showSelectedView,'el-icon-caret-bottom':showSelectedView,}")
          .table-selected(:class="{hide: !showSelectedView}")
            basic-elx-table(ref="tableSelected", :tableValue="tableValueSelected")
          .button-box
            el-button(@click="close", size="mini") 取消
            el-button(@click="sure", type="primary", size="mini") 确定
</template>
<script>
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'

  export default {
    components: {
      erplrPanel,
      basicElxTable,
      leftSearch
    },
    props: {
      appendToBody: {
        type: Boolean,
        default: true
      },
      config: {
        type: Object,
        default: () => {
          return {}
        }
      },
      tableValue: {
        type: Object,
        default: () => {
          return {}
        }
      },
      searchFormItems: {
        type: Array,
        default: () => {
          return []
        }
      },
      likeCol: {
        type: Array,
        default: () => {
          return null
        }
      },
      // 重复记录过滤方法
      checkMethod: {
        type: Function,
        default: ({ row, rowIndex }) => true
      }
    },
    data() {
      return {
        cfg: {},
        loading: false,
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          page: 1,
          limit: 30
        },
        showSelectedView: false,
        tableValueSelected: {
          tableHeight: (300 - 37) + 'px',
          tableHead: [],
          tableData: []
        }
      }
    },
    computed: {},
    created() {
      const defaultConfig = {
        width: '90%',
        top: '10px',
        title: '',
        urlApi: '',
        queryBean: 'detailBean',
        listProp: 'reportList',
        extraParam: {}
      }
      this.cfg = this.extend(true, defaultConfig, this.config)
      this.tableValueSelected.tableHead = [...this.tableValue.tableHead]
    },
    mounted() {
      this.$nextTick(() => {
        this.contentHeight = this.$refs.content.offsetHeight
        this.originHeight = this.tableValue.tableHeight
        this.tableValue.tableHeight = (this.contentHeight - 44 - 37) + 'px'
      })
    },
    destroyed() {
      this.tableValue.tableHeight = this.originHeight
      this.tableValue.tableData = []
    },
    methods: {
      cellClick ({ row, rowIndex, column, columnIndex, event }) {
        // console.log()
        this.$emit('cellClick', { row, rowIndex, column, columnIndex, event })
      },
      close() {
        this.$emit('close')
      },
      sure() {
        const table = this.$refs.tableSelected.$refs.basicEditable
        const records = table.getInsertRecords()
        if (records.length === 0) {
          this.$message.error('没有选择数据！')
          return false
        }
        this.$emit('sure', { data: records })
      },
      toggleSelectView() {
        if (this.showSelectedView) {
          this.showSelectedView = false
          this.tableValue.tableHeight = (this.contentHeight - 44 - 37) + 'px'
        } else {
          this.showSelectedView = true
          this.tableValue.tableHeight = (this.contentHeight - 300 - 44 - 37) + 'px'
        }
      },
      searchForm(values) {
        Object.keys(values).forEach(key => {
          if (!(values[key] || values[key] === 0)) delete values[key]
        })
        this.queryObject[this.cfg.queryBean] = values
        Object.keys(this.cfg.extraParam).forEach(key => this.queryObject[key] = this.cfg.extraParam[key])
        if (this.likeCol) {
          this.queryObject[this.cfg.queryBean].likeCol = this.likeCol
        }
        // this.queryObject.otherlikeCol = 0
        this.queryObject.page = this.currentPage = 1
        this.loadData()
      },
      rowSelection(row) {
        this.$emit('rowSelection', row)
        const table = this.$refs.tableSelected.$refs.basicEditable
        table.remove(table.getInsertRecords())
        table.insert(row)        
      },
      tableChange(val) {
        this.queryObject.page = this.currentPage = val
        this.loadData()
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, this.cfg.urlApi, 'post', this.queryObject)
          if (data[this.cfg.listProp].length > 0) {
            this.tableValue.tableData = data[this.cfg.listProp]
            this.totalCount = data.totalCount
          } else {
            this.tableValue.tableData = []
            this.totalCount = 0
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .erp-content {
    position: relative;
    display: flex
    flex-direction: column;
  }

  .table-content {
    flex 1
    height: unset
  }

  .table-selected {
    flex: 0 0 auto
    height: 300px
  }

  .button-box {
    height 40px
    display flex
    justify-content flex-end
    align-items center
    flex 0 0 auto
  }

  .toggle {
    position: relative;
    width: 50px;
    height: 4px;
    align-self: center;
    background: #32c8a3;
    z-index: 100;
    text-align: center;
    flex 0 0 auto

    .toggle-icon {
      font-size 10px;
      position: absolute;
      top: -4px;
      left: 0;
      right: 0;
      color: #fff
    }

    &:hover {
      cursor: pointer;
      background: #F17060;
    }
  }
</style>
