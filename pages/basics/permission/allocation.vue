<template lang="pug">
  .content
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .mt-10
      elx-editable(
        :data.sync="tableData",
        :row-key="x=>x.text+x.filterObj",
        size="mini",
        border,
        v-loading="loading",
        :edit-config="{mode: 'row', props: {children: 'children'}}"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}")
        elx-editable-column(prop="text", label="菜单/功能名称")
        elx-editable-column(prop="opPermissionAllot", label="操作员权限", width="120",  :edit-render="{name: 'ElSelect', options: valueList}", v-if="showOperColumn")
        elx-editable-column(prop="roPermissionAllot", label="角色权限", width="120", :edit-render="{name: 'ElSelect', options: valueList}")



      <!--elx-table(-->
        <!--:data="tableValue.tableData",-->
        <!--:row-key="x=>x.text+x.filterObj",-->
        <!--size="mini",-->
        <!--border,-->
        <!--v-loading="loading",-->
        <!--:tree-props="{children: 'children', hasChildren: 'hasChildren'}")-->
        <!--elx-table-column(prop="text", label="菜单/功能名称")-->
        <!--elx-table-column(prop="opPermissionAllot", label="操作员权限", width="120px", :formatter="columnFormatter", v-if="showOperColumn")-->
        <!--elx-table-column(prop="roPermissionAllot", label="角色权限", width="120px", :formatter="columnFormatter")-->
    .text-right.mt-10
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 保存
</template>
<script>
  import buttonGroup from '@/components/buttonGroup.vue'

  export default {
    components: {
      buttonGroup
    },
    props: {
      queryParam: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        valueList:[{label: ' ', value: 0}, {label: '√', value: 1}, {label: '×', value: 2}],
        tableData:[],
        buttonGroupInfo: [
          { lbl: '全部启用', type: 'edit' },
          { lbl: '全部停用', type: 'refresh' },
          { lbl: '展开', type: 'refresh' },
          { lbl: '重置', type: 'refresh' }
        ],
        tableValue: {
          tableHead: [
            { lbl: '菜单/功能名称', prop: 'text' },
            { lbl: '操作员权限', prop: 'opPermissionAllot', width: '120px' },
            { lbl: '角色权限', prop: 'roPermissionAllot', width: '120px' }
          ],
          tableData: []
        },
        loading: false
      }
    },
    computed: {
      showOperColumn: _ => _.queryParam.allotType !== 2
    },
    mounted() {
      this.loadData()
    },
    methods: {
      columnFormatter({ row, cellValue }) {
        if (row.children && row.children.length === 0) {
          const o = { 0: ' ', 1: '√', 2: '×' }
          return o[cellValue] || cellValue
        } else {
          return ' '
        }
      },
      buttonGroupClick(type) {
        switch (type) {
          case 'allocation':
            if (!this.dialogTitle) {
              this.$message.error('请选择节点')
            } else {
              this.dialogShow = true
            }
            break
          case 'refresh':
            // this.$refs.search.searchHandler()
            this.loadData()
            break
        }
      },
      save() {
        this.$refs.dialogForm.validate((valid) => {
          if (valid) {
            this.$emit('save', this.form)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      cancel() {
        this.$emit('cancel')
      },
      async loadData() {
        this.loading = true
        try {
          const param = this.deepCopy(this.queryParam)
          switch (param.allotType) {
            case 0:
              param.allotType = 1
              break
            case 2:
              param.allotType = 3
              break
            case 4:
              param.allotType = 5
              break
          }
          const { data } = await this.proxy(this, '/scscm/app/permissionAjax!queryPermission.do', 'get', param)
          // this.tableValue.tableData = data.children
          this.tableData = this.deepCopy(data.children)
          console.log(this.tableData[0].hasOwnProperty('text'))
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      }
    }
  }


  // TODO 弹框不能改数据，子节点
  // 报 Cannot read property 'querySelector' of undefined
  // 原因，editable.vue中的_getColumnByRowIndex方法1303行，XEUtils.findIndexOf这个函数返回-1
  // 没有遍历子对象的值，看源码是有循环遍历的base.js 710行
  // 定位在base.js 693行  createiterateIndexOf方法，如果传入参数是数组，则仅对数组的第一层进行遍历，不再遍历第二层
  //
  // node_modules/vue-element-extends/packages/editable/src/editable.vue
  // node_modules/xe-utils/src/method/base.js
</script>

