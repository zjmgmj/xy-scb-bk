<template lang="pug">
div
  el-table(ref="multipleTable", :data="currentData", :row-class-name="tableRowClassName", highlight-current-row,  v-loading="loading", style="width: 100%", border, @selection-change="handleSelectionChange", @current-change="handleCurrentChange", :default-sort="{order: 'descending'}", size="medium", :header-cell-class-name="headerCellClassName", :filter-change="tableFiler", @sort-change="sortChange", :show-summary="tableValue.summary? tableValue.summary : false", :summary-method="getSummaries")
    el-table-column(v-if="tableValue.hasCbx", type="selection", width="55")   
    template(v-for="head in tableValue.tableHead")
      //- el-table-column(v-if="head.type == 'date'", :label="head.lbl", :width="head.width ? head.width : 'auto'")
        template(slot-scope="scope") {{scope.row[head.prop]}}
      el-table-column(v-if="head.type == 'link'", :label="head.lbl", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          //- a(:href="(head.query) ? head.linkUrl + '?' + head.query + '='+scope.row[head.query] : head.linkUrl + '?id=' + scope.row.id") {{scope.row[head.prop]}}
          //- a(:href="head.linkUrl + '?' + urlFun(head, scope)") {{scope.row[head.prop]}}          
          router-link(:to="head.linkUrl + '?' + urlFun(head, scope)") {{scope.row[head.prop]}}
            el-badge.mark(value="主", v-if="scope.row.mainStatus == 1 && head.prop == 'name'")
      el-table-column(v-else-if="head.type == 'linkObject'", :label="head.lbl", :width="head.width? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'", :prop="head.prop", :sortable="head.sort ? head.sort : false")
        template(slot-scope="scope")
          //- a(:href="head.linkUrl + '?id=' + head.factValue(scope.row[head.prop]).id") {{head.factValue(scope.row[head.prop]).name}}
          router-link(:to="head.linkUrl + '?id=' + head.factValue(scope.row[head.prop]).id") {{head.factValue(scope.row[head.prop]).name}}
      el-table-column(v-else-if="head.type == 'linkRow'", :label="head.lbl", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'", :prop="head.prop", :sortable="head.sort ? head.sort : false")
        template(slot-scope="scope")
          //- a(:href="head.linkUrl + '?row=' + JSON.stringify(scope.row)") {{scope.row[head.prop]}}
          router-link(:to="head.linkUrl + '?row=' + JSON.stringify(scope.row)") {{scope.row[head.prop]}}
      el-table-column(v-else-if="head.type == 'edit'", :label="head.lbl", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'", :prop="head.prop", :sortable="head.sort ? head.sort : false")
        template(slot-scope="scope")
          span(v-if="!scope.row.edit") {{scope.row[head.prop] | rowData(head.prop)}}
            el-badge.mark(value="主", v-if="(scope.row.mainStatus == 1 || scope.row.mainAcct == 1) && head.prop == 'name'")
          template(v-else)
            el-input(size="mini", v-if="head.editType == 'text'", v-model="scope.row[head.prop]", @blur="verifyInput(head.prop, scope.row[head.prop], head.lbl)")
            el-date-picker.full-width(v-else-if="head.editType == 'date'", type="date", v-model="scope.row[head.prop]", size="small", format="yyyy-MM-dd", value-format="yyyy-MM-dd")
            el-select(v-else-if="head.editType == 'select'", v-model="scope.row[head.prop]", size="mini")
              el-option(v-for="item in head.selectList", :key="item.value", :label="item.label", :value="item.value")
            el-select.full-width(v-else-if="head.editType == 'gradingRegion'", v-model="scope.row[head.prop]", value-key, filterable, remote, multiple,  @focus="queryRegion", :remote-method="queryRegion", size="mini")
              el-option(v-for="(item, idx) in regionOptions", :key="idx", :label="item", :value="item")
            el-select.full-width(v-else-if="head.editType == 'gradingCategory'", v-model="scope.row[head.prop]", value-key, filterable, remote, @focus="querySupplyCatalog", size="mini")
              el-option(v-for="(item, idx) in supplyCatalogOptions", :key="idx", :label="item", :value="item")
            el-select.full-width(v-else-if="head.editType == 'dpt'", v-model="scope.row[head.prop]", value-key, filterable, remote, @focus="queryDptCombo", size="mini")
              el-option(v-for="(item, idx) in comboOptions", :key="idx", :label="item.name", :value="item.id + '&' + item.name")
            el-select.full-width(v-else-if="head.editType == 'acct'", v-model="scope.row[head.prop]", value-key, filterable, remote, @focus="queryAcctCombo", :remote-method="queryAcctCombo", size="mini", @change="selectChange")
              el-option(v-for="(item, idx) in acctOptions", :key="idx", :label="item.name", :value="item.platformCode + '&' + item.name + '&' + item.fkDpt.id + '&' + item.fkDpt.name")
            el-select.full-width(v-else-if="head.editType == 'org'", v-model="scope.row[head.prop]", value-key, filterable, remote, @focus="queryOrgCombo", size="mini")
              el-option(v-for="(item, idx) in orgOptions", :key="idx", :label="item.name", :value="item.id + '&' + item.name")
      el-table-column(v-else-if="head.type == 'action'", :align="head.align ? head.align : 'left'" :fixed="head.fixed", label="操作", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'", :prop="head.prop", :sortable="head.sort ? head.sort : false")
        template(slot-scope="scope")
          template(v-if="!scope.row.edit")
            template(v-for="(btn, index) in head.actionBtns", v-if="canShowRowBtn(btn.type, scope, btn.lbl) && scope.row['actionBtns']")
              el-button(type="text", v-if="scope.row['actionBtns'][index] || btn.lbl", :class="btn.class ? btn.class : 'default'", @click="handerRowBtn(scope.$index, scope.row, btn.type)") {{scope.row['actionBtns'][index] ? scope.row['actionBtns'][index] : btn.lbl}}
            template(v-else-if="canShowRowBtn(btn.type, scope, btn.lbl)")           
              el-button(type="text", :class="btn.class ? btn.class : 'default'", @click="handerRowBtn(scope.$index, scope.row, btn.type)") {{scope.row.btnLbl ? scope.row.btnLbl : btn.lbl}}
          template(v-else)
            el-button(type="text", class="default", @click="handerRowBtn(scope.$index, scope.row, 'save')") 保存
            el-button(type="text", class="default", @click="handerRowBtn(scope.$index, scope.row, 'cancel')") 取消
      el-table-column(v-else-if="head.type == 'object'", :label="head.lbl", :width="head.width? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'", :prop="head.prop", :sortable="head.sort ? head.sort : false")
        template.ellps-row.full-width(slot-scope="scope") {{head.factValue(scope.row[head.prop])}}
      el-table-column(v-else,:label="head.lbl", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'", :prop="head.prop", :sortable="head.sort ? head.sort : false", :align="head.align ? head.align : 'left'")
        template(slot-scope="scope") 
          .ellps-row.full-width {{scope.row[head.prop] | rowData(head.prop)}}
            el-badge.mark(value="主", v-if="scope.row.mainStatus == 1 && head.prop == 'name'")
            span(v-if="head.prop == 'billDateDays'") / 90
          //- span(v-if="head.prop == 'billDate'", @click="handerRowBtn(scope.$index, scope.row, 'lock')") / 90
          //-   i.iconfont.icon-lockb(v-if="scope.row.lockStatus == 0")
          //-   i.iconfont.icon-locka(v-else)
  .padding.text-right.row
    .col
      el-pagination(v-if="!tableValue.page", :current-page="currentPage", :page-size="pageSize", background, layout="prev, pager, next, jumper", :total="total", @current-change="pgCurrentChange")
    span(v-if="!tableValue.page", style="padding-bottom: 3px;") 共 {{total}} 条数据

</template>

<script>
  import { mapState } from 'vuex'
  export default {
     props: {
      tableValue: {
        type: null,
        default: false
      },
      currentPage: {
        type: Number,
        default: 1
      },
      total: {
        type: Number,
        default: 100
      },
      pageSize: {
        type: Number,
        default: 15
      },
      loading: {
        type: Boolean,
        default: true
      },
      lockFun: {
        type: Function,
        default: () => {}
        // require: true
      },
      sumsFun: {
        type: Function,
        default: () => {}
        // require: true
      }
    },
    data () {
      return {
        currentData: [],
        regionOptions: [],
        supplyCatalogOptions: [],
        comboOptions: [],
        acctOptions: [],
        orgOptions: [],
        isVerify: true
      }
    },
    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser
      })
    },
    watch: {
      'tableValue.tableData': {
        handler (newVal, oldVal) {
          this.currentData = Object.assign([], newVal)
        },
        deep: true
      }
    },
    beforeMount () {
      this.$nextTick(() => {
        console.log('---------')
        console.log(this.total)
        console.log(this.pageSize)
        this.currentData = Object.assign([], this.tableValue.tableData)
      })
    },   
    methods: {
      tableRowClassName ({row, rowIndex}) {
        if(this.tableValue.rowClassName){
          if (row.billDateDays >= 60) {
            return 'loss-cstm'
          } else if (row.billDateDays > 30 && row.billDateDays < 60) {
            return 'communicate-cstm'
          }
          if (row.rowClassName) {
            return row.rowClassName
          }
        }
      },
      headerCellClassName ({row, column, rowIndex, columnIndex}) {
        const head = this.tableValue.tableHead[columnIndex]
        if (head !== undefined && head.hasOwnProperty('required')) {
          return 'crm-table-required'
        }
      },
      str2Date (dateStr) {
        return new Date(dateStr)
      },
      canShowRowBtn (type, scope, lbl) {
        let result = true
        let condition = true
        if (this.currentUser.id !== 1) {
          const idx = this.currentUser.auths.findIndex(itm => this.$route.path.startsWith(itm.fkMenu.pageUrl))
          const currentAuth = this.currentUser.auths[idx]
          if (type === 'edit' && currentAuth.hasUpdate === 0) result = false
          if (type === 'delete' && currentAuth.hasDelete === 0) result = false
        }
        if(type === 'mapVisit'){
          condition = (scope.row.status === 1 && lbl === '地图')
        } else {
          condition = !((scope.row.mainStatus === 1 || scope.row.mainAcct === 1 || scope.row.del === false) && lbl === '删除')
        }
        return result && condition
      },
      handerRowBtn (idx, row, btnType) {
        row.idx = idx
        this.isVerify = true
        if (btnType === 'save') {
          let lblStr = ''
          for (const key in row){
            if (key === 'name') {
              this.tableValue.tableHead.map(itm => {
                if (itm.prop === 'name') {
                  lblStr = itm.lbl
                }
              })
            }
            this.verifyInput(key, row[key], lblStr)
          }
        }
        if (this.isVerify) {
          this.$emit(`tableRow${btnType.substring(0, 1).toUpperCase()}${btnType.substring(1)}`, row)
        }
      },
      handleSelectionChange (rows) {
        this.$emit('chooseData', rows)
      },
      handleCurrentChange (row) {
        this.$emit('chooseData', row)
      },
      pgCurrentChange (val) {
        // console.log(val)
        this.$emit('pageChange', val)
      },
      tableFiler (row, col) {
        // console.log('row')
        // console.log(row)
        // console.log('col')
        // console.log(col)
      },
      async queryRegion (query) {
        const params = {
          pageSize: 10,
          region: query
        }
        try {
          const { data } = await this.apiStreamPost('/proxy/common/post', {url: 'customerManage/customer/queryRegion', params: params})
            if (data.returnCode === 0) {
              this.regionOptions = data.list
            } else {
              this.msgShow(this, data.errMsg)
            }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
        }
      },
      async querySupplyCatalog () {
        try {
          const { data } = await this.apiStreamPost('/proxy/common/get', {url: 'customerManage/customer/querySupplyCatalog'})
            if (data.returnCode === 0) {
              this.supplyCatalogOptions = data.list
            } else {
              this.msgShow(this, data.errMsg)
            }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
        }
      },
      async queryDptCombo () {
        try {
          const { data } = await this.apiStreamPost('/proxy/common/get', {url: 'setting/dpt/queryCombo'})
            if (data.returnCode === 0) {
              this.comboOptions = data.list
            } else {
              this.msgShow(this, data.errMsg)
            }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
        }
      },
      async queryAcctCombo (query) {
        try {
          const params = {
          pageSize: 10,
          acctName: query
        }
          const { data } = await this.apiStreamPost('/proxy/common/post', {url: 'setting/acct/queryCombo', params: params})
            if (data.returnCode === 0) {
              this.acctOptions = data.list
            } else {
              this.msgShow(this, data.errMsg)
            }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
        }
      },
      async queryOrgCombo () {
        try {
          const { data } = await this.apiStreamPost('/proxy/common/get', {url: 'setting/org/queryCombo'})
            if (data.returnCode === 0) {
              this.orgOptions = data.list
            } else {
              this.msgShow(this, data.errMsg)
            }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
        }
      },
      selectChange (val) {
        console.log(val)
      },
      // headerClick (column, event) {
      //   console.log('---------')
      //   let obj = {
      //     sortable: column.sortable,
      //     order: column.order,
      //     property: column.property
      //   }
      //   this.$emit('sort', obj)
      // },
      sortChange (column, prop, order) {
        // console.log('**********')
        const obj = {
          sortable: column.sortable,
          order: column.order,
          property: column.prop
        }
        this.$emit('sort', obj)
      },
      verifyInput (prop, val, lbl) {
        if (prop === 'phone') {
          if (!this.mobileReg(val)) {
            this.msgShow(this, '手机号码格式错误')
            this.isVerify = false
          }
        }
        // if (prop == 'qqNo') {
        //   var reg = /^[0-9]{0,20}$/
        //   if (!reg.test(val)) {
        //     this.msgShow(this, 'QQ号必须为数字且不能超过20位数字')
        //     this.isVerify = false
        //   }
        // }
        if (prop === 'age') {
          const reg = /^[0-9]{0,3}$/
          if (!reg.test(val)) {
            this.msgShow(this, '年龄必须为数字且不能超过3位数字')
            this.isVerify = false
          }
        }
        if (prop === 'name' && lbl === '开户名称') {
          if (!this.chineseReg(val)) {
            this.msgShow(this, '开户名称只能为中文')
            this.isVerify = false
          }
        }
        if (prop === 'bankAcct') {
          const reg = /[\u4E00-\u9FA5]/
          if (reg.test(val)) {
            this.msgShow(this, '开户账号不能有中文')
            this.isVerify = false
          }
        }
      },
      getSummaries (params) {
        const { columns, data } = params
        const sums = []
        const that = this
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '合计'
            return
          }
          if (this.tableValue.tableHead[index].summary) {
            const values = data.map(item => Number(item[column.property]));
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr)
                if (!isNaN(value)) {
                  return that.accAdd(prev, curr)
                } else {
                  return prev
                }
              }, 0)
            }
          }          
        })
        if (this.sumsFun) {
          this.sumsFun(sums)
        }
        return sums
      },
      urlFun (head, scope) {
        if (head.query) {
          const obj = {}
          const queryKey = head.query
          for (let i=0;i<head.query.length; i++) {
            obj[queryKey[i]] = scope.row[queryKey[i]]   
          }
          console.log(JSON.stringify(obj))
          return 'row=' + JSON.stringify(obj)
        } else {
          return 'id=' + scope.row.id
        }
      }
    }
  }
</script>

<style lang="stylus", scoped>
@import "../assets/stylus/color"
.el-table__row
  .cell
    a
      color $color-main
      &:hover
        cursor pointer
    i.iconfont.icon-locka:hover,
    i.iconfont.icon-lockb:hover
      cursor pointer
</style>
