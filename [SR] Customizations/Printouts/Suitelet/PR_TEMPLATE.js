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
                context.response.write('Purchase Request ID parameter is missing.');
                return;
            }

            try {
                // Load Purchase Request record
                log.debug('Loading Purchase Requisition', recordId);
                var purchaseRequest = record.load({
                    type: record.Type.PURCHASE_REQUISITION,
                    id: recordId
                });

                // Get subsidiary name
                var subsidiaryName = escapeHtml(purchaseRequest.getText({
                    fieldId: 'subsidiary'
                }));

                // Get other fields from Purchase Request record
                var tranDate = purchaseRequest.getValue({
                    fieldId: 'trandate'
                });
                var orderNumber = purchaseRequest.getValue({
                    fieldId: 'tranid'
                });
                var total = purchaseRequest.getValue({
                    fieldId: 'estimatedtotal'
                });

                log.debug('Fields retrieved', { subsidiaryName: subsidiaryName, tranDate: tranDate, orderNumber: orderNumber, total: total });

                // Format dates
                var formattedTranDate = new Date(tranDate).toLocaleDateString('en-US');
                var formattedTotal = formatNumberToCurrency(total);

                // Generate PDF content
                var pdfContent = '<pdf>';
                pdfContent += '<head>';
                pdfContent += '<style>body { font-family: Arial, sans-serif; }</style>'; // Example: Adding CSS styles
                pdfContent += '</head>';
                pdfContent += '<body>';

                // Adding content
                pdfContent += '<table style="width: 100%; margin-top: 20px; padding: 1px;">';

                pdfContent += '<tr style="font-size: 18px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Requisition</strong></td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 18px;">';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';

                // Subsidiary name
                pdfContent += '<tr>';
                pdfContent += '<td align="center" style="padding: 5px; text-align: center; vertical-align: middle; font-size: 18px; font-family: Arial, sans-serif;" rowspan="10">Hizon’s Catering Services Inc.</td>';

                // Second column
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td style="font-size: 12px;"><strong>Date Needed</strong></td>';
                pdfContent += '<td style="font-size: 12px;">' + formattedTranDate + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr style="font-size: 12px;">';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td><strong>Requisition #</strong></td>';
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
                pdfContent += '<tr style="background-color: black; color: white; border: 1px solid black; font-size: 10px;">';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;"><strong>Item Code</strong></th>';
                pdfContent += '<th style="padding: 3px; vertical-align: middle;"><strong>Item<br/>Description</strong></th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;"><strong>Quantity</strong></th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;"><strong>Units</strong></th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;"><strong>Unit Cost</strong></th>';
                pdfContent += '<th align="center" style="padding: 3px; vertical-align: middle;"><strong>Total Cost</strong></th>';
                pdfContent += '</tr>';
                pdfContent += '</thead>';
                pdfContent += '<tbody>';

                var itemCount = purchaseRequest.getLineCount({
                    sublistId: 'item'
                });

                log.debug('Item Count', itemCount);

                for (var i = 0; i < itemCount; i++) {
                    var item = purchaseRequest.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    var quantity = purchaseRequest.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    var rate = purchaseRequest.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'estimatedrate',
                        line: i
                    });
                    var amount = purchaseRequest.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'estimatedamount',
                        line: i
                    });
                    var itemUnits = purchaseRequest.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: i
                    });
                    var inventoryDetail = purchaseRequest.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });
                    var description = purchaseRequest.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: i
                    });

                    log.debug('Item details', { item: item, quantity: quantity, itemUnits: itemUnits, itemUnits: amount, itemUnits: rate, inventoryDetail: inventoryDetail, description: description });

                    // Escape HTML for safety
                    item = escapeHtml(item);
                    itemUnits = escapeHtml(itemUnits);
                    inventoryDetail = escapeHtml(inventoryDetail);
                    description = escapeHtml(description);

                    // Format quantity to currency style
                    quantity = formatNumberToCurrency(quantity);
                    rate = formatNumberToCurrency(rate);
                    amount = formatNumberToCurrency(amount);

                    pdfContent += '<tr style="font-size: 11px;" border="0">';
                    pdfContent += '<td border-bottom="1" border-left="1" border-right="1" style="padding: 3px;">' + item + '</td>';
                    pdfContent += '<td border-bottom="1" border-right="1" align="left" style="padding: 3px;">' + description  + '</td>';
                    pdfContent += '<td align="right" border-bottom="1" border-right="1" style="padding: 3px;">' + quantity + '</td>';
                    pdfContent += '<td align="left" border-bottom="1" border-right="1" style="padding: 3px;">' + itemUnits + '</td>';
                    pdfContent += '<td align="right" border-bottom="1" border-right="1" style="padding: 3px;">' + rate + '</td>';
                    pdfContent += '<td align="right" border-bottom="1" border-right="1" style="padding: 3px;">' + amount + '</td>';
                    pdfContent += '</tr>';
                }

                // Add the Total row at the end
                pdfContent += '<tr>';
                pdfContent += '<td colspan="3"></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                
                pdfContent += '<tr style="font-size: 13px;">';
                pdfContent += '<td colspan="5" align="right" style="padding: 3px; font-weight: bold;">Total</td>';
                pdfContent += '<td align="right" style="padding: 3px; font-weight: bold;">' + formattedTotal + '</td>';
                pdfContent += '</tr>';

                pdfContent += '</tbody>';
                pdfContent += '</table>';
               
                // End PDF content
                pdfContent += '</body>';
                pdfContent += '</pdf>';

                log.debug('PDF Content', pdfContent);

                // Create PDF file
                var pdfFile = render.xmlToPdf({
                    xmlString: pdfContent
                });

                log.debug('PDF File created successfully');

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
