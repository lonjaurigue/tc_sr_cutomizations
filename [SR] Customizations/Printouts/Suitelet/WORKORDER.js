/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url', 'N/log'], function(record, serverWidget, url, log) {

    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var form = context.form;
            var recordObj = context.newRecord;

            // Ensure the record type is Work Order
            if (recordObj.type === record.Type.WORK_ORDER) {
                // Add the "Print Work Order" button to the form
                form.addButton({
                    id: 'custpage_print_work_order',
                    label: 'Print Work Order',
                    functionName: "window.open('" + getSuiteletUrl(recordObj.id) + "', '_blank');"
                });
            }
        }
    }

    // Function to generate Suitelet URL with Record ID parameter
    function getSuiteletUrl(recordId) {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript1151', // Replace with your Suitelet script ID
            deploymentId: 'customdeploy2', // Replace with your Suitelet deployment ID
            params: {
                workorderid: recordId
            }
        });
        return suiteletUrl;
    }

    return {
        beforeLoad: beforeLoad
    };
});
