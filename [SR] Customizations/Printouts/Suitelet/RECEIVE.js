/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url', 'N/search'], function(record, serverWidget, url, search) {

    function beforeLoad(context) {
        var form = context.form;
        var recordObj = context.newRecord;

        // Ensure the record type is Item Receipt
        if (recordObj.type === record.Type.ITEM_RECEIPT) {
            // Get the value of the "Create From" field
            var createdFrom = recordObj.getValue({ fieldId: 'createdfrom' });

            if (createdFrom) {
                // Perform a search to get the type of the "Create From" record
                var searchResult = search.lookupFields({
                    type: 'transaction',
                    id: createdFrom,
                    columns: ['recordtype']
                });

                // Determine the Suitelet script ID based on the "Create From" record type
                var scriptId = (searchResult.recordtype === 'transferorder') 
                    ? 'customscript1165' 
                    : 'customscript1146';
                
                // Add the "Print Receive" button to the form
                form.addButton({
                    id: 'custpage_print_receive',
                    label: 'Print Receive',
                    functionName: "window.open('" + getSuiteletUrl(recordObj.id, scriptId) + "', '_blank');" // Directly open the Suitelet URL in a new window
                });
            }
        }
    }

    // Function to generate Suitelet URL with Record ID and Script ID parameters
    function getSuiteletUrl(recordId, scriptId) {
        var suiteletUrl = url.resolveScript({
            scriptId: scriptId, // Use the determined Suitelet script ID
            deploymentId: 'customdeploy1', // Deployment ID is the same for both Suitelets
            params: {
                recordId: recordId // Use 'recordId' as the parameter name
            }
        });
        return suiteletUrl;
    }

    return {
        beforeLoad: beforeLoad
    };
});
