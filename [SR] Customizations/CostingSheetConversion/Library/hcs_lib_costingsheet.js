 
 define(
    [
        'N/search',
        'N/record',
        'N/runtime',
        'N/redirect',
        './hcs_lib_mapping',
        './hcs_lib_mapper',
        './hcs_lib_validator',
        '../../Helper/helper'
    ]
,
(search, record, runtime, redirect, mapping, mapper, validator, helper) => {

    const createFromOpportunity = (options) => {

        const intOpportuntiyId = options.opportunity

        const objOpportunity = helper.getOpportunity({
            id: intOpportuntiyId,
            sublists: ['recmachcustrecord_foodmenu_opportunity']
        })

        //Note: TIMEOFDAY is unsupported in SuiteQL at this time
        const ObjLookUpOpportuntiy = search.lookupFields({
            type: 'opportunity',
            id: intOpportuntiyId,
            columns: ['custbody_event_start_time', 'custbody_event_end_time']
        })
        objOpportunity.body.custom_event_start_time = ObjLookUpOpportuntiy.custbody_event_start_time || null
        objOpportunity.body.custom_event_end_time = ObjLookUpOpportuntiy.custbody_event_end_time || null

        objOpportunity.sublists.option_1 = objOpportunity.sublists.recmachcustrecord_foodmenu_opportunity.filter(obj => obj.custrecord_option_text == 'Option 1')
        objOpportunity.sublists.option_2 = objOpportunity.sublists.recmachcustrecord_foodmenu_opportunity.filter(obj => obj.custrecord_option_text == 'Option 2')
        objOpportunity.sublists.option_3 = objOpportunity.sublists.recmachcustrecord_foodmenu_opportunity.filter(obj => obj.custrecord_option_text == 'Option 3')
        objOpportunity.sublists.food_tasting = objOpportunity.sublists.recmachcustrecord_foodmenu_opportunity.filter(obj => obj.custrecord_option_text == 'Food Tasting')
        log.audit('objOpportunity', objOpportunity)


        for(let key in objOpportunity.sublists) {

            if(key == 'option_1') {
                objOpportunity.body['custom_event_name'] = `${objOpportunity.body.title} - Option 1`
                log.audit('objOpportunity.body.custom_event_name1', objOpportunity.body.custom_event_name)
            }
            else if(key == 'option_2') {
                objOpportunity.body['custom_event_name'] = `${objOpportunity.body.title} - Option 2`
                log.audit('objOpportunity.body.custom_event_name2', objOpportunity.body.custom_event_name)
            }
            else if(key == 'option_3') {
                objOpportunity.body['custom_event_name'] = `${objOpportunity.body.title} - Option 3`
                log.audit('objOpportunity.body.custom_event_name3', objOpportunity.body.custom_event_name)
            }
            else if(key == 'food_tasting') {
                objOpportunity.body['custom_event_name'] = `${objOpportunity.body.title} - Food Tasting`
                log.audit('objOpportunity.body.custom_event_name4', objOpportunity.body.custom_event_name)
            }else {
                continue;
            }

            let recCostingSheet = record.create({
                type: 'customrecord_costing_sheet',
                isDynamic: true
            })
    
            const output =  mapper.jsonMapToRecord({
                data: objOpportunity,
                mapping: mapping.COSTING_SHEET_FROM_OPPORTUNTIY,
                record: recCostingSheet,

            })

            let stopper = null
            
            log.audit('costing sheet id', output.record.save())
        }

        redirect.toRecord({
            type: record.Type.OPPORTUNITY,
            id: intOpportuntiyId
        });
        
        log.debug('Remaining usage', runtime.getCurrentScript().getRemainingUsage())
    }

    return {
        createFromOpportunity
    }

})
        