/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log', 'N/format', 'N/error'], function(record, log, format, error) {

   function escapeXMLChars(input) {
        if (!input) return '';
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Retrieve parameters
            var eventId = context.request.parameters.event;

            // Check if eventId is provided
            if (!eventId) {
                context.response.write('Event ID is missing.');
                return;
            }

            try {
                // Load Event record
                var eventRecord = record.load({
                    type: 'calendarevent', // Specify the correct record type
                    id: eventId // Provide the internal ID of the Event record
                });

                var eventTitle = eventRecord.getValue({
                    fieldId: 'title'
                });

                var startTimeRaw = eventRecord.getValue({ fieldId: 'starttime' });
                var startTime = startTimeRaw ? format.format({
                    value: startTimeRaw,
                    type: format.Type.TIMEOFDAY, // Specify the type of the original value
                    format: 'hh:mm a' // Specify the desired format (12-hour format with am/pm)
                }) : '';

                // Add current date
                var today = format.format({
                    value: new Date(),
                    type: format.Type.DATE
                });

                // Get the value of custevent_event_costing_sheet field from the event record
                var costingSheetId = eventRecord.getValue({
                    fieldId: 'custevent_event_costing_sheet'
                });

                if (!costingSheetId) {
                    context.response.write('Costing Sheet ID is missing.');
                    return;
                }

                // Load Costing Sheet record
                var costingSheetRecord = record.load({
                    type: 'customrecord_costing_sheet', // Specify the correct record type
                    id: costingSheetId // Provide the internal ID of the Costing Sheet record
                });

                // Get values from the Event Record
                var eventDateRaw = eventRecord.getValue({
                    fieldId: 'calendardate'
                });

                // Get values from the Costing Sheet record
                var fcsRemarks = costingSheetRecord.getValue({
                    fieldId: 'custrecord_fcs_remarks'
                });

                var eventDate = eventDateRaw ? format.format({
                    value: eventDateRaw,
                    type: format.Type.DATE
                }) : '';

                if (eventDate) {
                    eventDate = new Date(eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                }

                // Get the name of the class associated with custrecord_charge_to
                var chargeToClass = costingSheetRecord.getText({
                    fieldId: 'custrecord_charge_to' // Specify the field ID of the class field
                });

                // Get the chargeTo field value
                var chargeTo = costingSheetRecord.getValue({
                    fieldId: 'custrecord_charge_to'
                });

                // Get the name of the venue associated with custrecord_costing_sheet_venue
                var venue = escapeXMLChars(costingSheetRecord.getText({
                    fieldId: 'custrecord_costing_sheet_venue' // Specify the field ID of the venue field
                }));

                // Log retrieved values (you can process them as needed)
                log.debug('Costing Sheet Values', {
                    fcsRemarks: fcsRemarks,
                    chargeTo: chargeTo,
                    venue: venue,
                });

                // Generate PDF content
                var pdfContent = '<pdf>';
                pdfContent += '<head>';
                pdfContent += '<style>table { border-collapse: collapse; width: 100%;} th, td { border: 0px solid black; padding: 3px; text-align: left; } body { font-family: Arial, sans-serif; font-size: 8pt; }</style>';
                pdfContent += '</head>';
                pdfContent += '<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';

                // Add the company name and date
                pdfContent += '<h2 style="font-weight: bold; font-size: 12pt;">HIZON&apos;S CATERING AND RESTAURANT SERVICES INC.</h2>';
                pdfContent += '<h2 style="font-size: 8pt;">Date Printed: ' + today + '</h2>';

                // Add table content
                pdfContent += '<table class="body" style="width: 100%; margin-top: 10px; font-size: 8pt;" border-bottom="1">' +
                    '<tr style="height: 16.8px;">' +
                    '<td style="height: 16.8px; font-size: 8pt;">Client</td>' +
                    '<td style="height: 16.8px; font-size: 8pt;"><strong>' + venue + '</strong></td>' +
                    '<td style="height: 16.8px; font-size: 8pt;">Date of Event</td>' +
                    '<td style="height: 16.8px; font-size: 8pt;"><strong>'+ eventDate +'</strong></td>' +
                    '<td style="height: 16.8px; font-size: 8pt;">Serving Time</td>' +
                    '<td style="height: 16.8px; font-size: 8pt;"><strong>'+ startTime +'</strong></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="font-size: 8pt;">Nature of Func:</td>' +
                    '<td colspan="3" style="font-size: 8pt;"><strong>' + eventTitle + '</strong></td>' +
                    '<td style="font-size: 8pt;">Venue</td>' +
                    '<td style="font-size: 8pt;"><strong>' + venue + '</strong></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="font-size: 8pt;">Remarks:</td>' +
                    '<td style="font-size: 8pt;"><strong> ' + fcsRemarks + '</strong></td>' +
                    '<td style="font-size: 8pt;">Charge To:</td>' +
                    '<td style="font-size: 8pt;"><strong>' + chargeToClass + '</strong></td>' +
                    '<td style="font-size: 8pt;">Contract Price / Cost</td>' +
                    '<td style="font-size: 8pt;"><strong></strong></td>' +
                    '</tr>' +
                    '</table>';

                // Loop through each line in the recmachcustrecord_food_calendar_menu sublist
                var numLines = eventRecord.getLineCount({ sublistId: 'recmachcustrecord_food_calendar_menu' });
                for (var i = 0; i < numLines; i++) {
                    // Get the number of pax for each line
                    var paxCount = eventRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_food_calendar_menu',
                        fieldId: 'custrecord_fcs_pax',
                        line: i
                    });

                    // Skip the menu if pax count is 0
                    if (paxCount === 0) {
                        continue;
                    }

                    // Get the value of custrecord_fcs_menu for each line
                    var menuId = eventRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_food_calendar_menu',
                        fieldId: 'id',
                        line: i
                    });

                    log.debug('Menu ID', menuId); // Log the menu ID for debugging purposes

                    var foodMenuRecord;
                    try {
                        // Load custom record 'customrecord_food_menu_fb' to retrieve food recipes
                        foodMenuRecord = record.load({
                            type: 'customrecord_food_menu_fb',
                            id: menuId
                        });
                    } catch (e) {
                        log.error({
                            title: 'Error Loading Menu Record',
                            details: 'Menu ID: ' + menuId + ', Error: ' + escapeXMLChars(e.message)
                        });
                        continue;
                    }

                    // Add menu name and pax count in a table row
                    pdfContent += '<table style="width: 100%; margin-top: 5px;">';
                    pdfContent += '<tr>';
                    
                    var menuDisplay = escapeXMLChars(eventRecord.getSublistText({
                        sublistId: 'recmachcustrecord_food_calendar_menu',
                        fieldId: 'custrecord_fcs_menu_display',
                        line: i
                    }));

                    if (!menuDisplay) {
                        menuDisplay = escapeXMLChars(eventRecord.getSublistText({
                            sublistId: 'recmachcustrecord_food_calendar_menu',
                            fieldId: 'custrecord_menu_copy',
                            line: i
                        }));
                    }

                    pdfContent += '<td style="width: 75%; font-size: 9pt;"><strong>Menu Name: </strong>' + menuDisplay + '</td>';
                    pdfContent += '<td style="width: 50%; font-size: 9pt;"><strong>No. of Pax: </strong>' + escapeXMLChars(paxCount.toString()) + '</td>';
                    pdfContent += '</tr>';
                    pdfContent += '</table>';
                   
                    // Add food recipes associated with the menu in a table format
                    pdfContent += '<table style="width: 100%; margin-top: 5px; top: 1px;">';
                    pdfContent += '<tr border-top="1" border-bottom="1"><th style="width: 50%; font-size: 9pt;">INGREDIENTS</th><th style="width: 25%; font-size: 9pt;" align="right">QTY</th><th style="width: 25%; font-size: 9pt;" align="right">U / M</th></tr>';

                    var numRecipeLines = foodMenuRecord.getLineCount({ sublistId: 'recmachcustrecord_related_food_menu' });
                    if (numRecipeLines === 0) {
                        pdfContent += '<tr><td colspan="3" align="center" style="font-size: 9pt;">No ingredients under this menu.</td></tr>';
                        pdfContent += '<tr><td colspan="3" align="center" style="font-size: 9pt;">Reason: Custom ingredient is not defined or missing.</td></tr>';
                    } else {
                        for (var j = 0; j < numRecipeLines; j++) {
                            var foodRecipeDesc = escapeXMLChars(foodMenuRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_related_food_menu',
                                fieldId: 'custrecord_customrecipedescription',
                                line: j
                            }));

                            var foodRecipeQuantity = foodMenuRecord.getSublistValue({
                                sublistId: 'recmachcustrecord_related_food_menu',
                                fieldId: 'custrecord_qty_c',
                                line: j
                            });

                            var foodRecipeUOM = escapeXMLChars(foodMenuRecord.getSublistText({
                                sublistId: 'recmachcustrecord_related_food_menu',
                                fieldId: 'custrecord_uom_c_display',
                                line: j
                            }));

                            // Custom function to format the quantity to #,###.00
                            function formatNumberToCurrency(value) {
                                var number = parseFloat(value);
                                if (isNaN(number)) return '0';

                                // Round to two decimal places
                                var formattedNumber = number.toFixed(2);

                                // Add commas as thousand separators
                                var parts = formattedNumber.split('.');
                                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                return parts.join('.');
                            }

                            // Round off the quantity to two decimal places and format it as #,###.00
                            if (foodRecipeQuantity !== null) {
                                foodRecipeQuantity = formatNumberToCurrency(foodRecipeQuantity);
                            }

                            if (!foodRecipeDesc || foodRecipeQuantity === null || !foodRecipeUOM) {
                                log.error({
                                    title: 'Missing Custom Ingredient Details',
                                    details: 'Menu ID: ' + menuId + ', Line: ' + j
                                });
                                pdfContent += '<tr><td colspan="3" align="center" style="font-size: 9pt;">Missing ingredient details at line ' + (j + 1) + '.</td></tr>';
                                pdfContent += '<tr><td colspan="3" align="center" style="font-size: 9pt;">Reason: Custom ingredient details (description, quantity, or UOM) are missing.</td></tr>';
                                continue;
                            }

                            // Add the ingredient details to the PDF content
                            pdfContent += '<tr>';
                            pdfContent += '<td align="left" style="font-size: 9pt;">' + foodRecipeDesc + '</td>';
                            pdfContent += '<td align="right" style="font-size: 9pt;">' + foodRecipeQuantity + '</td>';
                            pdfContent += '<td align="right" style="font-size: 9pt;">' + foodRecipeUOM + '</td>';
                            pdfContent += '</tr>';
                        }
                    }

                    pdfContent += '</table>';
                }

                pdfContent += '<table class="body" style="width: 100%; margin-top: 10px; font-size: 9pt;" border-top="1">' +
                    '<tr style="height: 16.8px; padding-top: 2px;">' +
                    '<td align="center" colspan="6" style="font-size: 9pt;"><strong>***NOTHING FOLLOWS***</strong></td>' +
                    '</tr>' +
                    '</table>';

                // Close the PDF content tags                
                pdfContent += '</body></pdf>';

                // Serve PDF content as response
                context.response.renderPdf({ xmlString: pdfContent });
            } catch (e) {
                log.error({
                    title: 'Error Generating PDF',
                    details: escapeXMLChars(e.message)
                });
                context.response.write('Error generating PDF view.');
            }
        }
    }

    return {
        onRequest: onRequest
    };
});