/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', 'N/log'], function(record, render, log) {

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, function(m) { return map[m]; }) : '';
    }

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

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var recordId = context.request.parameters.recordId;

            if (!recordId) {
                context.response.write('Transfer Order ID parameter is missing.');
                return;
            }

            try {
                // Load Transfer Order record
                var transferOrder = record.load({
                    type: record.Type.TRANSFER_ORDER,
                    id: recordId
                });

                // Get subsidiary name
                var subsidiaryName = escapeHtml(transferOrder.getText({
                    fieldId: 'subsidiary'
                }));

                // Get other fields from Transfer Order record
                var tranDate = transferOrder.getValue({
                    fieldId: 'trandate'
                });
                var dateNeeded = transferOrder.getValue({
                    fieldId: 'custbody_sr_date_required'
                });
                var orderNumber = transferOrder.getValue({
                    fieldId: 'tranid'
                });
                var transferLocation = transferOrder.getText({
                    fieldId: 'transferlocation'
                });

                // Format dates
                var formattedTranDate = new Date(tranDate).toLocaleDateString('en-US');
                var formattedDateNeeded = new Date(dateNeeded).toLocaleDateString('en-US');

                // Generate PDF content
                var pdfContent = '<pdf>';
                pdfContent += '<head>';
                pdfContent += '<style>body { font-family: Arial, sans-serif; }</style>'; // Example: Adding CSS styles
                pdfContent += '</head>';
                pdfContent += '<body>';

                // Adding content
                pdfContent += '<h1 align="center" style="font-size: 24px; font-family: Arial, sans-serif;">&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;' + escapeHtml("Picking Ticket") + '</h1>';
                pdfContent += '<table style="width: 100%; margin-top: 20px; padding: 1px;">';

                // Subsidiary name
                pdfContent += '<tr>';
                pdfContent += '<td align="center" style="padding: 5px; text-align: center; vertical-align: middle; font-size: 18px; font-family: Arial, sans-serif;" rowspan="10">' + escapeHtml("Hizon's Catering Services Inc.") + '</td>';

                // Second column
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td style="font-size: 12px;"><strong>Date Needed</strong></td>';
                pdfContent += '<td style="font-size: 12px;">' + formattedDateNeeded + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Transfer Order #</strong></td>';
                pdfContent += '<td>' + orderNumber + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong></strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>To Location</strong></td>';
                pdfContent += '<td>' + escapeHtml(transferLocation) + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Receive By</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Subsidiary</strong></td>';
                pdfContent += '<td>' + subsidiaryName + '</td>';
                pdfContent += '</tr>';

                pdfContent += '</table>';

                // Item Sublist table
                pdfContent += '<table style="width: 100%; margin-top: 20px; border-collapse: collapse;">';
                pdfContent += '<thead>';

                pdfContent += '<tr style="background-color: black; color: white; border: 1px solid black; font-size: 12px;">';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Item</th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Quantity</th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Units</th>';
                pdfContent += '</tr>';
                pdfContent += '</thead>';
                pdfContent += '<tbody>';

                var itemCount = transferOrder.getLineCount({
                    sublistId: 'item'
                });

                for (var i = 0; i < itemCount; i++) {
                    var item = transferOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    var quantity = transferOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    var itemUnits = transferOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units_display',
                        line: i
                    });

                    // Escape HTML for safety
                    item = escapeHtml(item);
                    itemUnits = escapeHtml(itemUnits);

                    // Format quantity to currency style
                    quantity = formatNumberToCurrency(quantity);

                    pdfContent += '<tr style="font-size: 12px;" border="0">';
                    pdfContent += '<td border-bottom="1" border-left="1" border-right="1" style="padding: 3px;">' + item + '</td>';
                    pdfContent += '<td align="right" border-bottom="1" border-right="1" style="padding: 3px;">' + quantity + '</td>';
                    pdfContent += '<td border-bottom="1" border-right="1" style="padding: 3px;">' + itemUnits + '</td>';
                    pdfContent += '</tr>';
                }

                pdfContent += '</tbody>';
                pdfContent += '</table>';

                // End PDF content
                pdfContent += '</body>';
                pdfContent += '</pdf>';

                // Create PDF file
                var pdfFile = render.xmlToPdf({
                    xmlString: pdfContent
                });

                // Set response to display PDF in browser
                context.response.writeFile(pdfFile, true);
            } catch (e) {
                log.error({
                    title: 'Error Generating PDF',
                    details: e
                });
                context.response.write('Error generating PDF: ' + e.message);
            }
        }
    }

    return {
        onRequest: onRequest
    };
});
