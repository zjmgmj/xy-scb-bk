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
    name: 'BasicsInitInitok',
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
          { lbl: '机构', prop: 'orgCode', val: '', type: 'org' }
        ],
        buttonGroupInfo: [
          { lbl: '初始完成', type: 'confirm', icon: 'el-icon-edit' }
        ],
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          showSummary: false,
          tableHead: [
            { lbl: '机构代码', prop: 'orgCode' },
            { lbl: '机构名称', prop: 'orgName' },
            { lbl: '机构简称', prop: 'orgAbbreviate' },
            {
              lbl: '初始化完成', prop: 'iniokInitflag',
              formatter: ({ cellValue }) => cellValue === 1 ? '√' : '×'
            },
            {
              lbl: '初始化完成日期', prop: 'iniokInitdate',
              formatter: ({ cellValue }) => (cellValue || '').substr(0, 10)
            },
            { lbl: '初始化完成人', prop: 'iniokInitmanName' },
            { lbl: '子系统', prop: 'applicationName' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {},
          otherlikeCol: 0
        },
        loading: false,
        tableSelect: []
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
        this.queryObject.page = this.currentPage
        this.queryObject.limit = this.pageSize
        this.$refs.search.searchHandler()
      })
    },
    methods: {
      searchForm(values) {
        for (const key in values) {
          this.queryObject.queryBean[key] = values[key]
          if (!this.queryObject.queryBean[key]) {
            delete this.queryObject.queryBean[key]
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
          case 'confirm':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据')
              return false
            }
            const row = this.tableSelect[0]
            const {applicationCode,applicationName,orgCode,orgName} = row
            // const text2 = `您确定要对【<b>${orgName}</b>】机构的【<b>${applicationName}</b>】子系统进行初始化完成吗？<br>注意：<br>此操作不能反向操作，请仔细核对初始化数据正确后，再使用此功能。<br>初始化完成后将对现有的库存等业务、财务数据产生影响?`
            const text = [
              `您确定要对【<b>${orgName}</b>】机构的【<b>${applicationName}</b>】子系统进行初始化完成吗？`,
              '注意：',
              '此操作不能反向操作，请仔细核对初始化数据正确后，再使用此功能。',
              '初始化完成后将对现有的库存等业务、财务数据产生影响?`'
            ].join('<br>')
            const opts = {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '是',
              cancelButtonText: '否',
              type: 'warning',
              customClass: 'confirm-box'
            }

            this.$confirm(text, '提示', opts).then(() => {
              this.confirmOk({orgCode, applicationCode})
            })
            break
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/initokAjax.do', 'post', this.queryObject)
          if ('list' in data) {
            this.tableValue.tableData = data.list
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async confirmOk(params) {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/initokAjax!updateComp.do', 'post', params)
          if (data.map.state === '3') {
            this.dialogShow = false
            this.msgShow(this, '初始化成功', 'success')
            this.loadData()
          } else {
            this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
    }
  }
</script>
<style>
  .confirm-box {
    width: 600px;
  }
</style>
