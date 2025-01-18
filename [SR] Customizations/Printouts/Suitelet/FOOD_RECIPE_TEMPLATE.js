/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log', 'N/format', 'N/render', 'N/error', 'N/search'], function(record, log, format, render, error, search) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            try {
                var recipeId = context.request.parameters.recipeId;

                if (!recipeId) {
                    throw error.create({
                        name: 'INVALID_PARAM',
                        message: 'Recipe ID is missing.'
                    });
                }

                var recipeRecord = record.load({
                    type: 'customrecord_food_recipes',
                    id: recipeId
                });

                var today = format.format({ value: new Date(), type: format.Type.DATE });

                // Get item code
                var itemCode = recipeRecord.getValue({ fieldId: 'custrecord_recipeitemcode' });

                // Load the item record using the correct type
                var itemRecord = record.load({
                    type: 'noninventoryitem', // Ensure this is the correct type
                    id: itemCode // Ensure this is the internal ID
                });
                var itemId = itemRecord.getValue({ fieldId: 'itemid' });

                var masterLevel = recipeRecord.getValue({ fieldId: 'custrecord_recipemasterlevel' });
                var masterLevelHTML = (!masterLevel || masterLevel === '0') 
                    ? '<td>Master Level:  </td>' 
                    : '<td>Master Level: L' + encodeXML(masterLevel) + '</td>';
            
                // Create PDF content
                var pdfContent = '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<pdf>' +
                    '<head>' +
                    '<style>' +
                    'table { border-collapse: collapse; width: 100%; }' +
                    'th, td { border: 0px solid black; padding: 5px; }' +
                    'body { font-family: Arial, sans-serif; font-size: 8pt; }' +
                    'td.indented { padding-left: 20px; }' +
                    '</style>' +
                    '</head>' +
                    '<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">' +
                    '<h2 style="font-weight: bold; font-size: 12pt;">HIZON&apos;S CATERING AND RESTAURANT SERVICES INC.</h2>' +
                    '<h2 style="font-size: 9pt;">STANDARD RECIPE (50PAX)</h2>' +
                    '<h2 style="font-size: 9pt;">Date Printed: ' + encodeXML(today) + '</h2>' +
                    '<table class="body" style="width: 100%; margin-top: 10px; font-size: 8pt;" border-bottom="1">' +
                    '<tr>' +
                    '<td>Product Code: ' + encodeXML(itemId) + '</td>' +
                    '<td>Price/Head: ' + formatCurrency(recipeRecord.getValue({ fieldId: 'custrecord_food_recipe_cost_per_pax_stor' })) + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>Product Name: ' + encodeXML(recipeRecord.getValue({ fieldId: 'name' })) + '</td>' +
                    masterLevelHTML +  // Insert the masterLevelHTML here
                    '</tr>' +
                    '<tr><td>Menu Classification: L' + encodeXML(recipeRecord.getValue({ fieldId: 'custrecord_fnbmenuclass' })) + '</td></tr>' +
                    '<tr><td>Serving Specification: ' + encodeXML(recipeRecord.getValue({ fieldId: 'custrecord_foodrecipe_servespecification' })) + '</td></tr>' +
                    '<tr><td>Status: ' + encodeXML(recipeRecord.getValue({ fieldId: 'custrecord_foodrecipe_status' })) + '</td></tr>' +
                    '<tr><td>Remarks: ' + encodeXML(recipeRecord.getValue({ fieldId: 'custrecord_foodrecipe_remarks' })) + '</td></tr>' +
                    '</table>' +

                    // Add ingredients table
                    '<table style="width: 100%; margin-top: 10px; font-size: 8pt;">' +
                    '<thead>' +
                    '<tr border-top="1" border-bottom="1">' +
                    '<th colspan="2">Ingredient Description</th>' +
                    '<th align="center">U/M</th>' +
                    '<th align="center">Quantity</th>' +
                    '<th align="center">Cost</th>' +
                    '<th align="center">Amount</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';

                var ingredientMap = {}; // To group ingredients by category

                var ingredientCount = recipeRecord.getLineCount({
                    sublistId: 'recmachcustrecord_recipe_parent'
                });

                for (var i = 0; i < ingredientCount; i++) {
                    var categoryId = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_ingdt_category',
                        line: i
                    });

                    var category = recipeRecord.getSublistText({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_ingdt_category_display',
                        line: i
                    });

                    var itemDesc = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_foodrecipe_itemdesc',
                        line: i
                    });

                    var unitMeasure = recipeRecord.getSublistText({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_unit_of_measure_ingredients_display',
                        line: i
                    });

                    var quantity = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_recipe_ingredients_quantity',
                        line: i
                    });

                    var cost = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_ingredients_unit_cost',
                        line: i
                    });

                    var amount = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_ingredients_amount',
                        line: i
                    });

                    var subRecipeId = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_foodrecipe_subrecipe',
                        line: i
                    });

                    // Check if the sub-recipe field is not null
                    var subRecipeDisplay = recipeRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_recipe_parent',
                        fieldId: 'custrecord_foodrecipe_subrecipe_display',
                        line: i
                    });

                    if (!ingredientMap[categoryId]) {
                        ingredientMap[categoryId] = {
                            category: category,
                            items: []
                        };
                    }

                    if (subRecipeDisplay) {
                        // For category 11, include only sub-recipe ingredients
                        if (subRecipeId) {
                            var subRecipeDetails = searchSubRecipe(subRecipeId);
                            ingredientMap[categoryId].items.push({
                                itemDesc: '<b>' + encodeXML(itemDesc) + '</b>',
                                unitMeasure: '',
                                quantity: '',
                                cost: '',
                                amount: ''
                            });

                            subRecipeDetails.forEach(function(subIngredient) {
                                ingredientMap[categoryId].items.push({
                                    itemDesc: '&#160;&#160;&#160;' + encodeXML(subIngredient.itemDesc),
                                    unitMeasure: encodeXML(subIngredient.unitMeasure),
                                    quantity: encodeXML(subIngredient.quantity),
                                    cost: encodeXML(subIngredient.cost),
                                    amount: encodeXML(subIngredient.amount)
                                });
                            });
                        }
                    } else {
                        // Regular ingredients
                        ingredientMap[categoryId].items.push({
                            itemDesc: (categoryId === '11') ? '<b>' + encodeXML(itemDesc) + '</b>' : encodeXML(itemDesc),
                            unitMeasure: encodeXML(unitMeasure),
                            quantity: encodeXML(quantity),
                            cost: encodeXML(cost),
                            amount: encodeXML(amount)
                        });
                    }
                }

                // Generate PDF content for grouped ingredients
                for (var catId in ingredientMap) {
                    var categoryData = ingredientMap[catId];

                    pdfContent += '<tr border-bottom="1"><td colspan="6" style="font-weight: bold; font-size: 10pt;">' + encodeXML(categoryData.category) + '</td></tr>';

                    categoryData.items.forEach(function(item) {
                        var formattedCost = item.cost ? formatCurrency(item.cost) : '';
                        var formattedAmount = item.amount ? formatCurrency(item.amount) : '';

                        pdfContent += '<tr>' +
                            '<td></td>' +
                            '<td>' + item.itemDesc + '</td>' +
                            '<td align="right">' + item.unitMeasure + '</td>' +
                            '<td align="right">' + item.quantity + '</td>' +
                            '<td align="right">' + formattedCost + '</td>' +
                            '<td align="right">' + formattedAmount + '</td>' +
                            '</tr>';
                    });

                }

                // Add Total Cost
                var totalCost = recipeRecord.getValue({ fieldId: 'custrecord_total_recipe_cost_stored' });
                pdfContent += '<tr border-top="1">' +
                              '<td align="right" colspan="5" style="font-weight: bold;">TOTAL COST</td>' +
                              '<td align="right" style="font-weight: bold;">' + formatCurrency(totalCost) + '</td>' +
                              '</tr>';
                pdfContent += '</tbody></table>';

                // Add Site Procedure
                var siteProcedure = recipeRecord.getValue({ fieldId: 'custrecord_site_procedure' });
                var formattedSiteProcedure = formatSiteProcedure(siteProcedure);

                pdfContent += '<h2 style="font-size: 10pt;">Site Procedure</h2>' +
                              '<table style="width: 100%; font-size: 9pt;">' +
                              '<tr>' +
                              '<td colspan="6">' + formattedSiteProcedure + '</td>' +
                              '</tr></table>';

                pdfContent += '</body></pdf>';

                // Create PDF
                var pdf = render.create();
                pdf.templateContent = pdfContent;
                pdf = pdf.renderAsPdf();

                context.response.writeFile(pdf, true);

            } catch (e) {
                log.error({
                    title: 'Error generating PDF',
                    details: e
                });

                context.response.write({
                    output: 'Error generating PDF: ' + e.message
                });
            }
        }
    }

    function getItemIdByCode(itemCode) {
        var itemSearch = search.create({
            type: search.Type.ITEM,
            filters: [
                ['itemid', search.Operator.IS, itemCode]
            ],
            columns: ['internalid']
        });

        var resultSet = itemSearch.run();
        var result = resultSet.getRange({ start: 0, end: 1 });

        if (result.length > 0) {
            return result[0].getValue('internalid');
        }
        return 'Unknown';
    }

    function searchSubRecipe(subRecipeId) {
        var subRecipe = record.load({
            type: 'customrecord_food_recipes',
            id: subRecipeId
        });

        var subIngredients = [];

        var lineCount = subRecipe.getLineCount({
            sublistId: 'recmachcustrecord_recipe_parent'
        });

        for (var i = 0; i < lineCount; i++) {
            subIngredients.push({
                itemDesc: subRecipe.getSublistValue({
                    sublistId: 'recmachcustrecord_recipe_parent',
                    fieldId: 'custrecord_foodrecipe_itemdesc',
                    line: i
                }),
                unitMeasure: subRecipe.getSublistText({
                    sublistId: 'recmachcustrecord_recipe_parent',
                    fieldId: 'custrecord_unit_of_measure_ingredients_display',
                    line: i
                }),
                quantity: subRecipe.getSublistValue({
                    sublistId: 'recmachcustrecord_recipe_parent',
                    fieldId: 'custrecord_recipe_ingredients_quantity',
                    line: i
                }),
                cost: subRecipe.getSublistValue({
                    sublistId: 'recmachcustrecord_recipe_parent',
                    fieldId: 'custrecord_ingredients_unit_cost',
                    line: i
                }),
                amount: subRecipe.getSublistValue({
                    sublistId: 'recmachcustrecord_recipe_parent',
                    fieldId: 'custrecord_ingredients_amount',
                    line: i
                })
            });
        }

        return subIngredients;
    }

    function formatSiteProcedure(procedure) {
        if (!procedure || typeof procedure !== 'string') {
            return '<ul><li>No site procedure available.</li></ul>';
        }

        var lines = procedure.toString().split('\n'); // Ensure procedure is a string
        var listItems = [];

        lines.forEach(function(line) {
            line = line.trim();
            if (line.length > 0) {
                listItems.push('<li>' + encodeXML(line) + '</li>');
            }
        });

        return '<ul>' + listItems.join('') + '</ul>';
    }

    function encodeXML(str) {
        if (typeof str !== 'string') {
            str = String(str); // Convert non-string to string
        }
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatCurrency(amount) {
        if (isNaN(amount) || amount === null) {
            return '';
        }

        var formatted = parseFloat(amount).toFixed(2);
        var parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas for thousands
        return parts.join('.');
    }

    return {
        onRequest: onRequest
    };
});
