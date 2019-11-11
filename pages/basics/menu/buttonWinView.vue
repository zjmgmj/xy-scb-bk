<template lang="pug">
  .content
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      edit-table(ref="table", :tableValue="tableValue", :loading="loading")
    .mt-15.mb-15.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import editTable from '@/components/editTable'
  import buttonGroup from '@/components/buttonGroup'

  export default {
    components: {
      buttonGroup,
      editTable
    },
    props: {
      originForm: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        buttonGroupInfo: [
          { lbl: '新增', type: 'add' },
          { lbl: '复制', type: 'copy' },
          { lbl: '删除', type: 'del' },
          { lbl: '单据按钮模板', type: 'template' }
        ],
        tableValue: {
          hasCbx: false,
          pageShow: false,
          showRowIndex: false,
          tableHeight: '295px',
          tableHead: [
            { lbl: '名称', prop: 'buttonName' },
            { lbl: 'action', prop: 'buttonAction' },
            { lbl: 'method', prop: 'buttonMethod' },
            {
              lbl: '权限条件',
              prop: 'buttonSort',
              width: '100px',
              type: 'ElSelect',
              list: [{ label: '操作员', value: 0 }, { label: '登陆', value: 1 }, { label: '菜单权限', value: 2 }],
            },
            {
              lbl: '按钮类别',
              prop: 'buttonShowinbutton',
              width: '100px',
              type: 'ElSelect',
              list: [{ label: '按钮', value: 0 }, { label: '系统', value: 1 }]
            },
            { lbl: '备注', prop: 'buttonRemark' }
          ],
          validRules: {
            buttonName:[{required: true, message: '必须填写'}],
            buttonAction:[{required: true, message: '必须填写'}],
            buttonMethod:[{required: true, message: '必须填写'}],
          },
          tableData: []
        },
        loading: false,
        permissionCode: '',
        menuProperty: 0
      }
    },
    created() {
      if (!('permissionCode' in this.originForm)){
        console.error('permissionCode 必填')
        this.$message.error('permissionCode 必填')
      }

      this.permissionCode = this.originForm.permissionCode
      this.menuProperty = this.originForm.menuProperty || 0
      const params = {
        permissionCode: this.permissionCode,
        sort: '[{"property":"buttonCode","direction":"ASC"}]'
      }
      this.proxy(this, 'scscm/app/menuAjax!queryButton.do', 'get', params)
        .then(x => this.tableValue.tableData = x.data.buttonList)
    },
    methods: {
      buttonGroupClick(flag) {
        let obj
        const table = this.$refs.table.getRef()
        switch (flag) {
          case 'add':
            obj = {
              permissionCode: this.permissionCode,
              menuProperty: this.menuProperty,
              dataFlag: 0,
              buttonShowinbutton: 0,
              buttonSort: 2
            }
            table.insertAt(obj, -1)
            break
          case 'copy':
            obj = table.getCurrentRow()
            if (!obj) {
              this.$message.error('请选择数据')
              return false
            }
            obj = this.deepCopy(obj)
            obj.buttonId = ''
            obj.buttonCode = ''
            obj.dataFlag = 0
            obj.menuProperty = this.menuProperty
            delete obj._XID
            table.insertAt(obj, -1)
            break
          case 'del':
            obj = table.getCurrentRow()
            if (!obj) {
              this.$message.error('请选择数据')
              return false
            }
            table.remove(obj)
            break
          case 'template':
            obj = {
              permissionCode: this.permissionCode,
              menuProperty: this.menuProperty,
              dataFlag: 0,
              buttonShowinbutton: 0,
              buttonSort: 2,
              buttonAction:'',
              buttonRemark: ''
            }
            table.insertAt({ buttonName: '查询', buttonMethod: 'execute', ...obj }, -1)
            table.insertAt({ buttonName: '修改查看', buttonMethod: 'edit', ...obj }, -1)
            table.insertAt({ buttonName: '保存', buttonMethod: 'save', ...obj }, -1)
            table.insertAt({ buttonName: '修改', buttonMethod: 'update', ...obj }, -1)
            table.insertAt({ buttonName: '删除', buttonMethod: 'delete', ...obj }, -1)
            table.insertAt({ buttonName: '查询明细', buttonMethod: 'queryDetail', ...obj }, -1)
            break
        }
      },
      async asyncSave(params) {
        try {
          const api = 'scscm/app/menuAjax!saveButon.do'
          const { data } = await this.proxy(this, api, 'post', params)
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$emit('save', 'button')
        } catch (e) {
          console.error(e)
        }
      },
      save() {
        const table = this.$refs.table.getRef()
        table.validate(valid=>{
          if (valid){
            const list = []
            table.getUpdateRecords().forEach(x=>{
              const obj = this.deepCopy(x)
              obj.dataFlag = 1
              delete obj._XID
              list.push(obj)
            })
            table.getInsertRecords().forEach(x=>{
              const obj = this.deepCopy(x)
              obj.dataFlag = 0
              delete obj._XID
              list.push(obj)
            })
            table.getRemoveRecords().forEach(x=>{
              const obj = this.deepCopy(x)
              obj.dataFlag = 2
              delete obj._XID
              list.push(obj)
            })
            if (list.length===0){
              this.$message.error('没有需要保存的记录')
              return false
            }
            // 封装接口可用的参数
            const params = {}
            for (let i = 0; i < list.length; i++) {
              params['buttonList['+i+']'] = list[i]
            }
            this.asyncSave(params)
          }
        })
      },
      cancel() {
        this.$emit('cancel', 'button')
      }
    }
  }
</script>
