/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url', 'N/log'], function(record, serverWidget, url, log) {

    function beforeLoad(context) {
        var form = context.form;
        var recordObj = context.newRecord;

        // Log the record type for debugging
        log.debug('Record Type', recordObj.type);

        // Ensure the record type is Intercompany Transfer Order
        if (recordObj.type === 'intercompanytransferorder') {
            log.debug('Record Type Matched', 'Adding button to form');

            // Add the "Print Picking Ticket" button to the form
            form.addButton({
                id: 'custpage_print_picking_ticket',
                label: 'Print Picking Ticket',
                functionName: "window.open('" + getSuiteletUrl(recordObj.id) + "', '_blank');" // Directly open the Suitelet URL in a new window
            });
        } else {
            log.debug('Record Type Not Matched', 'Button not added');
        }
    }

    // Function to generate Suitelet URL with Record ID parameter
    function getSuiteletUrl(recordId) {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript1160', // Replace with your Suitelet script ID
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
