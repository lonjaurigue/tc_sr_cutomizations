/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', 'N/log', 'N/file'], function (record, render, log, file) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var salesOrderId = context.request.parameters.salesorder;

            try {
                if (!salesOrderId) {
                    throw new Error('Sales Order ID is missing.');
                }

                // Load the sales order record
                var salesOrder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId
                });

                // Get the entity ID from the sales order
                var entityId = salesOrder.getValue({ fieldId: 'entity' });

                // Get the contact details from the sales order
                var contactDetails = escapeXml(salesOrder.getValue({ fieldId: 'custbody_hz_contact_details' }));
                var outletManager = salesOrder.getValue({ fieldId: 'custbody_outlet_bqt_mgr' });

                // Get the venue room from the sales order
                var venueRoom = salesOrder.getValue({ fieldId: 'custbody_venueroom' });

                // Load the customer record to get the printoncheckas field
                var customerRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: entityId
                });

                // Get the printoncheckas field value from the customer record
                var printOnCheckAs = escapeXml(customerRecord.getValue({ fieldId: 'printoncheckas' }));
                var printOnCheckAs = escapeXml(customerRecord.getValue({ fieldId: 'companyname' }));

                // Use company name if printOnCheckAs is null or empty
                if (!printOnCheckAs) {
                    printOnCheckAs = companyName;
                }

                // Load the outlet Bqt Mgr employee record
                var employeeRecord = record.load({
                    type: record.Type.EMPLOYEE,
                    id: outletManager
                });

                // Get the outlet Bqt Mgr name
                var outletBqtMgrName = escapeXml(employeeRecord.getValue({ fieldId: 'entityid' })); // Change fieldId to 'entityid'

                // Get the image file
                var imageFileId = 10826; // Replace with the file ID of your image
                var imageFile = file.load({
                    id: imageFileId
                });

                // Construct PDF content
                var pdfContent = '<pdf>';
                pdfContent += '<head>';
                pdfContent += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 0px solid black; padding: 4px; text-align: left; } body { font-family: Arial, sans-serif; font-size: 9pt; }</style>';
                pdfContent += '</head>';
                pdfContent += '<body>';


                var fileId = 10826; // Replace with the file ID of your image file
                var baseUrl = 'https://8154337.app.netsuite.com'; // Replace with your NetSuite account's URL
                var fileUrl = baseUrl + '/core/media/media.nl?id=' + fileId;


                // Embed an image from the web with proper URL encoding
                pdfContent += '<table border="0">';
                var imgUrl = 'http://8154337-sb1.shop.netsuite.com/core/media/media.nl?id=17820&c=8154337_SB1&h=keLHGBN6DYXdw3r0G1OmUhod1sKSK93A9vU8LBrS_L1JtTkR';
                imgUrl = escapeXml(imgUrl);

                pdfContent += '<tr><td align="left"><img src="https://8154337.app.netsuite.com/core/media/media.nl?id=15902&amp;c=8154337&amp;h=P-FoZbKqxhbY1l0v9Yz09KLtqPr1DxkloVS0HKqpLu7FKALo&amp;fcts=20240520031337&amp;whence=" width="75" height="50" alt="Sample Image"/></td>';
                pdfContent += '<td align="right"><img src="' + imgUrl + '" width="75" height="50" alt="Sample Image"/></td></tr>';
                //pdfContent += '<td align="right"><img src="https://8154337.app.netsuite.com/core/media/media.nl?id=10826&amp;c=8154337&amp;h=zNbRp-L0eHsnyKiuL-NilCcyiofSbzFzdVXvc2eazrg0Grvb&amp;fcts=20230724225518&amp;whence=" width="75" height="65" alt="Sample Image"/></td></tr>';
                pdfContent += '</table>';
              
                // Title: BANQUET EVENT ORDER
                pdfContent += '<table border="0" style="top: -20px; width: 100%">';
                pdfContent += '<tr><td align="center" style="font-weight: bold; font-size: 16pt;">BANQUET EVENT ORDER</td></tr>';
                pdfContent += '</table>';

                // Date printed and Document No.
                pdfContent += '<table border="0" style="top: -10px; width: 100%">';
                pdfContent += '<tr><td>Date printed: ' + getCurrentDate() + '</td></tr>';
                pdfContent += '<tr><td>Document No.: ' + salesOrder.getValue({ fieldId: 'tranid' }) + '</td></tr>';
                pdfContent += '</table>';

                // Event Details
                pdfContent += '<table border="1" style="margin-top: 10px; width: 100%">';
                pdfContent += '<tr><td style="font-size: 10pt;"><strong>Event Details</strong></td></tr>';
                pdfContent += '<tr><td><strong>Client Name:</strong></td><td>' + (printOnCheckAs ? printOnCheckAs : getCompanyName(customerRecord)) + '</td>';
                pdfContent += '<td><strong>Event Name:</strong></td><td>' + escapeXml(salesOrder.getValue({ fieldId: 'custbody_event_name' })) + '</td></tr>';
                pdfContent += '<tr><td><strong>Final Contract Date:</strong></td><td>' + formatDate(salesOrder.getValue({ fieldId: 'trandate' })) + '</td>';
                pdfContent += '<td><strong>Contact Details:</strong></td><td>' + contactDetails + '</td></tr>';
                pdfContent += '<tr><td><strong>Event Date:</strong></td><td>' + formatDate(salesOrder.getValue({ fieldId: 'custbody_eventdate' })) + '</td>';
                pdfContent += '<td><strong>Event Start Time:</strong></td><td>' + formatTime(salesOrder.getValue({ fieldId: 'custbody_hz_dispatch_time' })) + '</td></tr>';
                pdfContent += '<tr><td><strong>Remarks:</strong></td><td>' + escapeXml(salesOrder.getValue({ fieldId: 'memo' })) + '</td>';
                pdfContent += '<td><strong>Food Setup Time:</strong></td><td>' + formatTime(salesOrder.getValue({ fieldId: 'custbody_timebookofthevenuefrom' })) + '</td></tr>';
                pdfContent += '<tr><td><strong>Venue:</strong></td><td>' + getVenueName(salesOrder) + '</td>';
                pdfContent += '<td><strong>Event Service Time:</strong></td><td>' + formatTime(salesOrder.getValue({ fieldId: 'custbody_timebookofthevenueto' })) + '</td></tr>';
                pdfContent += '<tr><td colspan="1"><strong>Total Number of Pax:</strong></td><td>' + salesOrder.getValue({ fieldId: 'custbody_hz_total_number_of_pax' }) + '</td>';
                pdfContent += '<td><strong>Event End Time:</strong></td><td>' + formatTime(salesOrder.getValue({ fieldId: 'custbody_hz_servicetime' })) + '</td></tr>';
                pdfContent += '</table>';

                // Cost Breakdown Details
                pdfContent += '<table border="1" style="margin-top: 10px; width: 100%">';
                pdfContent += '<tr><td style="font-size: 10pt;"><strong>Cost Breakdown:</strong></td>';
                pdfContent += '<td></td><td></td><td style="font-size: 10pt;" align="center">No. of Pax</td></tr>';
                
                // Get line count for Ta Add On
                var lineCountItems = salesOrder.getLineCount({ sublistId: 'item' });

                // Iterate through each line in the item sublist
                for (var i = 0; i < lineCountItems; i++) {

                    // Check if the item display does not start with "AM"
                    var itemDisplay = salesOrder.getSublistText({ sublistId: 'item', fieldId: 'item_display', line: i });
                    if (itemDisplay.indexOf("AM") === -1) {

                        // Retrieve the internal ID and type of the item
                        var itemId = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                        var itemType = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: i });

                        var itemName;

                        // Special condition: If item_display is "Service Charge Service Charge"
                        if (itemDisplay === "Service Charge Service Charge") {
                            itemName = "Service Charge";
                        } else if (itemType === "Markup") {
                            // For Markup items, retrieve the display name
                            var markupRecord = record.load({ type: record.Type.MARKUP_ITEM, id: itemId });
                            itemName = escapeXml(markupRecord.getValue({ fieldId: 'displayname' }) || ''); // Retrieve display name or default to empty
                        } else {
                            // For other item types, use the description field
                            itemName = escapeXml(salesOrder.getSublistText({ sublistId: 'item', fieldId: 'description', line: i }));
                        }
                
                        // Retrieve other details of the item
                        var itemRate = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'grossamt', line: i });
                        var formattedRate = Number(itemRate).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format with commas for thousands
                        var itemQuantity = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                
                        itemQuantity = (itemQuantity === null || itemQuantity === undefined || itemQuantity === '') ? '-' : itemQuantity;
                
                        // Process the item details as needed
                        pdfContent += '<tr><td>' + itemName + '</td><td align="right">' + formattedRate + '</td>';
                        pdfContent += '<td></td><td align="center">' + itemQuantity + '</td></tr>';
                    }
                }
                
                // Initialize total sum variable
                var totalAmenities = 0;

                // Get line count for Ta Add On
                var lineCountItems = salesOrder.getLineCount({ sublistId: 'item' });

                // Iterate through each line in the item sublist
                for (var i = 0; i < lineCountItems; i++) {
                   itemName = escapeXml(salesOrder.getSublistText({ sublistId: 'item', fieldId: 'item_display', line: i }));

                   // Check if the item name contains "AM"
                   if (itemName && itemName.indexOf("AM") !== -1) {
                       // Retrieve other details of the item
                       var itemRate = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i });
                       var formattedRate = Number(itemRate).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format with commas for thousands
                       var itemQuantity = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });

                     // Set quantity to 1 if it's 0
                        if (itemQuantity === 0) {
                            itemQuantity = 1;
                        }

                       // Calculate item total and add to total sum
                       var itemTotal = itemRate * itemQuantity;
                       totalAmenities += itemTotal;
                      }
                }
              
                // Add the total sum row to the PDF content
                pdfContent += '<tr><td><strong>Amenities:</strong></td><td></td></tr>';
               
                // Initialize total sum variable
                var totalAmenitities = 0;

                // Get line count for Ta Add On
                var lineCountItems = salesOrder.getLineCount({ sublistId: 'item' });

                // Iterate through each line in the item sublist
                for (var i = 0; i < lineCountItems; i++) {
                   var itemName = escapeXml(salesOrder.getSublistText({ sublistId: 'item', fieldId: 'item_display', line: i }));
                   var itemNameSubstring = itemName.substring(6);
                  
                   // Check if the item name contains "AM"
                   if (itemName && itemName.indexOf("AM") !== -1) {
                       // Retrieve other details of the item
                       var itemDescription = escapeXml(salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }));
                       var itemRate = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'grossamt', line: i });
                       var formattedRate = Number(itemRate).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format with commas for thousands
                       var itemQuantity = salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });

                     // Set quantity to 1 if it's 0
                        if (itemQuantity === 0) {
                            itemQuantity = 1;
                        }

                       // Calculate item total and add to total sum
                       var itemTotal = itemRate * itemQuantity;
                       totalAmenitities += itemTotal;

                       // Construct the row for the PDF content
                       pdfContent += '<tr><td style="margin-left: 20px;">' + itemDescription + '</td><td align="right">' + formattedRate + '</td><td></td><td align="center">' + itemQuantity + '</td></tr>';
                   }
               }
            
                pdfContent += '<tr><td><strong>Total:</strong></td><td align="right"><strong>' + salesOrder.getText({ fieldId: 'total'}) + '</strong></td></tr>';
                pdfContent += '</table>';

                // Set-Up Requirements
                pdfContent += '<table border="1" style="margin-top: 10px; width: 100%">';
                pdfContent += '<tr><td style="font-size: 10pt;"><strong>Set-Up Requirements</strong></td></tr>';
                var setupRequirements = escapeXml(salesOrder.getValue({ fieldId: 'custbody_hz_setup_requirements' }));
                setupRequirements = setupRequirements.replace(/\n/g, '<br/>');
                pdfContent += '<tr><td>'+ setupRequirements + '</td></tr>';
                pdfContent += '</table>';

                // Bar Requirements
                pdfContent += '<table border="1" style="margin-top: 10px; width: 100%">';
                pdfContent += '<tr><td style="font-size: 10pt;"><strong>Beverage Requirements</strong></td></tr>';
                var barRequirements = escapeXml(salesOrder.getValue({ fieldId: 'custbody_hz_barrequirements' }));
                barRequirements = barRequirements.replace(/\n/g, '<br/>');
                pdfContent += '<tr><td>'+ barRequirements + '</td></tr>';
                pdfContent += '</table>';

                // Food and Beverage Details
                pdfContent += '<table border="1" style="margin-top: 10px; width: 100%">';
                pdfContent += '<tr><td style="font-size: 10pt;"><strong>Food and Beverage Menu</strong></td></tr>';
                var lineCount = salesOrder.getLineCount({ sublistId: 'recmachcustrecord_transaction_fb_food' });
                for (var i = 0; i < lineCount; i++) {
                    var foodItem = salesOrder.getSublistText({
                        sublistId: 'recmachcustrecord_transaction_fb_food',
                        fieldId: 'custrecord_menu_desc_beo_printout_v2',
                        line: i
                    });
                    foodItem = foodItem.substring(0);

                    pdfContent += '<tr><td>' + escapeXml(foodItem) + '</td></tr>';
                }
                pdfContent += '</table>';

                // Page break before the table content
                pdfContent += '<p style="page-break-before: always;"></p>';

                // Title for Contract Terms and Conditions
                pdfContent += '<h2 align="center" style="text-align: center; text-decoration: underline;">CONTRACT TERMS AND CONDITIONS</h2>';
                pdfContent += '<table style="border-collapse: collapse; width: 111%; top: 10px;" border="0">';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The CLIENT shall pay the agreed contract price for the services rendered.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The CLIENT agrees that if this contract is cancelled at his/her instance or for any reasons whatsoever, any down payment shall be forfeited as penalty.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The CLIENT fully understands that the agreeable number of guests reserved in the contract is final, not subject to reduction. The CLIENT further agrees to pay for all guests in attendance but not less than the number of guaranteed number of guests as stated in this contract.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The CLIENT shall be responsible for the safety and security of all the guests and their personal property. SGS shall NOT be responsible for any damage or loss of any merchandise, equipment, clothing, cell phones, gifts, other valuables left in the venue prior to during or after the function. SGS is not liable for any damages to the venue caused by his/her guests, and SGS is likewise free from any and all liabilities resulting to any loss or damage or injury that may be suffered by any guests, third persons or property prior to, during and after function.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The CLIENT shall pay for the cost of broken, damaged or lost equipment, furniture, fixtures, glassware, utensils whether damaged by the guests or the CLIENT themselves based on the current market price.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The duration of the event shall be limited to 4 from the start of the time indicated in the contract.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The food shall be consumed at the agreed serving time in the contract to avoid spoilage. The CLIENT shall be liable for any spoilage of food due to delay in serving time upon CLIENT’s instruction.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'SGS further reserves the rights to substitute items that are unavailable in the open market or that exceed reasonable market costs. SGS will notify the CLIENT of any such changes if time allows.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'It shall be understood that everything is in order if the SGS does not receive any written complaint from the CLIENT within 48 hours from the end of the function.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'The performance of this agreement by is subject to acts of God such as typhoons, earthquakes, fires, floods, or other disasters, and acts of man such as war, government regulations, strikes, civil disorders, curtailment of transportation facilities, or other emergencies making it inadvisable, illegal or impossible to uphold previous contractual agreements. SGS shall have no responsibility or liability for failure to supply any service when prevented from doing so by the occurrence of strikes, accidents, extraordinary vehicular traffic or any cause beyond SGS\' control, or by orders of any governmental authority which may affect normal catering operations.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'SGS reserves the right to cancel a function if it has reason to believe that the exact nature of the event varies from the originally agreed upon, whether in writing or given verbally and/ or that the holding of such function may be against the law, public morals or public policy. In such case, the SGS shall have the right to forfeit any and all deposit or down payment already received as and by law of penalty and liquidated damages.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'This agreement including the banquet sales order page 1 constitute the entire agreement between the parties. No modifications or cancellation thereof shall be valid, nor if any force and effect unless in writing signed by the caterer. The customer acknowledges that (s) he has read and accepted all the terms of this Catering Services Agreement and has executed this Agreement on ______________ day of _____________, _____________at____________.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += 'If this is acceptable to you, please signify your conformity.';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="4">';
                pdfContent += '</td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td><strong><u>CONFORME</u></strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td colspan="2"><strong>' + (printOnCheckAs ? printOnCheckAs : getCompanyName(customerRecord)) + '</strong></td>';

                pdfContent += '<td colspan="2"><strong>Seven Golden Spoons Inc.</strong></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td>SGS</td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td>__________________</td>';
                pdfContent += '<td>__________________</td>';
                pdfContent += '<td>__________________</td>';
                pdfContent += '<td>__________________</td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td></td>';
                pdfContent += '<td>Date</td>';
                pdfContent += '<td><strong>'+ outletBqtMgrName +'</strong></td>';
                pdfContent += '<td>Date</td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '<tr>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '<td></td>';
                pdfContent += '</tr>';
                pdfContent += '</table>';



                // Embedding the image
                //var imageDataURI = 'data:image/png;base64,' + encodeBase64(imageFile.getContents());
                //pdfContent += '<img src="' + imageDataURI + '"></img>';

                pdfContent += '</body></pdf>';
              
                // Render PDF
                var pdfFile = render.xmlToPdf({
                    xmlString: pdfContent
                });

                // Serve PDF file and view inline
                context.response.writeFile({
                    file: pdfFile,
                    isInline: true
                });
            } catch (e) {
                log.error({
                    title: 'Error Generating PDF',
                    details: e
                });
                context.response.write(e.message || 'An error occurred. Please try again.');
            }
        }
    }

    // Function to get current date in the format MM/DD/YYYY
    function getCurrentDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; // January is 0!
        var yyyy = today.getFullYear();

        // Add leading zeros if needed
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }

        return mm + '/' + dd + '/' + yyyy;
    }

    // Function to format date to MM/DD/YYYY
    function formatDate(date) {
        var d = new Date(date);
        var dd = d.getDate();
        var mm = d.getMonth() + 1; // January is 0!
        var yyyy = d.getFullYear();

        // Add leading zeros if needed
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }

        return mm + '/' + dd + '/' + yyyy;
    }

    // Function to format time to AM/PM format
    function formatTime(dateTime) {
        var time = new Date(dateTime);
        var hours = time.getHours();
        var minutes = time.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight (0 hours)
        minutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero for single-digit minutes
        var formattedTime = hours + ':' + minutes + ' ' + ampm;
        return formattedTime;
    }

    // Function to encode data to Base64
    function encodeBase64(input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }

        return output;
    }

    // Function to get contact details
    function getContactDetails(salesOrder) {
        var clientName = salesOrder.getText({ fieldId: 'entity' });
        var contactDetails = ''; // Replace this with actual contact details retrieval
        return clientName + ' (' + contactDetails + ')';
    }

    // Function to get venue name
    function getVenueName(salesOrder) {
        var venueId = salesOrder.getValue({ fieldId: 'location' });
        var venueName = ''; // Replace this with actual venue name retrieval
        return venueName;
    }

    return {
        onRequest: onRequest
    };
  
    function getVenueName(salesOrder) {
    var venueId = salesOrder.getValue({ fieldId: 'custbody_venueroom' });
    var venueName = ''; // Initialize venueName variable

    // Load the custom record to get the venue name
    if (venueId) {
        var functionRoomRecord = record.load({
            type: 'customrecord_functionrooms',
            id: venueId
        });
        venueName = functionRoomRecord.getValue({ fieldId: 'name' }); // Assuming 'name' is the field ID for the venue name
    } else {
        // If the venue room field is empty, get the venue name from the location field
        venueName = salesOrder.getText({ fieldId: 'location' });
    }

    return venueName;
}
	// Function to escape XML characters
    function escapeXml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, function(c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    }
	 return {
        onRequest: onRequest
    };
});
