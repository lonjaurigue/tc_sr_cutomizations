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
            var workOrderId = context.request.parameters.workorderid;

            if (!workOrderId) {
                context.response.write('Work Order ID parameter is missing.');
                return;
            }

            try {
                // Load Work Order record
                var workOrder = record.load({
                    type: record.Type.WORK_ORDER,
                    id: workOrderId
                });

                // Get entity name from the Work Order
                var entityName = workOrder.getText({
                    fieldId: 'entity'
                });

                // Get subsidiary name
                var subsidiaryName = escapeHtml(workOrder.getText({
                    fieldId: 'subsidiary'
                }));

                // Get other fields from Work Order record
                var tranDate = workOrder.getValue({
                    fieldId: 'trandate'
                });
                var orderNumber = workOrder.getValue({
                    fieldId: 'tranid'
                });
                var assemblyName = workOrder.getText({
                    fieldId: 'assemblyitem'
                });
                var bomName = workOrder.getText({
                    fieldId: 'billofmaterials'
                });
                var bomRevision = workOrder.getText({
                    fieldId: 'billofmaterialsrevision'
                });
                var customerName = workOrder.getText({
                    fieldId: 'entity'
                });
                var quantityRequired = workOrder.getValue({
                    fieldId: 'quantity'
                });
                var units = workOrder.getText({
                    fieldId: 'units'
                });

                // Format dates
                var formattedTranDate = new Date(tranDate).toLocaleDateString('en-US');
                quantityRequired = formatNumberToCurrency(quantityRequired);

                // Generate PDF content
                var pdfContent = '<pdf>';
                pdfContent += '<head>';
                pdfContent += '<style>body { font-family: Arial, sans-serif; }</style>'; // Example: Adding CSS styles
                pdfContent += '</head>';
                pdfContent += '<body>';

                // Adding content
                //pdfContent += '<h1 align="right" style="font-size: 24px; font-family: Arial, sans-serif;">Bill Of Materials</h1>';
                pdfContent += '<table style="width: 100%; margin-top: 20px; padding: 1px;">';

                pdfContent += '<tr style="font-size: 18px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Bill Of Materials</strong></td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 18px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong></strong></td>';
                pdfContent += '</tr>';

                // Subsidiary name
                pdfContent += '<tr>';
                pdfContent += '<td align="center" style="padding: 5px; text-align: center; vertical-align: middle; font-size: 18px; font-family: Arial, sans-serif;" rowspan="10">' + subsidiaryName + '</td>';

                // Second column
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td style="font-size: 12px;"><strong>Date</strong></td>';
                pdfContent += '<td style="font-size: 12px;">' + formattedTranDate + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Order #</strong></td>';
                pdfContent += '<td>' + orderNumber + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Assembly</strong></td>';
                pdfContent += '<td>' + assemblyName + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Bill of Materials</strong></td>';
                pdfContent += '<td>' + bomName + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Bill of Revision</strong></td>';
                pdfContent += '<td>' + bomRevision + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Customer</strong></td>';
                pdfContent += '<td>' + customerName + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Qty. Required</strong></td>';
                pdfContent += '<td>' + quantityRequired + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Units</strong></td>';
                pdfContent += '<td>' + units + '</td>';
                pdfContent += '</tr>';

                pdfContent += '</table>';

                // Item Sublist table
                pdfContent += '<table style="width: 100%; margin-top: 20px; border-collapse: collapse;">';
                pdfContent += '<thead>';
                pdfContent += '<tr style="background-color: black; color: white; border: 1px solid black; font-size: 12px;">';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Item</th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Qty Required</th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Units</th>';
                // pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Inventory Detail</th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;">Description</th>';
                pdfContent += '</tr>';
                pdfContent += '</thead>';
                pdfContent += '<tbody>';

                var itemCount = workOrder.getLineCount({
                    sublistId: 'item'
                });

                for (var i = 0; i < itemCount; i++) {
                    var item = workOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    var quantity = workOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    var itemUnits = workOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: i
                    });
                    var inventoryDetail = workOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });
                    var description = workOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: i
                    });

                    // Escape HTML for safety
                    item = escapeHtml(item);
                    itemUnits = escapeHtml(itemUnits);
                    inventoryDetail = escapeHtml(inventoryDetail);
                    description = escapeHtml(description);

                     // Format quantity to currency style
                    quantity = formatNumberToCurrency(quantity);

                    pdfContent += '<tr style="font-size: 12px;" border="0">';
                    pdfContent += '<td border-bottom="1" border-left="1" border-right="1" style="padding: 3px;">' + item + '</td>';
                    pdfContent += '<td border-bottom="1" border-right="1" align="right" style="padding: 3px;">' + quantity + '</td>';
                    pdfContent += '<td border-bottom="1" border-right="1" align="left" style="padding: 3px;">' + itemUnits + '</td>';
                    //pdfContent += '<td border-bottom="1" border-right="1" style="padding: 3px;">' + inventoryDetail + '</td>';
                    pdfContent += '<td border-bottom="1" border-right="1" style="padding: 3px;">' + description + '</td>';
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
