<template lang="pug">
  el-dialog(title="工作组设置登记", :visible="true", top="10px", width="1200px", @close="close")
    el-form(ref="form", :model="form", :rules="rules", label-width="60px")
      el-row
        el-col(:span="6")
          el-form-item(label="代码", prop="workgroupCode")
            el-input.full-width(v-model="form.workgroupCode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="组名", prop="workgroupName")
            el-input.full-width(v-model="form.workgroupName", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="仓库", prop="warehouseCode")
            el-select.full-width(v-model="form.warehouseCode", remote, filterable, :remote-method="getWarehouse", placeholder="请选择", size="mini")
              el-option(v-for="item in warehouseList", :key="item.warehouseCode", :label="item.warehouseName", :value="item.warehouseCode")            
        el-col(:span="6")
          el-form-item(label="所属机构", prop="orgCode", label-width="90px")
            el-select.full-width(v-model="form.orgCode", remote, filterable, :remote-method="getOrg", placeholder="请选择", size="mini")
              el-option(v-for="item in orgList", :key="item.orgCode", :label="item.orgAbbreviate", :value="item.orgCode")            
      el-row
        el-col(:span="6")
          el-form-item(label="类别", prop="workgroupClass")
            el-select.full-width(v-model="form.workgroupClass", placeholder="请选择", size="mini")
              el-option(v-for="item in workgroupClassList", :key="item.code", :label="item.name", :value="item.code")
        el-col(:span="18")
          el-form-item(label="备注", prop="workgroupRemark")
            el-input.full-width(v-model="form.workgroupRemark", clearable, size="mini")
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
          vxe-table-column(:formatter="column.formatter", :prop="column.prop", :width="column.width? column.width : ''", :edit-render="{type: 'default', autofocus: true}", :label="column.lbl", v-if="column.type == 'select'")
            template(v-slot:edit="{ row }")
              el-select(v-model="row[column.prop]", filterable, remote, :remote-method="column.optionProps.remoteMethod", size="mini")
                el-option(v-for="item in column.list" :key="item[column.optionProps.value]" :label="item[column.optionProps.label]" :value="item[column.optionProps.value]")                         
          vxe-table-column(:prop="column.prop", :width="column.width? column.width : ''", :label="column.lbl", :edit-render="column.noedit ? null : {name: 'ElInput'}", v-else)
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
          {lbl: '员工', prop: 'employeeCode', width: '150px', type: 'select', list: [],
            formatter: (row, column, cellValue) => {
              const employeeCombo = this.employeeComboList.filter((item) => {
                return item.employeeCode === cellValue
              })
              const val = employeeCombo[0] ? employeeCombo[0].employeeName : cellValue
              row.employeeName = val
              return val
            },
            optionProps: {
              value: 'employeeCode', 
              label: 'employeeName', 
              remoteMethod: this.getEmployee
            }       
          },
          {lbl: '工种名称', prop: 'worktypeName', type: 'select', list: [], 
            optionProps: {
              value: 'worktypeName', 
              label: 'worktypeName', 
              remoteMethod: this.getWorktype
            }
          }
        ],
        tableData: []
      },
      rowSelection: [],
      delRow: [],
      rules: {
        workgroupName: [{ required: true, message: '请输入组名', trigger: 'blur' }],
        warehouseCode: [{ required: true, message: '请选择仓库' }],
        orgCode: [{ required: true, message: '请选择所属机构' }]
      },
      warehouseList: [],
      employeeComboList: [],
      worktypeList: [],
      orgList: [],
      workgroupClassList: [
        {code: 0, name: '内部'},
        {code: 1, name: '外部'},
      ]
    }
  },
  mounted () {
    this.$nextTick(() => {
      // console.log('row', this.row)
      this.getOrg()
      this.getEmployee()
      this.getWorktype()
      this.getWarehouse()
      if (this.form.workgroupCode) {
        const params = {
          workgroupCode: this.form.workgroupCode,
          page: 1,
          start: 0,
          limit: 25,
          sort:[{"property":"termsettingSort","direction":"ASC"}]
        }
        this.getDetail(params)
      }
      this.initParams = {
        var: '',
        dataEditOrgName: '',
        dataFlag: '',
        displayStr: '',
        dataTally: '',
        dataCrane: '',
        dataStevedore1: '',
        dataStevedore2: '',
        employeesJson: '',
        warehouseName: '',
        orgName: '',
        workgroupId: '',
        workgroupCode: '',
        memberCode: '',
        dataEditOrg: '',
        employeeCode: '', 
        worktypeName: ''
      }
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
          const arr = []
          let isSave = true          
          const mainMod = JSON.parse(JSON.stringify(this.form))          
          this.tableValue.tableData.map((item) => {
            if (!item.employeeCode) {
              this.$message.error('请选择员工')
              isSave = false
              return
            }
            const obj = Object.assign({}, mainMod, item)
            delete obj.idx
            arr.push(obj)
          })
          if (isSave) {
            // arr = this.$refs.editTable.getRemoveRecords().concat(arr)
            const params = {
              detailList: arr,
              mainMod: this.form
            }
            this.saveAsync({workgroupStr: JSON.stringify(params)})
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    async getDetail (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/workgroupAjax!queryDetail.do', 'post', params)
        console.log('--------------data')
        this.tableValue.tableData = []
        if (data.workgroupList.length > 0) {
          this.tableValue.tableData = data.workgroupList
          console.log('data----', this.tableValue.tableData)
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getOrg (key = '') {
      try {
        const params = {
          query: key,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/orgAjax!queryCombo.do', 'post', params)        
        this.orgList = []
        if (data.orgComboList.length > 0) {
          this.orgList = data.orgComboList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getEmployee (key = '') {
      try {
        const params = {
          query: key,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/employeeAjax!queryCombo.do', 'post', params)        
        this.tableValue.tableHead[0].list = []
        if (data.employeeComboList.length > 0) {
          this.tableValue.tableHead[0].list = data.employeeComboList
          this.employeeComboList = this.tableValue.tableHead[0].list
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getWorktype (key = '') {
      try {
        const params = {
          query: key,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/worktypeAjax!queryCombo.do', 'post', params)        
        this.tableValue.tableHead[1].list = []
        if (data.worktypeList.length > 0) {
          this.tableValue.tableHead[1].list = data.worktypeList
          this.worktypeList = this.tableValue.tableHead[1].list
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getWarehouse (key = '') {
      try {
        const params = {
          query: key,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/warehouseAjax!queryCombo.do', 'post', params)        
        this.warehouseList = []
        if (data.warehouseList.length > 0) {
          this.warehouseList = data.warehouseList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async saveAsync (params) {
      try {
        let api = 'scscm/app/workgroupAjax!save.do'
        if (this.form.workgroupCode) {
          api = 'scscm/app/workgroupAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', params)
        console.log(data)
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '保存失败')
          return
        }
        this.$message.success('保存成功')
        this.$emit('save')
      } catch (e) {
        console.error(e)
      }
    },
    buttonGroupClick(flag) {
      switch(flag) {
        case 'add':
          this.$refs.form.validate((valid) => {
            if (valid) {
              this.tableValue.tableData.push(this.initParams)
              this.totalCount ++
            } else {
              console.log('error submit!!')
              return false
            }
          })
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
            this.rowSelection[0].dataFlag = '2'
            this.$refs.editTable.remove(this.rowSelection[0])
            // this.$refs.editTable.removeSelecteds()
          })
          break
        default:
          console.error('error')
          break
      }
    },
    handleSelectionChange ({row}) {      
      this.rowSelection = [row]
      // console.log('handleSelectionChange', row)
    },
    cellEdit(row, cell, idx, event) {
      console.log('cellEdit', row)
      // this.$emit('rowEditInfo', row)
    }
  }
}
</script>

