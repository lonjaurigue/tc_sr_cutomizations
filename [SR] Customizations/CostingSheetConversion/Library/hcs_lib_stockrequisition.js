define(
    [
        'N/error',
        'N/record',
        'N/runtime',
        'N/redirect',
        './hcs_lib_mapping',
        './hcs_lib_mapper',
        './hcs_lib_validator',
        '../../Helper/helper'
    ]
,
(error, record, runtime, redirect, mapping, mapper, validator, helper) => {

    const create = (options) => {

        let output = null

        const objCostingSheet = helper.getCostingSheet({
            id: options.costingSheet,
            sublists: [
                'recmachcustrecord_fcs_c', 
                // 'recmachcustrecord_costing_sheet',
                // 'recmachcustrecord_fcs_amenities'
            ]
        })
        objCostingSheet.body.current_user = runtime.getCurrentUser().id

        if(objCostingSheet.sublists.hasOwnProperty('recmachcustrecord_fcs_c')) {
            let objSublist = objCostingSheet.sublists.recmachcustrecord_fcs_c
            objCostingSheet.sublists.recmachcustrecord_fcs_c = objSublist.filter(obj => obj.is_perishable == 'F' && obj.is_common == 'F')
        }
        log.audit('SR modified costingSheet data', objCostingSheet)
        
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

        const bolInterCompany = isInterCompany({
            subsidiary: objCostingSheet.body.custrecord_cs_subsidiary
        })


        switch(bolInterCompany) {
            case true: {
                output =  mapper.jsonMapToRecord({
                    data: objCostingSheet,
                    recType:record.Type.INTER_COMPANY_TRANSFER_ORDER,
                    mapping: mapping.TRANSFER_ORDER_INTERCOMPANY,
                    record: record.create({
                        type: record.Type.INTER_COMPANY_TRANSFER_ORDER,
                        isDynamic: true,
                    })
                })
                break;
            }
            case false: {
                // TODO:
                output =  mapper.jsonMapToRecord({
                    data: objCostingSheet,
                    mapping: mapping.TRANSFER_ORDER,
                    recType: record.Type.TRANSFER_ORDER,
                    record: record.create({
                        type: record.Type.TRANSFER_ORDER,
                        isDynamic: true,
                    })
                })
                break;
            }
            default: {
                throw error.create({
                    name: 'HCS_SUBSIDIARY_NO_SUPPORTED',
                    message: `${objCostingSheet.body.custrecord_cs_subsidiary_text} is not supported for SR conversion.`
                })
            }
        }

        const recStockRequesitionId = output.record.save()
        log.debug('created record id', recStockRequesitionId)

        redirect.toRecord({
            type: bolInterCompany? record.Type.INTER_COMPANY_TRANSFER_ORDER: record.Type.TRANSFER_ORDER,
            id: recStockRequesitionId
        });
        
        log.debug('Remaining usage', runtime.getCurrentScript().getRemainingUsage())
    }

    function isInterCompany(options) {

        let output = null
        
        const interCompantySubs = [
            mapping.GLOBAL.subsidiary.GOLDEN_HEART_SOCIAL_ENTERPRICES_INC,
            mapping.GLOBAL.subsidiary.SEVEN_GOLDENSPOONS_INC
        ]
        if(options.subsidiary ==  mapping.GLOBAL.subsidiary.F_AND_B_SOLUTIONS) {
            output = false
        }
        else if(interCompantySubs.includes(Number(options.subsidiary))) {
            output = true
        }

        return output
    }

    return {
        create
    }

})