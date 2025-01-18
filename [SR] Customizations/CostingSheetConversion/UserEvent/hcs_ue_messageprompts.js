/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/ui/message'],
    /**
 * @param{message} message
 */
    (message) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
   
        const beforeLoad = (scriptContext) => {

            try{
               
                const objForm = scriptContext.form
                const objNewRecord = scriptContext.newRecord

                if(scriptContext.newRecord.type == 'customrecord_costing_sheet') {
                    const strGenerationLog = objNewRecord.getValue({fieldId: 'custrecord_cs_transgenlog'})
    
                    log.audit('strGenerationLog', strGenerationLog)
                    
                    if(strGenerationLog == 'pending') {
                        let objErrMessage = message.create({
                            title: "Transaction generation is currently in-progress",
                            message: 'Please refresh the page to check for updates',
                            type: message.Type.INFORMATION
                        })
                        objErrMessage.show()

                        objForm.addPageInitMessage(objErrMessage)
                    }
                    // else if(strGenerationLog != '') {

                    //     let objErrMessage = message.create({
                    //         title: "There was an error generating transaction for this record",
                    //         message: strGenerationLog,
                    //         type: message.Type.ERROR
                    //     })
                    //     objErrMessage.show()
    
                    //     objForm.addPageInitMessage(objErrMessage)
                    // }

                    const hasNoItemForPrCreation = objNewRecord.getValue({fieldId: 'custrecord_tc_no_item_for_pr_creation'});
                    if(hasNoItemForPrCreation == true || hasNoItemForPrCreation == 'T') {
                        let objInfoMessage = message.create({
                            title: "Items are not for PR generation.",
                            message: 'The items that were generated are not applicable for PR creation. Please check if the items are perisable or common/GK.',
                            type: message.Type.INFORMATION,
                            duration: 0
                        })
                        objInfoMessage.show()

                        objForm.addPageInitMessage(objInfoMessage)
                    }
                }
            }catch(objError) {
                log.error('error catched', objError)
            }
            
        }

        return {beforeLoad}

    });
