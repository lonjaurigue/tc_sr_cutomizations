/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log', 'N/format', 'N/render'], function(record, log, format, render) {

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

    function toFixed(value, decimals) {
        var num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toFixed(decimals);
    }

    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Retrieve parameters
            var recordId = context.request.parameters.recordId;

            // Check if recordId is provided
            if (!recordId) {
                context.response.write('Record ID is missing.');
                return;
            }

            try {
                // Load Item Receipt record
                var itemReceipt = record.load({
                    type: record.Type.ITEM_RECEIPT,
                    id: recordId
                });

                // Get values from the Item Receipt record
                var receiptDateRaw = itemReceipt.getValue({ fieldId: 'trandate' });
                var receiptDate = receiptDateRaw ? format.format({
                    value: receiptDateRaw,
                    type: format.Type.DATE
                }) : '';
              
                var memo = itemReceipt.getValue({ fieldId: 'memo' });
                var locationId = itemReceipt.getValue({ fieldId: 'location' });
                var transferOrderId = itemReceipt.getValue({ fieldId: 'createdfrom' });
                var drNumber = itemReceipt.getValue({ fieldId: 'tranid' });

                // Load Location record
                var locationRecord = record.load({
                    type: record.Type.LOCATION,
                    id: locationId
                });
                var locationName = locationRecord.getValue({ fieldId: 'name' });

                // Load Transfer Order record
                var transferOrder = record.load({
                    type: record.Type.TRANSFER_ORDER,
                    id: transferOrderId
                });
                var dueDateRaw = transferOrder.getValue({ fieldId: 'custbody_sr_date_required' });
                var dueDate = dueDateRaw ? format.format({
                    value: dueDateRaw,
                    type: format.Type.DATE
                }) : '';
              
                var tranNumber = transferOrder.getValue({ fieldId: 'tranid' });

                // Initialize totals
                var vatExempt = 0;
                var subtotal = 0;
                var vatAmount = 0;
                var ewtAmount = 0;
                var totalAmount = 0;

                // Generate PDF content
                var pdfContent = '<pdf>';
                pdfContent += '<head>';
                pdfContent += '</head>';
                pdfContent += '<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';

                // Add the header details
                pdfContent += '<table align="center" style="font-family: Arial, sans-serif;">';
                pdfContent += '<tr><td align="center" style="font-size: 13pt;"><strong>HIZON\'S RESTAURANT AND CATERING SERVICES, INC. - COMMISSARY</strong></td></tr>';
                pdfContent += '<tr><td align="center">Lot 94 Area South, FTI Complex, Western Bicutan, Taguig City</td></tr>';
                pdfContent += '<tr><td align="center">Tel No. : 09770441908</td></tr>';
                pdfContent += '<tr><td align="center">TIN : 214-358-868-000</td></tr>';
                pdfContent += '<tr><td align="center" style="font-size: 11pt;"><strong>Receiving Report</strong></td></tr>';
                pdfContent += '</table>';

                // Add vendor and receipt details
                pdfContent += '<table class="details" style="width: 100%; top: 10px; font-size: 11px; font-family: Arial, sans-serif;">';
                pdfContent += '<tr>';
                pdfContent += '<td><strong>Date of R.R</strong></td><td>' + escapeHtml(receiptDate) + '</td></tr>';

                pdfContent += '<tr>';
                pdfContent += '<td><strong>Address</strong></td><td>' + escapeHtml(locationName) + '</td>';
                pdfContent += '</tr>';

                pdfContent += '<tr>';
                pdfContent += '<td><strong>SR No.</strong></td><td>' + escapeHtml(tranNumber) + '</td>';
                pdfContent += '<td></td></tr>';

                pdfContent += '<tr>';
                pdfContent += '<td><strong>Contact Person</strong></td><td></td>';
                pdfContent += '<td><strong>D.R No.</strong></td><td>' + escapeHtml(drNumber) + '</td>';
                pdfContent += '<td><strong>Due Date</strong></td><td>' + escapeHtml(dueDate) + '</td></tr>';

                pdfContent += '<tr>';
                pdfContent += '<td><strong>Remarks</strong></td><td>' + escapeHtml(memo) + '</td>';
                pdfContent += '<td><strong>Inv. No</strong></td><td></td>';
                pdfContent += '<td><strong>Inv. Date</strong></td></tr>';
                pdfContent += '</table>';

                // Add item details
                var numLines = itemReceipt.getLineCount({ sublistId: 'item' });
                if (numLines > 0) {
                    pdfContent += '<table border="1" style="top: 30px; width: 100%; font-size: 11px; font-family: Arial, sans-serif; font-szie: 10px;">';
                    pdfContent += '<thead>';
                    pdfContent += '<tr border-bottom="1">';
                    pdfContent += '<th border-right="1" align="center" style="padding-top: 5px; font-szie: 10px;"><strong>Quantity</strong></th>';
                    pdfContent += '<th border-right="1" align="center" style="padding-top: 5px; font-szie: 10px;"><strong>U/M</strong></th>';
                    pdfContent += '<th border-right="1" align="center" style="padding-top: 5px; font-szie: 10px;"><strong>Description of Goods</strong></th>';
                    pdfContent += '<th border-right="1" align="center" style="padding-top: 5px; font-szie: 10px;"><strong>U.P net of VAT</strong></th>';
                    pdfContent += '<th border-right="0" align="center" style="padding-top: 5px; font-szie: 11px;"><strong>Amount</strong></th>';
                    pdfContent += '</tr>';
                    pdfContent += '</thead>';
                    pdfContent += '<tbody>';

                    for (var i = 0; i < numLines; i++) {
                        var quantity = itemReceipt.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        });

                        var units = itemReceipt.getSublistText({
                            sublistId: 'item',
                            fieldId: 'unitsdisplay',
                            line: i
                        });

                        var description = itemReceipt.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'displayname',
                            line: i
                        });

                        var rate = itemReceipt.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_rr_item_rate',
                            line: i
                        });

                        var amount = itemReceipt.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_rr_total_cost',
                            line: i
                        });

                        // Custom function to format the quantity to #,###.00
                            function formatNumberToCurrency(amount) {
                                var num = parseFloat(amount);
                                if (isNaN(amount)) return '0';

                                // Round to two decimal places
                                var formattedNumber = num.toFixed(2);

                                // Add commas as thousand separators
                                var parts = formattedNumber.split('.');
                                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                return parts.join('.');
                            }


                        // Format the amount using your custom function
                        var formattedAmount = formatNumberToCurrency(amount);

                        // Check if values are defined and use default values if not
                        quantity = quantity || 0;
                        units = units || '';
                        description = description || '';
                        rate = rate || 0;
                        amount = amount || 0;

                        subtotal += parseFloat(amount);
                        ewtAmount += parseFloat(amount) * 0.00; // assuming 1% EWT
                        totalAmount += parseFloat(amount);
                        
                        // Check if the item is VAT applicable
                                var isVatApplicable = itemReceipt.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'taxcode',
                                    line: i
                                });

                                if (isVatApplicable) {
                                    vatAmount += parseFloat(amount) * 0.12; // 12% VAT
                                } 

                        pdfContent += '<tr style="font-size: 11px;">';
                        pdfContent += '<td border-right="1" align="right" style="padding-top: 5px; font-size: 11px;">' + quantity + '</td>';
                        pdfContent += '<td border-right="1" align="left" style="padding-top: 5px; font-size: 11px;">' + escapeHtml(units) + '</td>';
                        pdfContent += '<td border-right="1" align="left" style="padding-top: 5px; font-size: 11px;">' + escapeHtml(description) + '</td>';
                        pdfContent += '<td border-right="1" align="right" style="padding-top: 5px; font-size: 11px;">' + toFixed(rate, 2) + '</td>';
                        pdfContent += '<td border-right="0" align="right" style="padding-top: 5px; font-size: 11px;">' + formattedAmount + '</td>';
                        pdfContent += '</tr>';
                    }

                    pdfContent += '</tbody>';
                    pdfContent += '</table>';
                } else {
                    pdfContent += '<p>No items found in the item receipt.</p>';
                }

                // Add totals table
                pdfContent += '<table style="width: 100%; top: 60px; font-family: Arial, sans-serif; font-size: 11px;">';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4" align="right" style="padding-top: 5px;"><strong>VAT Exempt</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td align="right" style="padding-top: 5px;">' + formatNumberToCurrency(vatExempt) + '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4" align="right" style="padding-top: 5px;"><strong>Vatable</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td align="right" style="padding-top: 5px;">' + formatNumberToCurrency(subtotal) + '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4" align="right" style="padding-top: 5px;"><strong>Value Added Tax (12%)</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td align="right" style="padding-top: 5px;" border-bottom="1">' + formatNumberToCurrency(vatAmount) + '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4" align="right" style="padding-top: 5px;"><strong>Total Amount</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td align="right" style="padding-top: 5px;"><strong>' + formatNumberToCurrency(totalAmount) + '</strong></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4" align="right" style="padding-top: 5px;"><strong>EWT Amount</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td align="right" style="padding-top: 5px;" border-bottom="1">' + formatNumberToCurrency(ewtAmount) + '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4" align="right" style="padding-top: 5px;"><strong>Net Amount</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td align="right" style="padding-top: 5px;"><strong>' + formatNumberToCurrency(totalAmount - ewtAmount) + '</strong></td>';
                pdfContent += '</tr>';
                pdfContent += '</table>';


                // Add footer
                pdfContent += '<table align="center" style="width: 100%; top: 100px; font-family: Arial, sans-serif; font-size: 11px;">';
                pdfContent += '<tr>';
                pdfContent += '<td align="center" style="width: 25%;">_______________________</td>';
                pdfContent += '<td align="center" style="width: 25%;">_______________________</td>';
                pdfContent += '<td align="center" style="width: 25%;">_______________________</td>';
                pdfContent += '<td align="center" style="width: 25%;">_______________________</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td align="center" style="width: 25%;">Prepared By</td>';
                pdfContent += '<td align="center" style="width: 25%;">Checked By</td>';
                pdfContent += '<td align="center" style="width: 25%;">Approved By</td>';
                pdfContent += '<td align="center" style="width: 25%;">Received By</td>';
                pdfContent += '</tr>';
                pdfContent += '</table>';

                pdfContent += '</body>';
                pdfContent += '</pdf>';

                // Create PDF file
                var pdfFile = render.xmlToPdf({
                    xmlString: pdfContent
                });

                // Set response
                context.response.writeFile(pdfFile, true);
            } catch (error) {
                log.error('Error generating PDF', error);
                context.response.write('An error occurred while generating the PDF: ' + error.message);
            }
        }
    }

    return {
        onRequest: onRequest
    };
});