<template lang="pug">
  div
    .content(style="height: 85vh")
      erplr-panel.border(:right-padding="false")
        div(slot="left")
          .ft-15.bg-gray.padding-sm 操作员/角色
          .padding-sm
            el-input(v-model="searchKey", clearable, size="mini", placeholder="查找操作员/角色")
          el-tree(
            ref="tree",
            accordion,
            highlight-current,
            check-on-click-node,
            :data="treeData",
            :props="{children: 'children',label: 'text'}",
            :filter-node-method="treeFilterNode",
            @node-click="treeNodeClick")
        .erp-content(slot="right")
          el-dropdown(size="small", @command="handleDropdownCommandR")
            el-button(type="primary", size="mini") 查询权
              i.el-icon-arrow-down.el-icon--right
            el-dropdown-menu(slot="dropdown")
              el-dropdown-item(v-for="item in dropdownOptions", :command="item.command", :key="item.label") {{item.label}}
          el-dropdown.ml-10(size="small", @command="handleDropdownCommandW")
            el-button(type="primary", size="mini") 编辑权
              i.el-icon-arrow-down.el-icon--right
            el-dropdown-menu(slot="dropdown")
              el-dropdown-item(v-for="item in dropdownOptions", :command="item.command", :key="item.label") {{item.label}}
          .table-content
            edit-table(ref="editTable", :tableValue="tableValue")
    .text-right.pt-10(slot="bottom")
      el-button(@click="close", size="small") 关闭
      el-button(@click="save", type="primary", size="small") 保存
</template>
<script>
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import editTable from '@/components/editTable'

  const selectOptions = [{ label: '角色', value: 0 }, { label: '启用', value: 1 }, { label: '停用', value: 2 }]

  export default {
    components: {
      erplrPanel,
      basicElxTable,
      editTable
    },
    props: {
      dataperCode: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        treeData: [],
        tableValue: {
          hasCbx: false,
          tableHeight: 720,
          pageination: false,
          showRowIndex: false,
          tableHead: [
            { lbl: '名称', prop: 'dataperItemstr', noedit: true },
            { lbl: '查询权', prop: 'dataperRstate', type: 'select', list: selectOptions },
            { lbl: '编辑权', prop: 'dataperWstate', type: 'select', list: selectOptions }
          ],
          tableData: []
        },
        queryObject: {
          page: 1,
          limit: 999,
          queryBean: {},
          sort: '[{"property":"dataperItemstr","direction":"ASC"},{"property":"permissionFlag","direction":"ASC"}]'
        },
        loading: false,
        searchKey: '',
        dropdownOptions: [{ label: '全部启用', command: 1 }, { label: '全部停用', command: 2 }, { label: '全部角色', command: 0 }],
        checkNode: {},
      }
    },
    computed: {
      treeFilterParam() {
        let obj = null
        try {
          const s = this.checkNode.data.filterObj
          obj = eval('(' + s.substring(1, s.length - 1) + ')')
        } catch (e) {
          // console.error(e)
          obj = null
        }
        if (obj && Object.keys(obj).length === 0) {
          obj = null
        }
        return obj
      }
    },
    watch: {
      searchKey(val) {
        this.$refs.tree.filter(val)
      }
    },
    mounted() {
      this.proxy(this, 'scscm/app/permissionDataAjax!queryOrTree.do', 'get', { areaParent: 'root' }).then(x => this.treeData = x.data.children)
    },
    methods: {
      save() {
        const updateRecords = this.$refs.editTable.getUpdateRecords()
        if (updateRecords.length === 0) {
          this.$message.error('未修改数据，无需保存')
        } else {
          const permissionStr = JSON.stringify(updateRecords)
          this.asyncSave({ permissionStr })
        }
      },
      close() {
        this.$emit('close')
      },
      treeNodeClick(data, node, e) {
        this.checkNode = { data, node }
        this.loadData()
      },
      treeFilterNode(value, data) {
        if (!value) return true
        return data.text.indexOf(value) !== -1
      },
      handleDropdownCommandR(command) {
        this.tableValue.tableData.forEach(x => x.dataperRstate = command)
      },
      handleDropdownCommandW(command) {
        this.tableValue.tableData.forEach(x => x.dataperWstate = command)
      },
      async asyncSave(param) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/permissionDataAjax!update.do', 'post', param)
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.loadData()
        } catch (e) {
          console.error(e)
        }
      },
      async loadData() {
        this.loading = true
        try {
          if (this.checkNode.node && this.checkNode.node.isLeaf) {
            const queryBean = {}
            queryBean.memberCode = this.treeFilterParam.memberCode
            queryBean.dataperCode = this.dataperCode
            if (this.treeFilterParam.roleCode) {
              queryBean.operatorCode = this.treeFilterParam.roleCode
              queryBean.permissionFlag = 1
            } else {
              queryBean.operatorCode = this.treeFilterParam.operatorCode
              queryBean.permissionFlag = 0
            }
            this.queryObject.queryBean = queryBean
            const { data } = await this.proxy(this, 'scscm/app/permissionDataAjax.do', 'post', this.queryObject)
            if ('permissionList' in data) {
              this.tableValue.tableData = data.permissionList
            }
          } else {
            this.tableValue.tableData = []
          }
        } catch (e) {
          console.error(e)
          this.tableValue.tableData = []
        }
        this.loading = false
      }
    }
  }
  // TODO 批量有点问题，单个能成功，但在Content-Length: 5600的时候会报错，node报错。疑是转发服务的问题
</script>
