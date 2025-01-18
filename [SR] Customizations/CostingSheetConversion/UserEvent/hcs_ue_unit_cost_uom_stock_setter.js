/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
	'N/query',
	'N/log'
],
(query, log) => {
    
    const beforeSubmit = (scriptContext) => {
        try{
        	setUnitCostOnUomStock(scriptContext);
        }catch(e){
        	log.error('beforeSubmit | e', e);
        }
    }

    function setUnitCostOnUomStock(scriptContext){
    	const newRecord = scriptContext.newRecord;

        const itemIds = getItemIds(newRecord);
        const itemClassDetailsPerItem = getItemClassDetails(itemIds);

        log.error('XXXXX itemClassDetailsPerItem', JSON.stringify(itemClassDetailsPerItem));

		const customIngredientLineCount = newRecord.getLineCount({
        	sublistId: 'recmachcustrecord_fcs_c'
        });
        for(var i = 0; i < customIngredientLineCount; i++){
        	var itemId = newRecord.getSublistValue({
        		sublistId: 'recmachcustrecord_fcs_c',
        		fieldId: 'custrecord_ingdt_c',
	        	line: i
        	});

    		var unitCost = newRecord.getSublistValue({
        		sublistId: 'recmachcustrecord_fcs_c',
        		fieldId: 'custrecord_customunit',
        		line: i
        	});
        	var uom = newRecord.getSublistValue({
        		sublistId: 'recmachcustrecord_fcs_c',
        		fieldId: 'custrecord_uom_c',
        		line: i
        	});
        	var uomStock = newRecord.getSublistValue({
        		sublistId: 'recmachcustrecord_fcs_c',
        		fieldId: 'custrecord_uom_c_stock',
        		line: i
        	});

        	log.debug('uom', uom);
        	log.debug('uomStock', uomStock);

        	var fromUom = getUnitsTypeUom(uom);
			var toUom = getUnitsTypeUom(uomStock);

			log.debug('unitCost', unitCost);
			log.debug('fromUom', fromUom);
			log.debug('toUom', toUom);

        	var convertedUnitCost = unitCost * parseFloat(toUom.conversionrate) / parseFloat(fromUom.conversionrate);
        	var markUpRate = itemClassDetailsPerItem[itemId].markUp || 0;
        	log.debug('convertedUnitCost', convertedUnitCost);
        	log.debug('convertedUnitCost * (1+markup)', convertedUnitCost * (1 + markUpRate));
        	newRecord.setSublistValue({
        		sublistId: 'recmachcustrecord_fcs_c',
        		fieldId: 'custrecord_unit_cost_uom_stock',
        		line: i,
        		value: convertedUnitCost * (1 + markUpRate)
        	});
        }
    }

    function getItemIds(rec){
    	var itemIds = [];

    	const customIngredientLineCount = rec.getLineCount({
        	sublistId: 'recmachcustrecord_fcs_c'
        });

    	for(var i = 0; i < customIngredientLineCount; i++){
        	var itemId = rec.getSublistValue({
        		sublistId: 'recmachcustrecord_fcs_c',
        		fieldId: 'custrecord_ingdt_c',
	        	line: i
        	});
        	itemIds.push(itemId);
        }

        return itemIds;
    }

    function getItemClassDetails(itemIds){
    	var itemClassDetails = {};
    	var statement = `
			SELECT 
			 	i.id as itemid,
			 	itemclass.custrecord_itemclass_markup as markup
			FROM 
			 	Item i,
			 	customrecord_item_classification itemclass
			WHERE 
				i.custitem_item_class = itemclass.id
				AND
			 	i.id IN (${itemIds})
		`;

		log.debug('getUnitsTypeUom | statement', statement);

		var results = query.runSuiteQL({
		        query: statement,
		        params: []
		    })
		    .asMappedResults();

		results.forEach((res)=>{
			itemClassDetails[res.itemid] = {
				markUp: res.markup
			};
		});

		return itemClassDetails;
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


    return {beforeSubmit}

});
