require(
    [
        'N/record',
        'N/runtime',
        'SuiteScripts/[SR] Customizations/CostingSheetConversion/Library/hcs_lib_mapping',
        'SuiteScripts/[SR] Customizations/CostingSheetConversion/Library/hcs_lib_mapper',
        'SuiteScripts/[SR] Customizations/CostingSheetConversion/Library/hcs_lib_validator',
        'SuiteScripts/[SR] Customizations/Helper/helper'
    ]
,
(record, runtime, mapping, mapper, validator, helper) => {

    //==============================================================================================================//
    const getInputData = (inputContext) => {
        const intCostingSheet = 45
        const intSubsidiary = 3
        
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
    
            if(intSubsidiary == mapping.GLOBAL.subsidiary.HIZONS_RESTAURANT_CATERING_SERVICES) {
                arrIncludedSublists.push('recmachcustrecord_bundled_item_cost_sheet')
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
            }
            
            const objCostingSheet = helper.getCostingSheet({
                id: intCostingSheet,
                sublists: arrIncludedSublists
            })
    
            objCostingSheet.body['custom_current_user'] = runtime.getCurrentUser().id
            objCostingSheet.body['custom_form'] = intCustomForm
    
            let arrConsolidatedData = []
    
            for(let sourceSublist in objCostingSheet.sublists) {
                
                let arrSublistData = objCostingSheet.sublists[sourceSublist]
                for(let objSublistData of arrSublistData) {
    
                    if(objSublistData.custom_is_perishable == 'F') {
                        continue
                    }
    
                    let objNewValue = {}
                    objNewValue['body'] = {...objCostingSheet}.body
                    objNewValue['custom_source_sublist'] = sourceSublist
                    objNewValue['custom_sublist_item'] = {...objSublistData}
                    
                    arrConsolidatedData.push(objNewValue)
                }
            }
            
            let stopper = null
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

            log.debug('output', output.record.toJSON())

            // const recPurchaseRequstId = output.record.save()
            // log.audit('recPurchaseRequstId', recPurchaseRequstId)
            
            log.debug('Remaining usage', runtime.getCurrentScript().getRemainingUsage())
        }catch(objError) {
            log.error('reduce stage error', objError)
        }
       
    }
    

    simulateMR()
    function simulateMR() {
        //MR execution simulator
        //Get input
        let arrGetInputData = getInputData()


        //Process mapping
        let arrMapData = []
        let index = 0
        for(let i in arrGetInputData) {
            map({
                value: JSON.stringify(arrGetInputData[i]),
                write: (option) => {
                    const key = typeof option['key'] == 'object'? JSON.stringify(option['key']): option['key']
                    const value = option['value']

                if(arrMapData.length > 0) {
                        let arrExisting = arrMapData.filter((objMapData) => typeof objMapData['key'] == 'object'? JSON.stringify(objMapData['key']): objMapData['key'] == key? true: false)

                        if(arrExisting.length > 0) {
                            arrMapData[arrExisting[0].index].values.push(JSON.stringify(value))
                        }else {
                            arrMapData.push({
                                key: key,
                                values: [JSON.stringify(value)],
                                index: index
                            })
                            index++
                        }
                }else{
                        arrMapData.push({
                            key: key,
                            values: [JSON.stringify(value)],
                            index: index
                        })
                        index++
                }
                }
            })
            const mapStopper = null
        }

        //Process Reduce
        for(let x=0; x<arrMapData.length; x++) {
            reduce(arrMapData[x])
            const reduceStopper = null
        }

    }
})