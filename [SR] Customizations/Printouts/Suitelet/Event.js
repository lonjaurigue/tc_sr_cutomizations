/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url'], function(record, serverWidget, url) {

    function beforeLoad(context) {
        var form = context.form;
        var recordObj = context.newRecord;

        // Add the "Print Event" button to the form
        form.addButton({
            id: 'custpage_print_event',
            label: 'Print Event',
            functionName: "window.open('" + getSuiteletUrl(recordObj.id) + "', '_blank');" // Directly open the Suitelet URL in a new window
        });
    }

    // Function to generate Suitelet URL with Event ID parameter
    function getSuiteletUrl(eventId) {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript1138', // Replace with your Suitelet script ID
            deploymentId: 'customdeploy1', // Replace with your Suitelet deployment ID
            params: {
                event: eventId // Use 'Event' as the parameter name
            }
        });
        return suiteletUrl;
    }

    return {
        beforeLoad: beforeLoad
    };
});
