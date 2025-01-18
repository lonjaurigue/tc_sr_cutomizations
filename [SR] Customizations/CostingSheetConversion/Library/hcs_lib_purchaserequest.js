define(
    [
        'N/record',
        'N/task',
        'N/redirect',
        './hcs_lib_validator',
        '../../Helper/helper',
    ]
,
(record, task, redirect, validator, helper) => {

    const create = (options) => {
        const intCostingSheet = options.costingSheet
        
        const objCostingSheet = helper.getCostingSheet({
            id: intCostingSheet
        })

        log.audit('objCostingSheet', objCostingSheet.body)

        validator.checkPropertiesWithEmptyValue({
            throwError: true,
            data: objCostingSheet.body,
            mapping: {
                custrecord_event_date: 'Event Date',
                custrecord_cs_subsidiary: 'Subsidiary',
                // custrecord_gl_dept: 'Department',
                custrecord_tc_costingsheet_location: 'Location',
                custrecord_charge_to: 'Charge To'
            }
        })

        var objMRTask = task.create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: 'customscript_hcs_costingsheettopr_mr',
            params: {
                custscript_object_parameter: JSON.stringify({
                    costingSheet: intCostingSheet,
                    subsidiary: objCostingSheet.body.custrecord_cs_subsidiary
                })
            }
        })

        record.submitFields({
            type: 'customrecord_costing_sheet',
            id: intCostingSheet,
            values: {
                custrecord_cs_transgenlog: 'pending'
            } 
        })

        const strMRTaskId = objMRTask.submit()
        log.audit('strMRTaskId', strMRTaskId)
        
        redirect.toRecord({
            type: 'customrecord_costing_sheet',
            id: intCostingSheet
        })
    }

    return {
        create
    }

})