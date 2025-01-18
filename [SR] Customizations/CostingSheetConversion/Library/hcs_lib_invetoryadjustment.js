 
 define(
    [
        'N/record',
        'N/redirect',
        './hcs_lib_mapping',
        './hcs_lib_mapper',
        './hcs_lib_validator',
        '../../Helper/helper'
    ]
,
(record, redirect, mapping, mapper, validator, helper) => {

    const redirectToRecord = (options) => {

        const intCostingSheet = options.costingSheet

        const objCostingSheet = helper.getCostingSheet({
            id: intCostingSheet
        })

        validator.checkPropertiesWithEmptyValue({
            throwError: true,
            data: objCostingSheet.body,
            mapping: {
                custrecord_event_date: 'Event Date',
                custrecord_cs_subsidiary: 'Subsidiary',
                custrecord_gl_dept: 'Department',
                custrecord_tc_costingsheet_location: 'Location',
                custrecord_charge_to: 'Charge To'
            }
        })
        
        redirect.redirect({
            url: '/app/accounting/transactions/invadjst.nl',
            parameters: {
                from:'costingsheet',
                costingSheet: intCostingSheet
            }
        })
    }

    const preFill = (options) => {

        const objRequest = options.request
        const recRecord = options.record
        const form = options.form
        try{

            log.audit('objRequest', objRequest)
            if(!objRequest) return
                
            const strFrom = objRequest.parameters.from
            const intConstingSheet = objRequest.parameters.costingSheet
            log.audit('params', {
                from: strFrom,
                costingSheet: intConstingSheet
            })
           
            const objCostingSheet = helper.getCostingSheet({
                id: intConstingSheet,
                sublists: [
                    'recmachcustrecord_fcs_c',
                    // 'recmachcustrecord_costing_sheet',
                    // 'recmachcustrecord_fcs_amenities'
                ]
            })

            let objMapping = mapping.INVENTORY_ADJUSTMENT_FROM_COSTING_SHEET
            if(
                objCostingSheet.body.custrecord_cs_subsidiary == mapping.GLOBAL.subsidiary.HIZONS_RESTAURANT_CATERING_SERVICES
            ) {
                objCostingSheet.body.adjlocation = mapping.GLOBAL.location.HIZONS_CATERING_STOCK_ROOM
            }

            //data manipulation
            if(objCostingSheet.hasOwnProperty('sublists')) {

                for(let sublist in objCostingSheet.sublists) {
                    let arrNewSublistValues = []

                    const arrSublistValues = objCostingSheet.sublists[sublist]
                    
                    for(let objSublistValue of arrSublistValues) {

                        if(objSublistValue.is_perishable == 'F' && objSublistValue.is_common == 'F') {
                            objSublistValue.custrecord_qty_c = Number(objSublistValue.custrecord_qty_c)
                            objSublistValue.custrecord_qty_c_stock = Number(objSublistValue.custrecord_qty_c_stock)
                            if(objSublistValue.custrecord_qty_c_stock > 0) {
                                objSublistValue.custrecord_qty_c_stock = objSublistValue.custrecord_qty_c_stock * -1
                            } else if(objSublistValue.custrecord_qty_c > 0) {
                                objSublistValue.custrecord_qty_c = objSublistValue.custrecord_qty_c * -1
                            } else {
                                objSublistValue.custrecord_qty_c = objSublistValue.custrecord_qty_c
                            }
                            arrNewSublistValues.push(objSublistValue)
                        }
                    }
                    objCostingSheet.sublists[sublist] = arrNewSublistValues
                }
            }

            log.audit('IA modified costingSheet data', objCostingSheet)
            log.audit('IA mapping', objMapping)

            //add hidden field to store data
            var fldCostingSheetInfo = form.addField({
                id: 'custpage_costingsheet',
                label: 'Costing sheet',
                type: 'textarea',
            })
            fldCostingSheetInfo.updateDisplayType({
                displayType : 'hidden'
            });

            fldCostingSheetInfo.defaultValue = JSON.stringify(objCostingSheet)

            if(strFrom == 'costingsheet' && intConstingSheet) {
                mapper.jsonMapToRecord({
                    data: objCostingSheet,
                    mapping: objMapping,
                    record: recRecord
                })
            }
            
            let stopper = null
           
        }catch(objError) {
            log.error('beforeload IA pre-fill', objError)
        }

    }

    return {
        redirectToRecord, 
        preFill
    }
})