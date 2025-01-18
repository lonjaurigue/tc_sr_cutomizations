/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/currentRecord',
],
function(currentRecord) {
    
    function pageInit(scriptContext) {

        /**
         * This works in conjuction with a user event that stores data in a hidden field "custpage_costingsheet"
         */
        try{
            const recCurrent = currentRecord.get()

            if(scriptContext.mode != 'create') return

            const strCostingSheet = recCurrent.getValue({fieldId: 'custpage_costingsheet'})
            if(!strCostingSheet) return

            const intLineCount = recCurrent.getLineCount({
                sublistId: 'inventory'
            })
            log.debug('intLineCount', intLineCount)
    
            let items = []
            let invalidItems = []

            for(let i=intLineCount-1; i>=0; i--) { 
    
                recCurrent.selectLine({
                    sublistId: 'inventory',
                    line: i
                })

                const intItem = recCurrent.getCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'item',
                })

                let fltQuantity = recCurrent.getCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'adjustqtyby',
                })

                const intUom = recCurrent.getCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'units',
                })

                items.push({
                    item: intItem,
                    quanty: fltQuantity,
                    uom: intUom
                })

                if(!intItem) {
                    invalidItems.push({
                        line: i
                    })

                    recCurrent.removeLine({
                        sublistId: 'inventory',
                        line: i
                    });
                    continue
                } 

                recCurrent.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'item',
                    value: intItem,
                    forceSyncSourcing:true
                })

                recCurrent.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'units',
                    value: intUom,
                    forceSyncSourcing:true
                })
    
                recCurrent.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'adjustqtyby',
                    value: fltQuantity,
                    forceSyncSourcing:true
                })
    
                recCurrent.commitLine({
                    sublistId:  'inventory',
                })

                let stopper = null
            }
    
            log.audit('items', items)
            log.audit('invalidItems', invalidItems)
        }catch(objError) {
            log.error('error catched', objError)
        }
    }


    return {
        pageInit: pageInit
    };
    
});
