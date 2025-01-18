/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url'], function (record, serverWidget, url) {

    function beforeLoad(context) {
        // Check if the script is triggered during the VIEW operation
        if (context.type === context.UserEventType.VIEW) {
            var form = context.form;
            var recordObj = context.newRecord;

            // Ensure the record is of type Sales Order
            if (recordObj && recordObj.type === record.Type.SALES_ORDER) {
                // Retrieve the values of custom approval status fields and subsidiary
                var hizonApprovalStatus = recordObj.getValue({ fieldId: 'custbody_hizon_approval_status' });
                var evAmApprovalStatus = recordObj.getValue({ fieldId: 'custbody_ev_am_approval_status' });
                var subsidiary = recordObj.getValue({ fieldId: 'subsidiary' });

                // Check if the conditions for showing the button are met
                if (
                    subsidiary === '6' && // Ensure subsidiary is not 6
                    evAmApprovalStatus !== '7' &&
                    (hizonApprovalStatus === '2' || evAmApprovalStatus === '4')
                ) {
                    // Add the "Print BEO" button to the form
                    form.addButton({
                        id: 'custpage_print_beo',
                        label: 'Print BEO SGS',
                        functionName: "window.open('" + getSuiteletUrl(recordObj.id) + "', '_blank');" // Directly open the Suitelet URL in a new window
                    });
                }
            }
        }
    }

    // Function to generate Suitelet URL with sales order ID parameter
    function getSuiteletUrl(salesOrderId) {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript1481', // Replace with your Suitelet script ID
            deploymentId: 'customdeploy1', // Replace with your Suitelet deployment ID
            params: {
                salesorder: salesOrderId // Use 'salesorder' as the parameter name
            }
        });
        return suiteletUrl;
    }

    return {
        beforeLoad: beforeLoad
    };
});
