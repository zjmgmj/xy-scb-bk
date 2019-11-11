<template lang="pug">
.content
  button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
  .mt-15
    el-form(ref="dialogForm", :model="form", label-width="90px")
      .row
        .col
          el-form-item(label="代码")
            el-input.full-width(v-model="form.feeitemName", clearable, size="mini")
        .col
          el-form-item(label="名称")
            el-input.full-width(v-model="form.feeitemName", clearable, size="mini")
        .col
          el-form-item(label="简称")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="助记码")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
      .row
        .col
          el-form-item(label="地区")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="联系地址")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="联系人")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="电话")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
      .row
        .col
          el-form-item(label="开户行")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="开票地址")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="传真")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="邮政编码")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
      .row
        .col
          el-form-item(label="账号")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="税号")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="法人代表")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="业务员")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
      .row
        .col
          el-form-item(label="授权方式")
            .row
              .col.mr-5
                el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
                  el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
              el-button(size="mini", type="primary", style='height: 30px; margin-top: 8px') 授权
        .col
          el-form-item(label="分管部门")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="业务关系")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="内部机构")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
      .row
        .col
          el-form-item(label="单位类型")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="信誉额度")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="资信等级")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="客户状态")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
      .row
        .col
          el-form-item(label="单位性质")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="客户来源")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="客户类别")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="上级单位")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
      .row
        .col
          el-form-item(label="所属行业")
            el-select.full-width(v-model="form.feeitemScope", multiple, placeholder="请选择", size="mini")
              el-option(v-for="item in areaList", :key="item", :label="item.label", :value="item")
        .col
          el-form-item(label="是否允许对其他货主显示信息", label-width="200px")
            el-radio(v-model="form.feeitemFavnumcon" label="允许")
            el-radio(v-model="form.feeitemFavnumcon" label="不允许")
        .col
          el-form-item(label="经验范围")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="状态")
            el-radio(v-model="form.feeitemFavnumcon" label="启用")
            el-radio(v-model="form.feeitemFavnumcon" label="不启用")
      .row
        .col
          el-form-item(label="金蝶EAS编码", label-width="100px")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="ESB接口接收方", label-width="120px")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="贸易代码")
            el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
        .col
          el-form-item(label="接口")
            el-radio(v-model="form.feeitemFavnumcon" label="启用")
            el-radio(v-model="form.feeitemFavnumcon" label="不启用")
    .mt-15
      el-tabs(v-model="activeTab" type="card" @tab-click="handleClick")
        el-tab-pane(label="联系人" name="1")
          button-group(:btns="tabGroupInfo_1", @groupBtnClick="tabGroupInfoClick")
          edit-table(:tableValue="tableValue"
            :total="totalCount",
            :currentPage="currentPage",
            :pageSize="pageSize",
            :loading="loading")
        el-tab-pane(label="单位账号" name="2")
          button-group(:btns="tabGroupInfo_2", @groupBtnClick="tabGroupInfoClick")
          edit-table(:tableValue="tableValue"
            :total="totalCount",
            :currentPage="currentPage",
            :pageSize="pageSize",
            :loading="loading")
        el-tab-pane(label="项目" name="3")
          button-group(:btns="tabGroupInfo_3", @groupBtnClick="tabGroupInfoClick")
          edit-table(:tableValue="tableValue"
            :total="totalCount",
            :currentPage="currentPage",
            :pageSize="pageSize",
            :loading="loading")
</template>
<script>
import editTable from '~/components/editTable'
import buttonGroup from '~/components/buttonGroup.vue'
export default {
  components: {
    buttonGroup,
    editTable
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      activeTab: '1',
      dialogShow: true,
      dialogTitle: '往来单位登记',
      areaList: [],
      // form: ,
      buttonGroupInfo: [
        {lbl: '取消', type: 'cancel', icon: 'el-icon-plus'},
        {lbl: '保存', type: 'add', icon: 'el-icon-plus'},
        {lbl: '附件', type: 'annex', icon: 'el-icon-plus'}        
      ],
      tableValue: {
        // pageShow: true,
        showRowIndex: true,
        tableHeight: '295px',
        tableHead: [
          {lbl: '姓名', prop: 'companyLinkmanName', width: '120px'},
          {lbl: '性别', prop: 'companyLinkmanSex', width: '120px', type: 'select', list: []},
          {lbl: '手机', prop: 'companyLinkmanMobile'},
          {lbl: '邮箱', prop: 'companyLinkmanEmail'},          
          {lbl: '电话', prop: 'companyLinkmanPhone', width: '150px'},
          {lbl: '住址', prop: 'companyLinkmanAddr'},
          {lbl: '职位', prop: 'companyLinkmanJob'},
          {lbl: 'QQ', prop: 'companyLinkmanQq'},
          {lbl: 'MSN', prop: 'companyLinkmanMsn'},
          {lbl: '传真号', prop: 'companyLinkmanFax'},          
          {lbl: '生日', prop: 'companyLinkmanBirthdayStr', width: '200px', type: 'ElDatePicker'},
          {lbl: '备注', prop: 'companyLinkmanRemark'}
        ],
        tableData: []
      },
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      tabGroupInfo_1: [
        {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
        {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}        
      ],
      tabGroupInfo_2: [
        {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
        {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}        
      ],
      tabGroupInfo_3: [
        {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
        {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}        
      ]
    }
  },
  beforeMounted () {
    this.tableValue.tableData.push()
  },
  methods: {
    buttonGroupClick (flag) {
      switch (flag) {
        case 'cancel':
          this.$emit('cancel')
          break
        case 'add':
          this.save()
          break
        case 'annex':
          break
        default:
          break
      }
    },
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {          
          this.$emit('save', this.form)
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    handleClick () {
      console.log('1111111111111')
    },
    tabGroupInfoClick (flag) {
      switch(flag) {
        case 'add':
          const addObj = {companyLinkmanName: '', companyLinkmanSex: '', companyLinkmanMobile: '', companyLinkmanEmail: '', companyLinkmanPhone: '', companyLinkmanAddr: '', companyLinkmanJob: '', companyLinkmanQq: '', companyLinkmanMsn: '', companyLinkmanFax: '', companyLinkmanBirthdayStr: '', companyLinkmanRemark: ''}
          this.tableValue.tableData.push(addObj)
          this.totalCount ++
          break
        case 'refresh':
          console.log('flag:', flag)
          break
        case 'del':
          console.log('flag:', flag)
          break
        default:
          console.error('error')
          break
      }
    }
  }
}
</script>
