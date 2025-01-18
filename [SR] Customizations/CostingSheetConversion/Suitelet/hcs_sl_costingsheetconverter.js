/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/error',
    'N/ui/serverWidget',
    '../Library/hcs_lib_purchaserequest',
    '../Library/hcs_lib_salesorder',
    '../Library/hcs_lib_stockrequisition',
    '../Library/hcs_lib_costingsheet',
    '../Library/hcs_lib_invetoryadjustment'
],
(   error, 
    serverWidget, 
    purchaseRequest, 
    salesOrder, 
    stockRequisition, 
    costingSheet,
    inventoryAdjustment
) => {

    const onRequest = (scriptContext) => {

        const intCostingSheet = scriptContext.request.parameters.costingSheet
        const intOpportuntiy =  scriptContext.request.parameters.opportunity
        const intSubsidiary = scriptContext.request.parameters.subsidiary
        const strAction = scriptContext.request.parameters.action

        log.debug('params', scriptContext.request.parameters)

        try{
            switch(strAction) {
                case 'createPurchaseRequest': {
                    purchaseRequest.create({
                        costingSheet: intCostingSheet,
                        subsidiary: intSubsidiary,
                    })
                    break
                }
                case 'createSalesOrder': {
                    salesOrder.create({
                        costingSheet: intCostingSheet
                    })
                    break
                }
                case 'createStockRequisition': {
                    stockRequisition.create({
                        costingSheet: intCostingSheet,
                    })
                    break
                }
                case 'createCostingSheetFromOpportunity': {
                    costingSheet.createFromOpportunity({
                        opportunity: intOpportuntiy,
                    })
                    break
                }
                case 'createInventoryAdjustment': {
                    inventoryAdjustment.redirectToRecord({
                        costingSheet: intCostingSheet,
                    })
                }
            }
            
        }catch(objError) {

            const objForm = serverWidget.createForm({
                title: ' ',
            })
            objForm.addField({
                id: 'custpage_error_message',
                type : serverWidget.FieldType.INLINEHTML,
                label : ' '
            }).defaultValue = `
                ${objError.message.replaceAll('\n', '<br>')}
                <a href="#" onclick="window.history.back()"><br><br>Click here to go back</a>
            `
            log.error('SuiteLet error catched', objError)
            scriptContext.response.writePage(objForm)
        }
        
       
    }

    return {onRequest}

});