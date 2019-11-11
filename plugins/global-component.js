import Vue from 'vue'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

import employeeSelect from '@/components/select/employeeSelect'
import operatorSelect from '@/components/select/operatorSelect'
import deptSelect from '@/components/select/deptSelect'
import orgSelect from '@/components/select/orgSelect'
import roleSelect from '@/components/select/roleSelect'
import companySelect from '@/components/select/companySelect'
import goodsNameSelect from '@/components/select/goodsNameSelect'
import goodsSpecSelect from '@/components/select/goodsSpecSelect'
import goodsMaterialSelect from '@/components/select/goodsMaterialSelect'
import goodsAreaSelect from '@/components/select/goodsAreaSelect'
import goodsWarehouseSelect from '@/components/select/goodsWarehouseSelect'
import billtypeSelect from '@/components/select/billtypeSelect'
import partsnameSelect from '@/components/select/partsnameSelect'
import basicSelect from '@/components/select/basicSelect'
import wareplaceSelect from '@/components/select/wareplaceSelect'
import equsettingSelect from '@/components/select/equsettingSelect'
import generalSelect from '@/components/select/generalSelect'
import pntreePartsnameSelect from '@/components/select/pntreePartsnameSelect'
import companyProjectSelect from '@/components/select/companyProject'



const comp = {
  employeeSelect ,
  operatorSelect,
  deptSelect ,
  orgSelect ,
  roleSelect ,
  companySelect ,
  goodsNameSelect ,
  goodsSpecSelect ,
  goodsMaterialSelect,
  goodsAreaSelect,
  goodsWarehouseSelect,
  billtypeSelect,
  partsnameSelect,
  basicSelect,
  wareplaceSelect,
  equsettingSelect,
  generalSelect,
  pntreePartsnameSelect,
  companyProjectSelect
}

Object.keys(comp).forEach(key=>{
  const name = comp[key].componentName || upperFirst(camelCase(key))
  Vue.component(name, comp[key])
})
