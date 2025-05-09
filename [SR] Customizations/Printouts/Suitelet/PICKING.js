/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url'], function(record, serverWidget, url) {

    function beforeLoad(context) {
        var form = context.form;
        var recordObj = context.newRecord;

        // Ensure the record type is Transfer Order
        if (recordObj.type === record.Type.TRANSFER_ORDER) {
            // Add the "Print Picking Ticket" button to the form
            form.addButton({
                id: 'custpage_print_picking_ticket',
                label: 'Print Picking Ticket',
                functionName: "window.open('" + getSuiteletUrl(recordObj.id) + "', '_blank');" // Directly open the Suitelet URL in a new window
            });
        }
    }

    // Function to generate Suitelet URL with Record ID parameter
    function getSuiteletUrl(recordId) {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript1157', // Replace with your Suitelet script ID
            deploymentId: 'customdeploy1', // Replace with your Suitelet deployment ID
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
