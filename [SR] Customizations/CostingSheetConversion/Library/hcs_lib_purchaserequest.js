define(
    [
        'N/record',
        'N/task',
        'N/redirect',
        'N/query',
        './hcs_lib_validator',
        '../../Helper/helper',
    ]
,
(record, task, redirect, query, validator, helper) => {

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

    const prorateUnitCost = (options) => {
        var ingredientSublistCount = options.data.sublists.recmachcustrecord_fcs_c.length;
        log.debug('prorateUnitCost | ingredientSublistCount', ingredientSublistCount);

        var unitCost;
        var uom;
        var uomPurchase;
        var fromUom;
        var toUom;
        var convertedUnitCost;

        for (var i = 0; i < ingredientSublistCount; i++) {
            unitCost = options.data.sublists.recmachcustrecord_fcs_c[i].custom_unit_cost;
            uom = options.data.sublists.recmachcustrecord_fcs_c[i].custrecord_uom_c;
            uomPurchase = options.data.sublists.recmachcustrecord_fcs_c[i].custrecord_uom_c_purchase;
            log.debug('prorateUnitCost | uom', uom);
            log.debug('prorateUnitCost | uomPurchase', uomPurchase);

            fromUom = getUnitsTypeUom(uom);
		    toUom = getUnitsTypeUom(uomPurchase);

            convertedUnitCost = unitCost * parseFloat(toUom.conversionrate) / parseFloat(fromUom.conversionrate);
            log.debug('prorateUnitCost | UNIT CONVERSION', 'unitCost: '+unitCost+' | convertedUnitCost: '+convertedUnitCost);

            options.data.sublists.recmachcustrecord_fcs_c[i].custom_unit_cost = convertedUnitCost;
        }

        return options.data;
    }

    function getUnitsTypeUom(id){
		var out;

		var statement = `
			SELECT 
			 	internalid, conversionrate
			from 
			 	UnitsTypeUom 
			where 
			 	internalid = '${id}'
		`;

		log.debug('getUnitsTypeUom | statement', statement);

		var results = query.runSuiteQL({
		        query: statement,
		        params: []
		    })
		    .asMappedResults();

		if(results && results.length > 0){
			out = results[0];
		}

		return out;

	}

    return {
        create,
        prorateUnitCost
    }

})