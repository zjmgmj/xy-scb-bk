<template lang="pug">
  .content.bg-gray.mt-15.ml-15.mr-15
    el-form(inline, :model="form")
      el-form-item.mb-0(label="机构")
        org-select(style="width:120px;", v-model="form.orgCode", size="small", @change="changeOrg")
      el-form-item.mb-0(label="本次关账时间")
        el-date-picker(style="width:140px;", v-model="form.closeaccDate", type="date", size="small", value-format="yyyy-MM-dd")
      el-form-item.mb-0(label="上次关账时间")
        el-input(style="width:140px;", v-model="form.lastCloseaccDate", readonly, size="small")
      el-form-item.mb-0(label="备注")
        el-input(style="width:160px;", v-model="form.closeaccRemark", size="small")
      el-form-item.mb-0
        el-button(type="primary", icon="el-icon-plus", size="mini", @click="add") 增加
        el-button(icon="el-icon-delete", size="mini", @click="del") 取消上次关账
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
  import basicElxTable from '@/components/basicElxTable'
  import orgSelect from '@/components/select/orgSelect'

  export default {
    layout: 'backend',
    components: {
      basicElxTable,
      buttonGroup,
      orgSelect
    },
    data() {
      return {
        form: {
          orgCode: '',
          closeaccDate: '',
          lastCloseaccDate: '',
          closeaccRemark: ''
        },
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHeight: '600px',
          tableHead: [
            { lbl: '机构', prop: 'orgName' },
            {
              lbl: '关账日期',
              prop: 'closeaccDate',
              formatter: ({ cellValue }) => cellValue.substr(0, 10)
            },
            { lbl: '关账人', prop: 'operatorName' },
            {
              lbl: '操作日期',
              prop: 'dataSystemdate',
              formatter: ({ cellValue }) => cellValue.replace('T', ' ')
            },
            { lbl: '备注', prop: 'closeaccRemark' }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          queryBean: {},
          sort: '[{"property":"orgCode","direction":"DESC"}]'
        },
        loading: false,
        tableSelect: [],
        checkNode: {}
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
      })
    },
    mounted() {
      this.queryObject.limit = this.pageSize
    },
    methods: {
      add() {
        if (!this.form.orgCode) {
          this.$message.error('请选择机构')
          return
        }
        if (!this.form.closeaccDate) {
          this.$message.error('请选择关账日期')
          return
        }
        const params = {
          orgCode: this.form.orgCode,
          closeaccDate: this.form.closeaccDate,
          closeaccRemark: this.form.closeaccRemark
        }
        this.proxy(this, 'scscm/app/closeaccAjax!save.do', 'post', { closeacc: params })
          .then(x => {
            const data = x.data
            if (data.map.state === '3') {
              this.msgShow(this, '关账成功', 'success')
              this.loadData()
            } else {
              this.msgShow(this, data.map.msg)
            }
          })
      },
      del() {
        if (!this.form.orgCode) {
          this.$message.error('请选择机构')
          return
        }
        this.proxy(this, 'scscm/app/closeaccAjax!delete.do', 'post', { orgCode: this.form.orgCode })
          .then(x => {
            const data = x.data
            if (data.map.state === '3') {
              this.msgShow(this, '取消关账成功', 'success')
              this.loadData()
            } else {
              this.msgShow(this, data.map.msg)
            }
          })
      },
      changeOrg(org) {
        console.log(org)
        this.queryObject.currentPage = 1
        this.queryObject.queryBean.orgCode = org.orgCode
        this.loadData()
        this.obtainLastCloseDate()
      },
      rowSelection(row) {
        this.tableSelect = row
      },
      tableChange(val) {
        this.currentPage = val
        this.queryObject.currentPage = this.currentPage
        this.loadData()
      },
      async obtainLastCloseDate() {
        try {
          const { data } = await this.proxy(this, 'scscm/app/closeaccAjax!getLastCloseaccDate.do','get',{orgCode:this.form.orgCode})
          if ('closeaccDate' in data){
            this.form.lastCloseaccDate = data.closeaccDate
          }
        }catch (e) {
          console.error(e)
        }
      },
      async loadData() {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/closeaccAjax.do', 'post', this.queryObject)
          if ('closeaccList' in data) {
            this.tableValue.tableData = data.closeaccList
            this.totalCount = data.totalCount
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
</style>
