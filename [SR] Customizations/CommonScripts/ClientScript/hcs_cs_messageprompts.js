/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/currentRecord'],
/**
 * @param{message} message
 */
function(message, currentRecord) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */


    // const objcurrentRecord = currentRecord.get()

    // console.log('test', 123)
    
    // if(objcurrentRecord.type == 'customrecord_costing_sheet') {
    //     const strGenerationLog = objcurrentRecord.getValue({fieldId: 'custrecord_cs_transgenlog'})

    //     log.audit('strGenerationLog', strGenerationLog)
        
    //     if(strGenerationLog != '') {

    //         setTimeout(() => {
    //             var objErrMessage = message.create({
    //                 title: "There was an error generating transaction for this record",
    //                 message: strGenerationLog,
    //                 type: message.Type.ERROR
    //             })
    //             objErrMessage.show()

    //             setTimeout(() => {
                    
    //                 objErrMessage.hide()
    //             }, 5000)
    //         }, 5000)
        
    //     }
    // }


    function pageInit(scriptContext) {

        // const objcurrentRecord = scriptContext.currentRecord

        // console.log('test', 123)
        
        // if(objcurrentRecord.type == 'customrecord_costing_sheet') {
        //     const strGenerationLog = objcurrentRecord.getValue({fieldId: 'custrecord_cs_transgenlog'})

        //     log.audit('strGenerationLog', strGenerationLog)
            
        //     if(strGenerationLog != '') {

        //         setTimeout(() => {
        //             var objErrMessage = message.create({
        //                 title: "There was an error generating transaction for this record",
        //                 message: strGenerationLog,
        //                 type: message.Type.ERROR
        //             })
        //             objErrMessage.show()

        //             setTimeout(() => {
                        
        //                 objErrMessage.hide()
        //             }, 5000)
        //         }, 5000)
            
        //     }
        // }
    }

    return {
        pageInit: pageInit
    };
    
});
