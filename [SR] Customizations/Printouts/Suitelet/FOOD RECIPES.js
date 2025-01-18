/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/url'], function(record, serverWidget, url) {

    function beforeLoad(context) {
        var form = context.form;
        var recordObj = context.newRecord;

        // Ensure the record type is Food Recipes
        if (context.type === context.UserEventType.VIEW && recordObj.type === 'customrecord_food_recipes') {
            // Add the "Print Recipe" button to the form
            form.addButton({
                id: 'custpage_print_recipe',
                label: 'Print Recipe',
                functionName: "window.open('" + getSuiteletUrl(recordObj.id) + "', '_blank');"
            });
        }
    }

    // Function to generate Suitelet URL with Record ID parameter
    function getSuiteletUrl(recordId) {
        return url.resolveScript({
            scriptId: 'customscript1163', // Replace with your Suitelet script ID
            deploymentId: 'customdeploy1', // Replace with your Suitelet deployment ID
            params: {
                recipeId: recordId // Ensure this is 'recipeId'
            }
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});
