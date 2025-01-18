/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(
    [
        'N/error',
        'N/record',
        'N/runtime',
        '../Library/hcs_lib_mapping',
        '../Library/hcs_lib_mapper',
        '../../Helper/helper'
    ],
(error, record, runtime, mapping, mapper, helper) => {

    const getInputData = (inputContext) => {

        const objParam = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_object_parameter'}))
        const intCostingSheet = objParam.costingSheet
        const intSubsidiary = objParam.subsidiary

        log.audit('objParam', objParam)
        
        try {

            let intCustomForm = mapping.GLOBAL.form.FORM_STANDARD_REQUISITION

            if(!intSubsidiary) {
                throw error.create({
                    name: 'HCS_ERROR_CREATING_PURCHASE_REQUEST',
                    message: `Subsidiary must not be blank`
                })
            }
    
            let arrIncludedSublists = [
                'recmachcustrecord_fcs_c',
                'recmachcustrecord_flower_recipe_ing_costs_sheet'
            ]

            let arrConsolidatedData = []
    
            if(intSubsidiary == mapping.GLOBAL.subsidiary.HIZONS_RESTAURANT_CATERING_SERVICES) {
                arrIncludedSublists.push('recmachcustrecord_bundled_item_cost_sheet')

                let objCostingSheet = helper.getCostingSheet({
                    id: intCostingSheet,
                    sublists: arrIncludedSublists
                })
                objCostingSheet.body['custom_current_user'] = runtime.getCurrentUser().id
                objCostingSheet.body['custom_form'] = intCustomForm 

                for(let sourceSublist in objCostingSheet.sublists) {
                
                    let arrSublistData = objCostingSheet.sublists[sourceSublist]
                    log.debug('arrSublistData', arrSublistData)
                   
                    for(let objSublistData of arrSublistData) {
    
                        if(objSublistData.is_buy_at_par == 'F') {
                            let objNewValue = {}
                            objNewValue['body'] = {...objCostingSheet}.body
                            objNewValue['custom_source_sublist'] = sourceSublist
                            objNewValue['custom_sublist_item'] = {...objSublistData}
                            
                            arrConsolidatedData.push(objNewValue)
                        }
        
                        let stopper = null
                    }
                }
                let stopper = null
            }
            else if
            (
                intSubsidiary == mapping.GLOBAL.subsidiary.F_AND_B_SOLUTIONS ||
                intSubsidiary == mapping.GLOBAL.subsidiary.GOLDEN_HEART_SOCIAL_ENTERPRICES_INC ||
                intSubsidiary == mapping.GLOBAL.subsidiary.SEVEN_GOLDENSPOONS_INC
            ) {
                arrIncludedSublists.push('recmachcustrecord_costing_sheet')
                arrIncludedSublists.push('recmachcustrecord_fcs_amenities')
                arrIncludedSublists.push('recmachcustrecord_fcs_addon')
                intCustomForm = mapping.GLOBAL.form.FB_REQUISITION

                let objCostingSheet = helper.getCostingSheet({
                    id: intCostingSheet,
                    sublists: arrIncludedSublists
                })
                objCostingSheet.body['custom_current_user'] = runtime.getCurrentUser().id
                objCostingSheet.body['custom_form'] = intCustomForm 

                for(let sourceSublist in objCostingSheet.sublists) { 
                    log.debug('-- sourceSublist', sourceSublist);
                    let arrSublistData = objCostingSheet.sublists[sourceSublist]
                    log.debug('-- arrSublistData.length', arrSublistData.length);
                    for(let objSublistData of arrSublistData) {
                        log.debug('---- objSublistData', JSON.stringify(objSublistData));
                        if(sourceSublist != 'recmachcustrecord_costing_sheet' && sourceSublist != 'recmachcustrecord_fcs_amenities') {
                            if(objSublistData.is_perishable == 'F') continue
                            if(objSublistData.is_common == 'T') continue
                        }                    
        
                        let objNewValue = {}
                        objNewValue['body'] = {...objCostingSheet}.body
                        objNewValue['custom_source_sublist'] = sourceSublist
                        objNewValue['custom_sublist_item'] = {...objSublistData}
                        
                        arrConsolidatedData.push(objNewValue)
                    }   
                }
            }
            
            let stopper = null
            log.debug('arrConsolidatedData', arrConsolidatedData);

            if(arrConsolidatedData.length == 0){
                record.submitFields({
                    type: 'customrecord_costing_sheet',
                    id: intCostingSheet,
                    values: {
                        'custrecord_tc_no_item_for_pr_creation': true
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            }else{
                record.submitFields({
                    type: 'customrecord_costing_sheet',
                    id: intCostingSheet,
                    values: {
                        'custrecord_tc_no_item_for_pr_creation': false
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            }
          
            return arrConsolidatedData

        }catch(objError) {
            log.error('getInput stage error catched', objError)
        }
        
    }

    const map = (mapContext) => {
        const objData = JSON.parse(mapContext.value)
        let objBody = objData.body
        objBody['custom_source_sublist'] = objData.custom_source_sublist

        mapContext.write({
            key: JSON.stringify(objBody),
            value: objData.custom_sublist_item
        })
    }

    const reduce = (reduceContext) => {

        try{
            const key = JSON.parse(reduceContext.key)
    
            const values = reduceContext.values.map(value => {
                return JSON.parse(value)
            })
            log.audit('key', key)
            log.audit('values', values)

            let objData = {}
            objData['body'] = key
            objData['sublists'] = {
                [key['custom_source_sublist']]: values
            }


            let recPurchaseRequst = record.create({
                type: record.Type.PURCHASE_REQUISITION,
                isDynamic: true
            })

            const output =  mapper.jsonMapToRecord({
                data: objData,
                mapping: mapping.PURCHASE_REQUEST,
                record: recPurchaseRequst,
            })       

            const recPurchaseRequstId = output.record.save()
            log.audit('recPurchaseRequstId', recPurchaseRequstId)
            
        }catch(objError) {
            log.error('Reduce stage error catched', objError)
            throw objError
        }
        
    }

    const summarize = (summaryContext) => {

        const objParam = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_object_parameter'}))
        const intCostingSheet = objParam.costingSheet
        const intSubsidiary = objParam.subsidiary

        let arrMapErrors = []
        summaryContext.mapSummary.errors.iterator().each((key, value) => arrMapErrors.push(JSON.parse(value)))
        
        let arrReduceErrors = []
        summaryContext.reduceSummary.errors.iterator().each((key, value) => arrReduceErrors.push(JSON.parse(value)))

        let arrErrors = [...arrMapErrors, ...arrReduceErrors]
        arrErrors = [...new Set(arrErrors)]

        let strMessage = ''
        for(let obj of arrErrors) {
            strMessage = `${obj.message}\n`
        }

        log.error('arrErrors', arrErrors)

        record.submitFields({
            type: 'customrecord_costing_sheet',
            id: intCostingSheet,
            values: {
                custrecord_cs_transgenlog: strMessage
            } 
        })
    }

    return {getInputData, map, reduce, summarize}

});
