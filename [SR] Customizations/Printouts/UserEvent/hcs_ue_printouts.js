/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/record'
],
(record) => {
    
    const beforeLoad = (scriptContext) => {
        const recNewRecord = scriptContext.newRecord
        const strRecordType = recNewRecord.type
        const objForm = scriptContext.form
        const strSuiteLetConverter = '/app/site/hosting/scriptlet.nl?script=customscript_hcs_printouthandler_sl&deploy=customdeploy_hcs_sl_printouthandler_1'

      log.debug('script context', scriptContext); log.debug('custom form', recNewRecord.customform)
      log.debug('new rec', recNewRecord)
      var formId;


      /*var formId = recNewRecord.getValue({ fieldId: 'customform' });
      log.debug('FORM ID', formId);*/

      

      let customform = recNewRecord.getValue({
        fieldId: 'baserecordtype'
      });

        try{
            if(strRecordType == 'estimate'){
                if(scriptContext.type != scriptContext.UserEventType.CREATE){
                    var recObj = record.load({type: record.Type.ESTIMATE, id: recNewRecord.id});
                    formId = recObj.getValue({fieldId: 'customform'});
                    log.debug('FORM ID', formId);
                }

                /* As per discussion, this button is no longer needed. */
                /* The functionality is replaced by Event Revenue subtab.ue */
                /*if(formId == '240') {
                    objForm.addButton({
                        id: 'custpage_btn_fbproposal',
                        label: 'Print Event Proposal',
                        functionName: `
                            window.open('${strSuiteLetConverter}&action=print&type=fandbproposal&proposal_id=${recNewRecord.id}', '_blank')
                        `
                    })
                }*/
                else if(formId == '214'){
                    objForm.addButton({
                        id: 'custpage_btn_fbproposal',
                        label: 'Print Contract',
                        functionName: `
                            window.open('${strSuiteLetConverter}&action=print&type=proposalcontract&proposal_id=${recNewRecord.id}', '_blank')
                        `
                    }) 
                }
            }

            var validForPrintFBBeoButton = isFormValidForPrintFBBeoButton(recNewRecord);

            if(strRecordType == 'salesorder' && validForPrintFBBeoButton && scriptContext.type == scriptContext.UserEventType.VIEW){
                objForm.addButton({
                    id: 'custpage_btn_fbbeo',
                    label: 'Print F&B BEO',
                    functionName: `
                        window.open('${strSuiteLetConverter}&action=print&type=fandbbeo&beo_id=${recNewRecord.id}', '_blank')
                    `
                }) 
            }
            log.debug('strRecordType', strRecordType);
           
        }catch(objError) {
            log.error('ue error catched', objError)
        }
        
    }

    function isFormValidForPrintFBBeoButton(transactionRecord){
        var isValid = true;
        var F_B_CANTEERN_SO_FORM = 242 //F&B Canteen Sales Order - Cash Sales
        var custForm = transactionRecord.getValue({
            fieldId: 'customform'
        });


        var APPROVAL_STATUS_APPROVED = 2;
        var approvalStatus = transactionRecord.getValue({
            fieldId: 'custbody_hizon_approval_status'
        })


        if((F_B_CANTEERN_SO_FORM == custForm) || (approvalStatus != APPROVAL_STATUS_APPROVED)) {
            isValid = false;
        }

        return isValid;
    }


    return {beforeLoad}

});