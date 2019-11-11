<template lang="pug">
  .content
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .mt-15
      el-form(ref="dialogForm", :model="form", :rules="rules", label-width="80px")
        el-row(:gutter="10")
          el-col(:span="5")
            el-form-item(label="账户", prop="userName")
              el-input.full-width(v-model="form.userName", clearable, size="mini")
          el-col(:span="5")
            el-form-item(label="密码", prop="tempPassword")
              el-input.full-width(v-model="form.tempPassword", clearable, size="mini")
          el-col(:span="5")
            el-form-item(label="姓名", prop="userNickname")
              el-input.full-width(v-model="form.userNickname", clearable, size="mini")
          el-col(:span="5")
            el-form-item(label="电话", prop="userPhone")
              el-input.full-width(v-model="form.userPhone", clearable, size="mini")
          el-col(:span="4")
            el-form-item(label="邮箱", prop="userEmail")
              el-input.full-width(v-model="form.userEmail", clearable, size="mini")
        el-row(:gutter="10")
          el-col(:span="5")
            el-form-item(label="用户类型", prop="rcbType")
              el-select.full-width(v-model="form.rcbType", placeholder="请选择", size="mini", @change="changeRcbType", :disabled="!form.isNew")
                el-option(v-for="item in rcbTypeList", :key="item.label", :label="item.label", :value="item.value")
          el-col(:span="10", v-if="form.rcbType===1")
            el-form-item(label="货主", prop="_cbCode")
              el-select.full-width(
                v-model="form._cbCode",
                placeholder="请选择",
                size="mini",
                :disabled="!form.isNew",
                filterable,
                remote,
                :remote-method="obtainCompany",
                @change="obtainAuthorization")
                el-option(v-for="item in companyList", :key="item.companyCode", :label="item.companyName", :value="item.companyCode")
          el-col(:span="10", v-else-if="form.rcbType===2")
            el-form-item(label="质押银行", prop="cbCode")
              el-select.full-width(
                v-model="form.cbCode",
                placeholder="请选择",
                size="mini",
                :disabled="!form.isNew",
                filterable,
                remote,
                :remote-method="obtainPledge",
                @change="obtainAuthorization")
                el-option(v-for="item in pledgeList", :key="item.pledgebankCode", :label="item.pledgebankName", :value="item.pledgebankCode")
          el-col(:span="5")
            el-form-item(label="业务机构", prop="orgCode")
              org-select(v-model="form.orgCode", @change="syncName($event,'orgName','orgName')")
          el-col(:span="4")
            el-form-item(label="业务部门", prop="deptCode")
              dept-select(v-model="form.deptCode", @change="syncName($event,'deptName','deptName')")
        el-form-item(label="备注", prop="userRemark")
          el-input.full-width(v-model="form.userRemark", clearable, size="mini")
      .mt-15
        .table-content
          vxe-table(
            ref="table",
            :data="tableValue.tableData",
            size="mini",
            border,
            :height="tableValue.tableHeight"
            @cell-click="cellClick"
            @selection-change="selectionChange",
            v-loading="loading")
            vxe-table-column(type="selection", width="50", v-if="tableValue.hasCbx", align="center")
            vxe-table-column(
              v-for="(head, index) in tableValue.tableHead",
              :key="head.prop",
              show-overflow-tooltip,
              :formatter="head.formatter ? head.formatter : null",
              :field="head.prop",
              :width="head.width ? head.width : ''",
              :min-width="head.minWidth? head.minWidth : ''",
              :title="head.lbl")
