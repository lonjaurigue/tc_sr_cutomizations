 
 require(
    [
        'N/record',
        'N/redirect',
        'SuiteScripts/[SR] Customizations/CostingSheetConversion/Library/hcs_lib_mapping',
        'SuiteScripts/[SR] Customizations/CostingSheetConversion/Library/hcs_lib_mapper',
        'SuiteScripts/[SR] Customizations/CostingSheetConversion/Library/hcs_lib_validator',
        'SuiteScripts/[SR] Customizations/Helper/helper'
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

    const preFill = async(options) => {

        const objRequest = options.request
        const recRecord = options.record
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

            if(objCostingSheet.sublists.hasOwnProperty('recmachcustrecord_fcs_c')) {
                let objSublist = objCostingSheet.sublists.recmachcustrecord_fcs_c
                objCostingSheet.sublists.recmachcustrecord_fcs_c = objSublist.filter(obj => obj.is_perishable == 'F' && obj.is_common == 'F')
            }

            if(objCostingSheet.hasOwnProperty('sublists')) {

                for(let sublist in objCostingSheet.sublists) {
                    let arrNewSublistValues = []

                    const arrSublistValues = objCostingSheet.sublists[sublist]
                    
                    for(let objSublistValue of arrSublistValues) {

                        if(objSublistValue.is_perishable == 'F' && objSublistValue.is_common == 'F') {
                            arrNewSublistValues.push(objSublistValue)
                        }
                    }
                    objCostingSheet.sublists[sublist] = arrNewSublistValues
                }
            }

            log.audit('IA modified costingSheet data', objCostingSheet)
            log.audit('IA mapping', objMapping)

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

    preFill({
        record: record.create({
            type: 'inventoryadjustment',
            isDynamic: true
        }),
        request: {
            parameters: {
                from: 'costingsheet',
                costingSheet: 129
            }
        }
    })

    return {
        redirectToRecord, 
        preFill
    }
})