<template lang="pug">
  el-dialog(title="条款设置登记", :visible="true", width="1200px", @close="close")
    el-form(ref="form", :model="form", :rules="rules", label-width="60px")
      el-form-item(label="名称", prop="termsettingName")
        el-input.full-width(v-model="form.termsettingName", clearable, size="mini")
    .mt-10
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      vxe-table.mt-15(ref="editTable",
        :data.sync="tableValue.tableData", 
        size="mini", 
        border, 
        :showIcon="false",
        :edit-config="{trigger: 'dblclick', mode: 'cell'}", 
        :edit-rules="tableValue.validRules || null", 
        show-all-overflow, 
        highlight-current-row,
        :height="tableValue.tableHeight ? tableValue.tableHeight : '400px'"
        @current-change="handleSelectionChange", 
        @cell-click="_tableSelectRow",
        @blur-active="cellEdit")
        vxe-table-column(type="selection", width="40", v-if="tableValue.hasCbx")
        vxe-table-column(type="index", width="40", v-if="tableValue.showRowIndex")
        template(v-for="column in tableValue.tableHead")
          vxe-table-column(:prop="column.prop", :width="column.width? column.width : ''", :label="column.lbl", :edit-render="column.noedit ? null : {name: 'input'}")
      .mt-15.text-right
        el-button(type="primary", size="mini", @click="save") 保存
        el-button(size="mini", @click="close") 关闭
</template>
<script>
import buttonGroup from '~/components/buttonGroup.vue'
export default {
  components: {
    buttonGroup
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // row: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // }
  },
  data () {
    return {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
        ],
      tableValue: {
        hasCbx: false,
        pageShow: false,
        showRowIndex: false,
        tableHead: [
          {lbl: '排序', prop: 'termsettingSort', width: '100px', noedit: true},
          {lbl: '条款名称', prop: 'termsettingText', width: '200px'},
          {lbl: '条款内容', prop: 'termsettingContent'}
        ],
        tableData: []
      },
      rowSelection: [],
      // initParams: {},
      delRow: [],
      rules: {
        termsettingName: [{ required: true, message: '请输入名称', trigger: 'blur' }]        
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      // console.log('row', this.row)
      if (this.form.termsettingCode) {
        const params = {
          termsettingCode: this.form.termsettingCode,
          page: 1,
          start: 0,
          limit: 25,
          sort:[{"property":"termsettingSort","direction":"ASC"}]
        }
        this.getDetail(params)
      }
      // this.initParams = {
      //   termsettingId: this.row.termsettingId,
      //   memberCode: this.row.memberCode,
      //   basicShare: this.row.basicShare,
      //   billtypeCode: this.row.billtypeCode,
      //   termsettingCode: this.row.termsettingCode,
      //   termsettingName: this.row.termsettingName,
      //   termsettingDefault: this.row.termsettingDefault
      // }
    })    
  },
  methods: {
    close() {
      this.$refs.form.resetFields()
      this.$emit('close')
    },
    save () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const detailList = []
          let isAdjustWeight = true
          let mainMod = {}
          const deleteList = []
          if (this.form.flag === 'copy') {
            mainMod = {
              termsettingName: this.form.termsettingName,
              billtypeCode: this.form.billtypeCode,
              memberCode: this.form.memberCode
            }             
          } else {
            mainMod = JSON.parse(JSON.stringify(this.form))
          }          
          console.log('mainMod', mainMod)
          this.tableValue.tableData.map((item) => {
            if (!item.termsettingText) {
              this.$message.error('请输入条款名称')
              isAdjustWeight = false
              return
            }
            console.log('flag--', this.form.flag)
            item.termsettingName = mainMod.termsettingName
            delete item._XID
            if (item.dataFlag === '2') {
              deleteList.push(item)
            } else {
              detailList.push(item)
            }            
          })
          console.log(JSON.stringify(detailList))
          if (isAdjustWeight) {
            const params = {
              detailList: detailList,
              mainMod: mainMod,
              deleteList: deleteList
            }
            if (this.form.termsettingCode && this.form.flag !== 'copy') {
              params.mainMod.tempDirty = 'update'
            }
            this.saveTermsetting({termsettingStr: JSON.stringify(params)})
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    async getDetail (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!queryDetail.do', 'post', params)
        console.log('--------------data')
        this.tableValue.tableData = []
        if (data.termsettingList.length > 0) {
          this.tableValue.tableData = data.termsettingList
          console.log('data----', this.tableValue.tableData)
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async saveTermsetting (params) {
      try {
        let api = 'scscm/app/termsettingAjax!save.do'
        if (this.form.termsettingCode && this.form.flag !== 'copy') {
          api = 'scscm/app/termsettingAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', params)
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '保存失败')
          return
        }
        this.$message.success('保存成功')
        this.$emit('save')
      } catch (e) {
        this.$message.error('网络异常')
        console.error(e)
      }
    },
    buttonGroupClick(flag) {
      switch(flag) {
        case 'add':
          const termsettingSort =  this.tableValue.tableData.length === 0 ? 0 : this.tableValue.tableData[this.tableValue.tableData.length - 1].termsettingSort + 1
          const addObj = {termsettingSort: termsettingSort, termsettingText: '', termsettingContent: ''}
          this.tableValue.tableData.push(addObj)
          this.totalCount ++
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
            this.rowSelection[0].dataFlag = '2'
            this.$refs.editTable.remove(this.rowSelection[0])
          })
          break
        default:
          console.error('error')
          break
      }
    },
    handleSelectionChange (obj) {    
      this.rowSelection = [obj.row]
      // console.log('handleSelectionChange', row)
    },
    cellEdit(row, cell, idx, event) {
      console.log('cellEdit', row)
      // this.$emit('rowEditInfo', row)
    }
  }
}
</script>