</template>
<script>
  import orgSelect from '@/components/select/orgSelect'
  import deptSelect from '@/components/select/deptSelect'
  import basicElxTable from '@/components/basicElxTable'
  import buttonGroup from '@/components/buttonGroup.vue'

  export default {
    components: {
      orgSelect,
      deptSelect,
      buttonGroup,
      basicElxTable
    },
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            isNew: true,

            userName: '',
            tempPassword: '',
            userNickname: '',
            userPhone: '',
            userEmail: '',
            rcbType: 1,
            _cbName: '',
            _cbCode: '',
            cbName: '',
            cbCode: '',
            orgCode: '',
            deptCode: '',
            userRemark: '',
            userState:0,
            userClass:0,
            userSysadmin:1,
            userExport:0
          }
        }
      },
      userId: {
        type: Number,
        default: -1
      },
      rcbType: {
        type: Number,
        default: -1
      },
      cbCode: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        rules: {
          userName: [
            { required: true, message: '请输入账户', trigger: 'blur' }
          ],
          userNickname: [
            { required: true, message: '请输入姓名', trigger: 'blur' }
          ],
          userPhone: [
            { required: true, message: '请输入电话', trigger: 'blur' }
          ],
          rcbType: [
            { required: true, message: '请选择用户类型', trigger: 'blur' }
          ],
          companyName: [
            { required: true, message: '请选择货主/质押银行', trigger: 'blur' }
          ],
          deptCode: [
            { required: true, message: '请选择所属部门', trigger: 'blur' }
          ],
          orgCode: [
            { required: true, message: '请选择所属机构', trigger: 'blur' }
          ]
        },
        rcbTypeList: [{ value: 1, label: '货主' }, { value: 2, label: '质押银行' }],
        companyList: [],
        pledgeList: [],
        buttonGroupInfo: [
          { lbl: '取消', type: 'cancel', icon2: 'el-icon-plus' },
          { lbl: '保存', type: 'add', icon: 'el-icon-plus' }
        ],
        tableValue: {
          // pageShow: true,
          hasCbx: true,
          // showRowIndex: true,
          tableHeight: '295px',
          tableHead: [
            { lbl: '功能名称', prop: 'authorizationName' },
            { lbl: '功能模块', prop: 'authorizationModule' }
          ],
          tableData: []
        },
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        loading: false,
        tableSelect: []
      }
    },
    mounted() {
      if (this.form.cbCode) {
        if (this.form.rcbType === 1) {
          this.form._cbCode = this.form.cbCode
          this.form._cbName = this.form.cbName
          this.form.cbCode = ''
          this.form.cbName = ''
          this.obtainCompany(this.form._cbName)
          this.$nextTick(() => this.obtainAuthorization())
        } else if (this.form.rcbType === 2) {
          this.obtainPledge(this.form.cbName)
          this.$nextTick(() => this.obtainAuthorization())
        }
      } else {
        this.obtainCompany(' ')
        this.obtainPledge(' ')
      }
    },
    methods: {
      syncName(e, fromKey, toKey) {
        this.form[toKey] = e[fromKey]
      },
      selectionChange(rows) {
        this.tableSelect = rows
      },
      cellClick({ row, column, event }) {
        console.log(row)
        this.$refs.table.toggleRowSelection(row)
      },
      changeRcbType() {
        this.tableValue.tableData = []
        this.form._cbCode = ''
        this.form._cbName = ''
        this.form.cbCode = ''
        this.form.cbName = ''
      },
      async obtain() {
        const params = {
          userId: this.userId,
          rcbType: this.rcbType,
          cbCode: this.cbCode
        }
        const url = 'scscm/app/rcbAccountAjax!edit.do'
        const { data } = await this.proxy(this, url, 'get', params)
        if ('userBean' in data) {
          this.form = data.userBean
        } else {
          this.$message.error('未查到数据')
          throw new Error('未查到数据')
        }
      },
      async obtainCompany(query) {
        const params = {
          typeStr: 'HZ',
          query,
          page: 1,
          limit: 20
        }
        const url = 'scscm/app/companyAjax!queryCompanyCombo.do'
        const { data } = await this.proxy(this, url, 'get', params)
        if ('companyList' in data) {
          this.companyList = data.companyList
        } else {
          this.companyList = []
        }
      },
      async obtainPledge(query) {
        const params = {
          query,
          page: 1,
          limit: 20
        }
        const url = 'scscm/app/pledgeSetAjax!queryCombo.do'
        const { data } = await this.proxy(this, url, 'get', params)
        if ('list' in data) {
          this.pledgeList = data.list
        } else {
          this.pledgeList = []
        }
      },
      async obtainAuthorization(newValue) {
        if (this.form.rcbType === 1) {
          const name = this.companyList.filter(x => x.companyCode === newValue)[0].companyName
          this.syncName({ name }, 'name', '_cbName')
        } else if (this.form.rcbType === 2) {
          const name = this.pledgeList.filter(x => x.pledgebankCode === newValue)[0].pledgebankName
          this.syncName({ name }, 'name', 'cbName')
        }

        const params = {
          rcbType: this.form.rcbType,
          cbCode: newValue,
          page: 1,
          limit: 20
        }
        const url = 'scscm/app/rcbAccountAjax!queryAuthorizationList.do'
        const { data } = await this.proxy(this, url, 'get', params)
        if ('authorizationList' in data) {
          this.tableValue.tableData = data.authorizationList
          this.$nextTick(() => {
            this.$refs.table.getRecords().forEach(x => this.$refs.table.toggleRowSelection(x, x.rcbType === 0))
          })
        } else {
          this.tableValue.tableData = []
        }
      },
      buttonGroupClick(flag) {
        switch (flag) {
          case 'cancel':
            this.$emit('cancel')
            break
          case 'add':
            this.save()
            break
        }
      },
      async asyncSave() {
        try {
          if (this.tableSelect.length===0){
            this.$message.error('请勾选功能')
            return false
          }
          const obj={}
          obj.mod = this.deepCopy(this.form)
          obj.list = this.deepCopy(this.tableSelect)
          const params = {rcbStr: JSON.stringify(obj)}

          let api = 'scscm/app/rcbAccountAjax!save.do'
          if (this.form.operatorCode) {
            api = 'scscm/app/rcbAccountAjax!update.do'
          }

          const { data } = await this.proxy(this, api, 'post', params)
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$refs.dialogForm.resetFields()
          this.$emit('save')
        } catch (e) {
          console.error(e)
        }
      },
      save() {
        this.$refs.dialogForm.validate((valid) => {
          if (valid) {
            this.asyncSave()
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
    }
  }
</script>
