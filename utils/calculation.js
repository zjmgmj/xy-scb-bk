
import XEUtils from 'xe-utils'
import state from '@/store/state.js'
/**	 
 * @param {Number} value
 * @param {Number} len
 * @returns
 */
export function _toFixed(value, len) {
	let num = 0
	if (value > 0) {
		num = value + 0.00000001 // 为了处理类似9.665*2275=21987.874999999996之类的为题
	} else if (value < 0) {
		num = value - 0.00000001 // 为了处理类似-9.665*2275=21987.874999999996之类的为题
	}
	return parseFloat(num.toFixed(len)) // 为了处理类似9.665*2275=21987.874999999996之类的为题
}
export default {

  /**
	 * @param {Object} [fields = tableValue.priceMoneyComputerColumn] fields
	 * @returns
	 */
	getPriceMoneyComputercolumn: (fields) => {
		// 获取默认金额计算字段
		const priceMoneyComputerColumnDefaule = {
			computertype: 'goods', goodsNum: 'goodsNum', goodsWeight: 'goodsWeight', goodsPiecenum: 'goodsPiecenum', goodsSingernum: 'goodsSingernum', goodsAssistweight: 'goodsAssistweight',
			partsnamePriceun: 'partsnamePriceun', goodsInprice: 'goodsInprice', goodsInmoney: 'goodsInmoney', goodsExprice: 'goodsExprice', goodsExmoney: 'goodsExmoney', goodsTaxrate: 'goodsTaxrate', goodsTaxmoney: 'goodsTaxmoney'
		};
		if (fields === undefined || fields === '') {
			fields = priceMoneyComputerColumnDefaule
		} else {
			if (fields.computertype === undefined || fields.computertype === '') { fields.computertype = priceMoneyComputerColumnDefaule.computertype; }// 计算类型：goods表示物资，fee表示费用
			if (fields.partsnamePriceun === undefined || fields.partsnamePriceun === '') { fields.partsnamePriceun = priceMoneyComputerColumnDefaule.partsnamePriceun; }// 计价方式
			if (fields.goodsInprice === undefined || fields.goodsInprice === '') { fields.goodsInprice = priceMoneyComputerColumnDefaule.goodsInprice; }// 含税单价
			if (fields.goodsInmoney === undefined || fields.goodsInmoney === '') { fields.goodsInmoney = priceMoneyComputerColumnDefaule.goodsInmoney; }// 含税金额
			if (fields.goodsExprice === undefined || fields.goodsExprice === '') { fields.goodsExprice = priceMoneyComputerColumnDefaule.goodsExprice; }// 无税单价
			if (fields.goodsExmoney === undefined || fields.goodsExmoney === '') { fields.goodsExmoney = priceMoneyComputerColumnDefaule.goodsExmoney; }// 无税金额
			if (fields.goodsTaxrate === undefined || fields.goodsTaxrate === '') { fields.goodsTaxrate = priceMoneyComputerColumnDefaule.goodsTaxrate; }// 税率
			if (fields.goodsTaxmoney === undefined || fields.goodsTaxmoney === '') { fields.goodsTaxmoney = priceMoneyComputerColumnDefaule.goodsTaxmoney; }// 税额
			if (fields.goodsNum === undefined || fields.goodsNum === '') { fields.goodsNum = priceMoneyComputerColumnDefaule.goodsNum; }// 数量
			if (fields.goodsWeight === undefined || fields.goodsWeight === '') { fields.goodsWeight = priceMoneyComputerColumnDefaule.goodsWeight; }// 重量
			if (fields.goodsPiecenum === undefined || fields.goodsPiecenum === '') { fields.goodsPiecenum = priceMoneyComputerColumnDefaule.goodsPiecenum; }// 件数
			if (fields.goodsSingernum === undefined || fields.goodsSingernum === '') { fields.goodsSingernum = priceMoneyComputerColumnDefaule.goodsSingernum; }// 支数
			if (fields.goodsAssistweight === undefined || fields.goodsAssistweight === '') { fields.goodsAssistweight = priceMoneyComputerColumnDefaule.goodsAssistweight; }// 磅重
		}
		return fields
	},

	/**
	 * @param {Object} [fields = tableValue.adjustColumn] fields
	 * @returns
	 */
	getAdjustColumn: (fields) => {
		// 获取默认理算相关字段
		const adjustColumnDefault = {
			partsnameName: 'partsnameName', goodsMaterial: 'goodsMaterial', goodsSpec: 'goodsSpec', productareaName: 'productareaName', goodsMetering: 'goodsMetering',
			goodsProperty1: 'goodsProperty1', goodsProperty2: 'goodsProperty2', goodsProperty3: 'goodsProperty3', goodsProperty4: 'goodsProperty4', goodsProperty5: 'goodsProperty5',
			goodsNumproperty1: 'goodsNumproperty1', goodsNumproperty2: 'goodsNumproperty2', goodsNum: 'goodsNum', goodsWeight: 'goodsWeight', goodsPiecenum: 'goodsPiecenum', goodsSingernum: 'goodsSingernum', goodsAssistweight: 'goodsAssistweight', goodsPartsbranch: 'goodsPartsbranch', goodsWetpercentage: 'goodsWetpercentage'
		};
		if (!fields) {
			fields = adjustColumnDefault
		} else {
			if (!fields.partsnameName) { fields.partsnameName = adjustColumnDefault.partsnameName; }// 品名
			if (!fields.goodsMaterial) { fields.goodsMaterial = adjustColumnDefault.goodsMaterial; }// 材质
			if (!fields.goodsSpec) { fields.goodsSpec = adjustColumnDefault.goodsSpec; }// 规格
			if (!fields.productareaName) { fields.productareaName = adjustColumnDefault.productareaName; }// 产地
			if (!fields.goodsNum) { fields.goodsNum = adjustColumnDefault.goodsNum; }// 数量
			if (!fields.goodsWeight) { fields.goodsWeight = adjustColumnDefault.goodsWeight; }// 重量
			if (!fields.goodsMetering) { fields.goodsMetering = adjustColumnDefault.goodsMetering; }// 计量方式
			if (!fields.goodsProperty1) { fields.goodsProperty1 = adjustColumnDefault.goodsProperty1; }
			if (!fields.goodsProperty2) { fields.goodsProperty2 = adjustColumnDefault.goodsProperty2; }
			if (!fields.goodsProperty3) { fields.goodsProperty3 = adjustColumnDefault.goodsProperty3; }
			if (!fields.goodsProperty4) { fields.goodsProperty4 = adjustColumnDefault.goodsProperty4; }
			if (!fields.goodsProperty5) { fields.goodsProperty5 = adjustColumnDefault.goodsProperty5; }
			if (!fields.goodsNumproperty1) { fields.goodsNumproperty1 = adjustColumnDefault.goodsNumproperty1; }
			if (!fields.goodsNumproperty2) { fields.goodsNumproperty2 = adjustColumnDefault.goodsNumproperty2; }
			if (!fields.goodsPiecenum) { fields.goodsPiecenum = adjustColumnDefault.goodsPiecenum; }// 件数
			if (!fields.goodsSingernum) { fields.goodsSingernum = adjustColumnDefault.goodsSingernum; }// 支数
			if (!fields.goodsAssistweight) { fields.goodsAssistweight = adjustColumnDefault.goodsAssistweight; }// 磅重
			if (!fields.goodsPartsbranch) { fields.goodsPartsbranch = adjustColumnDefault.goodsPartsbranch; }// 件支数
			if (!fields.goodsWetpercentage) { fields.goodsWetpercentage = adjustColumnDefault.goodsWetpercentage; }// 水分
		}
		return fields
	},

	
	/**
	 * @param {string} [type = 'grid' || type = 'from'] type
	 * @param {Object} [row = row] row
	 * @param {string} [modifycoumn = tableValue.tableHead[0].prop] modifycoumn
	 * @param {Object} [columnlist = getPriceMoneyComputercolumn()] columnlist
	 * @param {*} modcolumn
	 * @param {*} datatype
	 * 含税金额 = 重量 * 含税单价
	 * 无税金额 = 重量 * 无税单价
	 * 税额 = 含税金额 - 无税金额
	 * 无税单价 = 含税单价 / (1 + 税率)
	 * 含税单价 = 含税金额 / 重量
	 */
	pricemoneycomputer: (type, row, modifycoumn, columnlist, modcolumn, datatype) => {
		const column = columnlist
		let data = {}
		let dataold = {}
		if (type === 'grid') {
			if (datatype === 1) {
				dataold = XEUtils.extend(true, row)
				data = XEUtils.extend(true, row)
			}
			else {
				dataold = XEUtils.extend(true, row)
			}
		} else {
			dataold = XEUtils.extend(true, row)
		}
		const goodsWeight = column.goodsWeight
		data[column.goodsNum] = _toFixed(XEUtils.toNumber(dataold[column.goodsNum]), 0)
		data[column.goodsWeight] = _toFixed(XEUtils.toNumber(dataold[column.goodsWeight]), state.g_decimalP.weight_decimalP)
		data[column.goodsAssistweight] = _toFixed(XEUtils.toNumber(dataold[column.goodsWeight]), state.g_decimalP.weight_decimalP)
		data[column.goodsInprice] = _toFixed(XEUtils.toNumber(dataold[column.goodsInprice]), state.g_decimalP.money_decimalP)
		data[column.goodsInmoney] = _toFixed(XEUtils.toNumber(dataold[column.goodsInmoney]), state.g_decimalP.money_decimalP)
		data[column.goodsTaxrate] = XEUtils.toNumber(dataold[column.goodsTaxrate])
		data[column.goodsExprice] = XEUtils.toNumber(dataold[column.goodsExprice])
		data[column.goodsExmoney] = XEUtils.toNumber(dataold[column.goodsExmoney])
		data[column.goodsTaxmoney] = XEUtils.toNumber(dataold[column.goodsTaxmoney])
		data[column.partsnamePriceun] = dataold[column.partsnamePriceun]

		// goodsInmoney, goodsExmoney, goodsTaxmoney
		if (modifycoumn === column.goodsNum || modifycoumn === column.goodsWeight || modifycoumn === column.goodsAssistweight) {
			data[column.goodsInmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsInprice]), state.g_decimalP.money_decimalP);
			data[column.goodsExmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsExprice]), state.g_decimalP.money_decimalP);
			data[column.goodsTaxmoney] = _toFixed((XEUtils.toNumber(data[column.goodsInmoney]) - XEUtils.toNumber(data[column.goodsExmoney])), state.g_decimalP.money_decimalP);
			if (modcolumn !== undefined) {
				modcolumn.push(column.goodsInmoney)
				modcolumn.push(column.goodsExmoney)
				modcolumn.push(column.goodsTaxmoney)
			}
			Object.assign(row, data)
			// if (type === 'grid' && datatype !== 1){
			// 	Object.assign(row, data)
			// }else{
			// 	Object.assign(row, data)				
			// }
		}

		// goodsInmoney, goodsExprice, goodsExmoney, goodsTaxmoney
		if (modifycoumn === column.goodsInprice) {
			data[column.goodsInmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsInprice]), state.g_decimalP.money_decimalP);
			data[column.goodsExprice] = _toFixed(XEUtils.toNumber(data[column.goodsInprice]) / (1 + XEUtils.toNumber(data[column.goodsTaxrate])), state.g_decimalP.exprice_decimalP);
			data[column.goodsExmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsExprice]), state.g_decimalP.money_decimalP);
			data[column.goodsTaxmoney] = _toFixed((XEUtils.toNumber(data[column.goodsInmoney]) - XEUtils.toNumber(data[column.goodsExmoney])), state.g_decimalP.money_decimalP);
			if (modcolumn !== undefined) {
				modcolumn.push(column.goodsInmoney);
				modcolumn.push(column.goodsExmoney);
				modcolumn.push(column.goodsExprice);
				modcolumn.push(column.goodsTaxmoney);
			}
			Object.assign(row, data)
			// if (type === 'grid' && datatype !== 1){
			// 	Object.assign(row, data)
			// }else{
			// 	Object.assign(row, data)
			// }
		}
		// goodsInprice
		if (modifycoumn === column.goodsInmoney) {
			if (data[goodsWeight] && data[goodsWeight] !== 0) {
				data[column.goodsInprice] = _toFixed(data[column.goodsInmoney] / XEUtils.toNumber(data[goodsWeight]), state.g_decimalP.money_decimalP)
				if (modcolumn !== undefined) {
					modcolumn.push(column.goodsInprice)
				}
			}
			data[column.goodsExprice] = _toFixed(XEUtils.toNumber(data[column.goodsInprice]) / (1 + XEUtils.toNumber(data[column.goodsTaxrate])), state.g_decimalP.exprice_decimalP);
			data[column.goodsExmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsExprice]), state.g_decimalP.money_decimalP);
			data[column.goodsTaxmoney] = _toFixed((XEUtils.toNumber(data[column.goodsInmoney]) - XEUtils.toNumber(data[column.goodsExmoney])), state.g_decimalP.money_decimalP);
			if (modcolumn !== undefined) {
				modcolumn.push(column.goodsExprice)
				modcolumn.push(column.goodsExmoney)
				modcolumn.push(column.goodsTaxmoney)
			}
			Object.assign(row, data)
			// if (type==='grid' && datatype!==1){
			// 	row.set(data);
			// }else{
			// 	row.findField(column.goodsInprice).setValue(data[column.goodsInprice]);
			// 	row.findField(column.goodsExprice).setValue(data[column.goodsExprice]);
			// 	row.findField(column.goodsExmoney).setValue(data[column.goodsExmoney]);
			// 	row.findField(column.goodsTaxmoney).setValue(data[column.goodsTaxmoney]);					
			// }
		}
		if (modifycoumn === column.goodsTaxrate) {
			data[column.goodsExprice] = _toFixed(XEUtils.toNumber(data[column.goodsInprice]) / (1 + XEUtils.toNumber(data[column.goodsTaxrate])), state.g_decimalP.exprice_decimalP)
			data[column.goodsExmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsExprice]), state.g_decimalP.money_decimalP)
			data[column.goodsTaxmoney] = _toFixed((XEUtils.toNumber(data[column.goodsInmoney]) - XEUtils.toNumber(data[column.goodsExmoney])), state.g_decimalP.money_decimalP)
			if (modcolumn !== undefined) {
				modcolumn.push(column.goodsExprice)
				modcolumn.push(column.goodsExmoney)
				modcolumn.push(column.goodsTaxmoney)
			}
			Object.assign(row, data)
			// if (type=='grid' && datatype!=1){
			// 	row.set(data);
			// }else{
			// 	row.findField(column.goodsExprice).setValue(data[column.goodsExprice]);
			// 	row.findField(column.goodsExmoney).setValue(data[column.goodsExmoney]);
			// 	row.findField(column.goodsTaxmoney).setValue(data[column.goodsTaxmoney]);					
			// }
		}
		if (modifycoumn === column.goodsExprice) {
			data[column.goodsInprice] = _toFixed(XEUtils.toNumber(data[column.goodsExprice]) * (1 + XEUtils.toNumber(data[column.goodsTaxrate])), state.g_decimalP.money_decimalP);
			data[column.goodsInmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsInprice]), state.g_decimalP.money_decimalP);
			data[column.goodsExmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsExprice]), state.g_decimalP.money_decimalP);
			data[column.goodsTaxmoney] = _toFixed((XEUtils.toNumber(data[column.goodsInmoney]) - XEUtils.toNumber(data[column.goodsExmoney])), state.g_decimalP.money_decimalP);
			if (modcolumn !== undefined) {
				modcolumn.push(column.goodsInprice)
				modcolumn.push(column.goodsInmoney)
				modcolumn.push(column.goodsExmoney)
				modcolumn.push(column.goodsTaxmoney)
			}
			Object.assign(row, data)
			// if (type === 'grid' && datatype!==1){
			// 	row.set(data);
			// }else{
			// 	row.findField(column.goodsInprice).setValue(data[column.goodsInprice]);
			// 	row.findField(column.goodsInmoney).setValue(data[column.goodsInmoney]);
			// 	row.findField(column.goodsExmoney).setValue(data[column.goodsExmoney]);					
			// 	row.findField(column.goodsTaxmoney).setValue(data[column.goodsTaxmoney]);					
			// }
		}
		if (modifycoumn === column.goodsExmoney) {
			if (data[goodsWeight] && data[goodsWeight] !== 0) {
				data[column.goodsExprice] = _toFixed(data[column.goodsExmoney] / XEUtils.toNumber(data[goodsWeight]), state.g_decimalP.exprice_decimalP);
				if (modcolumn !== undefined) {
					modcolumn.push(column.goodsExprice)
				}
			}
			data[column.goodsInprice] = _toFixed(XEUtils.toNumber(data[column.goodsExprice]) * (1 + XEUtils.toNumber(data[column.goodsTaxrate])), state.g_decimalP.money_decimalP);
			data[column.goodsInmoney] = _toFixed(XEUtils.toNumber(data[goodsWeight]) * XEUtils.toNumber(data[column.goodsInprice]), state.g_decimalP.money_decimalP);
			data[column.goodsTaxmoney] = _toFixed((XEUtils.toNumber(data[column.goodsInmoney]) - XEUtils.toNumber(data[column.goodsExmoney])), state.g_decimalP.money_decimalP);
			if (modcolumn !== undefined) {
				modcolumn.push(column.goodsInprice)
				modcolumn.push(column.goodsInmoney)
				modcolumn.push(column.goodsTaxmoney)
			}
			Object.assign(row, data)
			// if (type=='grid' && datatype!=1){
			// 	row.set(data);
			// }else{
			// 	row.findField(column.goodsExprice).setValue(data[column.goodsExprice]);					
			// 	row.findField(column.goodsInprice).setValue(data[column.goodsInprice]);
			// 	row.findField(column.goodsInmoney).setValue(data[column.goodsInmoney]);
			// 	row.findField(column.goodsTaxmoney).setValue(data[column.goodsTaxmoney]);					
			// }
		}
	},


	setStoreFeeprice: (editForm, detailGrid, feeList, feeTable, feeConfig, weight) => {
		let _allmoney = 0
		const otherParams = feeConfig.otherParams
		// const _feeGrid = feeTable.sdpFeeSave()
		// debugger
		// _feeGrid.getStore().clearFilter()
		feeList.map((item) => {
			if (item.feeIncost === 0) {
				let _m = 1 * XEUtils.toNumber(item.goodsInmoney)
				if (item.feeDirection === 1) {
					_m = -1 * XEUtils.toNumber(item.goodsInmoney)
				}
				_allmoney += _m;
			}
		});
		editForm[otherParams.mainBackMoney] = _allmoney
		// (注意:修改这段代码时需要同步修改sdp.source.fee.view.FeeGrid 的_setFeeprice相关代码)
		// state.g_decimalP
		const priceDecimalP = state.g_decimalP.price_decimalP
		const moneyDecimalP = state.g_decimalP.money_decimalP
		// const detailStore = detailGrid
		if (!feeTable.sdpFeeFlag) {// 主表
			const avgFee = _toFixed(XEUtils.toNumber(parseFloat(_allmoney) / parseFloat(weight)), priceDecimalP)
			if (detailGrid.length === 1) {
				const re = detailGrid[0]
				if (re) {
					if (re[otherParams.detailBackInprice] !== avgFee) {
						re[otherParams.detailBackInprice] = avgFee
						re[otherParams.detailBackMoney] = _toFixed(_allmoney, moneyDecimalP)
					}
				}
			} else {
				let avgSum = 0
				// let i = 0
				let newObj = {}
				detailGrid.map((r, index) => {
					// i++
					newObj = {}
					if (r[otherParams.detailBackInprice] !== avgFee) {
						newObj[otherParams.detailBackInprice] = avgFee;
					}
					if (detailGrid.length === index) {
						if (r[otherParams.detailBackMoney] !== parseFloat(_allmoney - avgSum).toFixed(moneyDecimalP)) {
							newObj[otherParams.detailBackMoney] = parseFloat(_allmoney - avgSum).toFixed(moneyDecimalP)
						}
					} else {
						const avgMoney = parseFloat(parseFloat(avgFee * parseFloat(r[otherParams.feeBweight])).toFixed(moneyDecimalP))
						avgSum += avgMoney
						if (r[otherParams.detailBackMoney] !== parseFloat(avgMoney)) {
							newObj[otherParams.detailBackMoney] = parseFloat(avgMoney);
						}
					}
					// r.set(newObj);
					Object.assign(r, newObj)
				});
			}
		} else {// 按明细的时候防止修改业务量，费用单价需要重新算
			detailGrid.map((r, index) => {
				const _price = XEUtils.toNumber(parseFloat(r[otherParams.detailBackMoney]) / parseFloat(r[otherParams.feeBweight])).toFixed(priceDecimalP)
				if (r[otherParams.detailBackInprice] !== _price) {
					// r.set(otherParams.detailBackInprice, _price);
					r[otherParams.detailBackInprice] = _price
				}
			});
		}
	}
}
