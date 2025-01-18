/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', 'N/error', 'N/log'], function(record, render, error, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var dispatchId = context.request.parameters.dispatch_id; // Assuming you pass the dispatch ID as a URL parameter

            if (!dispatchId) {
                // If dispatch ID is not provided, throw an error
                throw error.create({
                    name: 'INVALID_PARAM',
                    message: 'Dispatch ID parameter is missing.'
                });
            }

            try {
                // Load the sales order record
                var dispatchRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: dispatchId
                });

                // Generate PDF content
                var pdfContent = '<pdf><body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';

                // Add the company name
                pdfContent += '<h1 style="font-weight: bold; font-size: 16pt;">HIZON&apos;S CATERING AND RESTAURANT SERVICES INC.</h1>';
                
                pdfContent += '<table style="width: 100%; margin-top: 10px; font-size: 10pt;">' +
                    '<tr>' +
                    '<td style="padding-top: 2px; width: 195px;">Location</td>' +
                    '<td style="padding-top: 2px; width: 587px;">' + encodeXML(getVenueName(dispatchRecord)) + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-top: 2px; width: 195px;">Venue</td>' +
                    '<td style="padding-top: 2px; width: 587px;">' + encodeXML(getVenueRoomName(dispatchRecord)) + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-top: 2px; width: 195px;">Event Date</td>' +
                    '<td style="padding-top: 2px; width: 587px;">' + encodeXML(formatDate(dispatchRecord.getValue({ fieldId: 'custbody_eventdate' }))) + '</td>' + // Format event date
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-top: 2px; width: 195px;">Event Start Time</td>' +
                    '<td style="padding-top: 2px; width: 587px;">' + encodeXML(formatTime(dispatchRecord.getValue({ fieldId: 'custbody_hz_dispatch_time' }))) + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-top: 2px; width: 195px;">Event Name</td>' +
                    '<td style="padding-top: 2px; width: 587px;">' + encodeXML(dispatchRecord.getValue({ fieldId: 'custbody_event_name' })) + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding-top: 2px; width: 195px;">No. of Pax</td>' +
                    '<td style="padding-top: 2px; width: 587px;">' + dispatchRecord.getValue({ fieldId: 'custbody_hz_total_number_of_pax' }) + '</td>' +
                    '</tr>' +
                    '</table>';

                // Add the rest of the content
                pdfContent += '<table style="width: 100%; margin-top: 10px; font-size: 10pt;">' +
                    '<thead>' +
                    '<tr>' +
                    '<th align="center" colspan="5" style="padding: 10px 6px;">BANQUET DISPATCH FORM</th>' +
                    '</tr>' +
                    '<tr border-top="1">' +
                    '<th border-left="1" border-right="1" border-bottom="1" align="center" style="padding: 10px 6px;  background-color: #e3e3e3;">MENU</th>' +
                    '<th border-right="1" border-bottom="1" align="center" style="padding: 10px 6px;  background-color: #e3e3e3;">SERVICE STYLE</th>' +
                    '<th border-right="1" border-bottom="1" align="center" style="padding: 10px 6px;  background-color: #e3e3e3;">MENU CLASSIFICATION</th>' +
                    '<th border-right="1" border-bottom="1" align="center" style="padding: 10px 6px;  background-color: #e3e3e3;">NO. OF PAX</th>' +
                    '<th border-right="1" border-bottom="1" align="center" style="padding: 10px 6px;  background-color: #e3e3e3;">DISPATCH QTY</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';

                // Add regular items to the PDF body
                var items = [];
                var itemCount = dispatchRecord.getLineCount({
                    sublistId: 'recmachcustrecord_transaction_fb_food'
                });
                for (var i = 0; i < itemCount; i++) {
                    var itemName = dispatchRecord.getSublistText({
                        sublistId: 'recmachcustrecord_transaction_fb_food',
                        fieldId: 'custrecord_fcs_menu_display',
                        line: i
                    });
                    var itemDescription = dispatchRecord.getSublistText({
                        sublistId: 'recmachcustrecord_transaction_fb_food',
                        fieldId: 'custrecord_service_style_display',
                        line: i
                    });
                    var menuClassification = dispatchRecord.getSublistText({
                        sublistId: 'recmachcustrecord_transaction_fb_food',
                        fieldId: 'custrecord_menu_class_display',
                        line: i
                    });
                    var numberOfPax = dispatchRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_transaction_fb_food',
                        fieldId: 'custrecord_fcs_pax',
                        line: i
                    });
                    items.push({
                        name: itemName,
                        description: itemDescription,
                        menuClassification: menuClassification,
                        numberOfPax: numberOfPax
                    });
                }

                items.forEach(function(item) {
                    pdfContent += '<tr style="font-size: 10pt; top: 5px;">' +
                        '<td align="left">' + encodeXML(item.name) + '</td>' +
                        '<td align="center">' + encodeXML(item.description) + '</td>' +
                        '<td align="center">' + encodeXML(item.menuClassification) + '</td>' +
                        '<td align="center">' + encodeXML(item.numberOfPax) + '</td>' +
                        '<td align="center">________</td>' +
                        '</tr>';
                });

                pdfContent += '</tbody>' +
                    '</table>';

                // Add footer
                pdfContent += '<table style="width: 100%; font-size: 10pt; top:590px;"><tr>' +
                    '<td align="left" style="padding: 0px; width: 486px;">Prepared By:</td>' +
                    '<td align="left" style="padding: 0px; width: 320px;">Received by</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="padding: 0px; width: 486px;">_______________</td>' +
                    '<td style="padding: 0px; width: 320px;">_______________</td>' +
                    '</tr></table>';

                // Close PDF body and document
                pdfContent += '</body></pdf>';

                // Render PDF
                var pdfFile = render.xmlToPdf({
                    xmlString: pdfContent
                });

                // Serve PDF
                context.response.writeFile({
                    file: pdfFile,
                    isInline: true
                });
            } catch (e) {
                // Handle error
                log.error({
                    title: 'Error',
                    details: e
                });
                context.response.write('An error occurred. Please try again.');
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

    // Function to get venue name
    function getVenueName(dispatchRecord) {
        var venueId = dispatchRecord.getValue({ fieldId: 'custbody_venue' });
        var venueName = ''; // Initialize venueName variable

        // Load the custom record to get the venue name
        if (venueId) {
            var functionVenue = record.load({
                type: 'customrecord_venue',
                id: venueId
            });
            venueName = functionVenue.getValue({ fieldId: 'name' }); // Assuming 'name' is the field ID for the venue name
        } else {
            // If the venue room field is empty, get the venue name from the location field
            venueName = dispatchRecord.getText({ fieldId: 'location' });
        }

        return venueName;
    }
  
    // Function to get venue room name
    function getVenueRoomName(dispatchRecord) {
        var venueroomId = dispatchRecord.getValue({ fieldId: 'custbody_venueroom' });
        var venueRoomName = ''; // Initialize venueRoomName variable  

        // Load the custom record to get the venue name
        if (venueroomId) {
            var functionVenueRoom = record.load({
                type: 'customrecord_functionrooms',
                id: venueroomId
            });
            venueRoomName = functionVenueRoom.getValue({ fieldId: 'name' }); // Assuming 'name' is the field ID for the venue name
        } else {
            // If the venue room field is empty, get the venue name from the location field
            venueRoomName = dispatchRecord.getText({ fieldId: 'location' });
        }

        return venueRoomName;
    }

    // Function to encode special characters in XML
    function encodeXML(str) {
        if (typeof str !== 'string') {
            return str;
        }
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;');
    }

    return {
        onRequest: onRequest
    };
});
