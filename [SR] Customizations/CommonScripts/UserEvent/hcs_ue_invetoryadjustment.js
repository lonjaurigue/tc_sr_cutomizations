/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/ui/serverWidget',
    '../../Helper/helper',
    '../../CostingSheetConversion/Library/hcs_lib_invetoryadjustment'
],
(serverWidget, helper, invetoryAdjustment) => {
   
    const beforeLoad = (scriptContext) => {
       
        try{

            if(scriptContext.type == 'create') {

                invetoryAdjustment.preFill({
                    request: scriptContext.request,
                    record: scriptContext.newRecord,
                    form: scriptContext.form
                })
            }

        }catch(objError) {
            log.error('beforeLoad error', objError)
        }
        

    }

    return { beforeLoad }

});
