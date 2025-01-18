/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/query',
    'N/search',
    'N/ui/message',
    '../Library/hcs_lib_mapping',
    '../App/relatedRecordsHandler'
],
(query, search, message, mapping, RelatedRecordsHandler) => {

    const beforeLoad = (scriptContext) => {
        const recNewRecord = scriptContext.newRecord;
        const strRecordType = recNewRecord.type;
        log.error('strRecordType', strRecordType);
        const objForm = scriptContext.form;
        const strSuiteLetConverter = '/app/site/hosting/scriptlet.nl?script=customscript_hcs_costingsheetconverte_sl&deploy=customdeploy_hcs_costingsheetconverte_sl'

        let strStatus = recNewRecord.getValue({
            fieldId: 'custrecord_status'
        })
        const intSubsidiary = recNewRecord.getValue({
            fieldId: 'custrecord_cs_subsidiary'
        })
        log.audit('fields', {
            status: strStatus,
            subsidiary: intSubsidiary
        })
        var res = query.runSuiteQL({
            query: `
            select * from transaction where custbody_related_costing_sheet = ${recNewRecord.id} AND recordtype = 'salesorder';
        `
        }).asMappedResults()

        var hasTransaction = res.length > 0 ? true : false


        var isIngSum = recNewRecord.getValue({
            fieldId: 'custrecord_ingdt_summary_generated'
        });
        var chargeTo = recNewRecord.getValue({
            fieldId: 'custrecord_charge_to'
        });

        if (scriptContext.type === scriptContext.UserEventType.EDIT || scriptContext.type === scriptContext.UserEventType.VIEW) {
            var soId = recNewRecord.getValue({
                fieldId: 'custrecord_transaction_fcs'
            });
            var soText = recNewRecord.getText({
                fieldId: 'custrecord_transaction_fcs'
            });
            var eventDate = recNewRecord.getText({
                fieldId: 'custrecord_event_date'
            });
            var strBanquetType = recNewRecord.getValue({
                fieldId: 'custrecord_trans_banquet_type'
            })
            log.debug('strBanquetType', strBanquetType);
            log.debug('soText', soText)
            log.debug('soId', soId)

            var soStrArr = soText.split(' ');
            var soFields;
            if ((soStrArr[0] == 'Sales' && soStrArr[1] == 'Order') || soStrArr[0] == 'Proposal') {
                if (soStrArr[0] == 'Sales') {
                    soFields = search.lookupFields({
                        type: search.Type.SALES_ORDER,
                        id: soId,
                        columns: ['custbody_beo_type', 'custbody_hz_total_number_of_pax']
                    });
                } else if (soStrArr[0] == 'Proposal') {
                    soFields = search.lookupFields({
                        type: search.Type.ESTIMATE,
                        id: soId,
                        columns: ['custbody_beo_type', 'custbody_hz_total_number_of_pax']
                    });
                }

                var beoType;
                var noPax = 0;
                log.debug('soFields.length', soFields.length)
                log.debug('soFields', soFields)
                log.debug('soFields.custbody_beo_type', soFields.custbody_beo_type)
                log.debug('soFields.custbody_hz_total_number_of_pax', soFields.custbody_hz_total_number_of_pax)
                if (soFields) {
                    if (soFields.custbody_beo_type.length > 0) {
                        beoType = soFields.custbody_beo_type[0].value;
                    }

                    if (soFields.custbody_hz_total_number_of_pax.length > 0) {
                        noPax = soFields.custbody_hz_total_number_of_pax;
                    }
                }

                var soShowBtn = false;

                if ((beoType == 1 && noPax > 50) || beoType == 2) {
                    soShowBtn = true;
                }
                log.debug('soStrArr[0]', soStrArr[0])
                log.debug('beoType', beoType)
                log.debug('noPax', noPax)
                log.debug('XXX soShowBtn', soShowBtn)

                var currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0); // Set time to midnight
                log.debug('currentDate', currentDate)
                // Set the target date (01/11/2024)
                var targetDate = new Date(eventDate);
                targetDate.setHours(0, 0, 0, 0); // Set time to midnight
                log.debug('targetDate', targetDate)
                // Calculate the difference in milliseconds
                var difference = targetDate.getTime() - currentDate.getTime();
                log.debug('difference', difference)
                // Convert the difference from milliseconds to days
                var differenceInDays = difference / (1000 * 3600 * 24);
                var eventDateShowBtn = false;
                var loc;

                if (differenceInDays <= 2 && noPax < 50) {
                    eventDateShowBtn = false;
                } else if (differenceInDays <= 2 && noPax > 50) {
                    loc = 3;
                    eventDateShowBtn = true;
                } else if (differenceInDays > 2 && noPax > 50) {
                    eventDateShowBtn = true;
                } else if (differenceInDays > 2 && noPax < 50) {
                    eventDateShowBtn = true;
                }
            }
        }

        log.debug('isIngSum', isIngSum)
        log.debug('chargeTo', chargeTo)
        log.debug('strStatus', strStatus);
        log.debug('eventDateShowBtn', eventDateShowBtn);
        log.debug('differenceInDays', differenceInDays);
        if (chargeTo != 4 && chargeTo != 26 && chargeTo){
            strStatus = recNewRecord.getValue({
                fieldId: 'custrecord_bqt_calendar_status'
            })
        }
        try {
            switch (strRecordType) {
                case 'customrecord_costing_sheet': {
                    log.error('IN CASE', 'customrecord_costing_sheet');
                    log.error('strStatus is', strStatus);
                    log.error('mapping.GLOBAL.status.approved is', mapping.GLOBAL.status.approved);
                    if (strStatus == mapping.GLOBAL.status.approved) {

                        if (isIngSum){
                            log.debug('showButton Triggered')
                            showButton(objForm, soStrArr[0], recNewRecord, intSubsidiary, strSuiteLetConverter, noPax, differenceInDays, beoType, strBanquetType)
                        }
                        
    
                        if (hasTransaction === false ) {
                            if (isIngSum && chargeTo == 4) {
                                objForm.addButton({
                                    id: 'custpage_btn_createso',
                                    label: 'Create SO',
                                    functionName: `
                                    window.open('${strSuiteLetConverter}&action=createSalesOrder&costingSheet=${recNewRecord.id}', '_self')
                                `
                                })
                            }
                        }
                    }

                    break
                }
                case 'opportunity': {
                    objForm.addButton({
                        id: 'custpage_btn_createopp',
                        label: 'Create Costing Sheet',
                        functionName: `
                        window.open('${strSuiteLetConverter}&action=createCostingSheetFromOpportunity&opportunity=${recNewRecord.id}', '_self')
                    `
                    })
                }


            }
        } catch (objError) {
            log.error('ue error catched', objError)
        }

    }


    // private
    // Event Costing Sheet = Create From SO
    // Food Tasting = Create From Proposal
    // beoType 1 = Regular
    const showButton = (objForm, soStrArr, recNewRecord, intSubsidiary, strSuiteLetConverter, noPax, differenceInDays, beoType, strBanquetType) => {
        if (soStrArr == 'Proposal'){
            if (differenceInDays < 3){
                displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
            } else {
                if (strBanquetType != "Banquet Type 2"){
                    displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                    displaySRButton(objForm, recNewRecord, strSuiteLetConverter)
                } else {
                    displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                } 
            }
            log.debug('Proposal differenceInDays', differenceInDays)
            log.debug('Proposal strBanquetType', strBanquetType)
        } else {
            log.debug('Transaction differenceInDays', differenceInDays)
            log.debug('Transaction strBanquetType', strBanquetType)
            log.debug('Transaction noPax', noPax)
            log.debug('Transaction beoType', beoType)
            if (differenceInDays < 3){
                if (noPax > 50){
                    if (strBanquetType != "Banquet Type 2"){
                        displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                        displaySRButton(objForm, recNewRecord, strSuiteLetConverter)
                    } else {
                        displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                    } 
                } else {
                    displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                }
            } else {
                if (noPax > 50){
                    if (strBanquetType != "Banquet Type 2"){
                        displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                        displaySRButton(objForm, recNewRecord, strSuiteLetConverter)
                    } else {
                        displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                    }  
                } else {
                    if (beoType != 1){ // Customized
                        if (strBanquetType != "Banquet Type 2"){
                            displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                            displaySRButton(objForm, recNewRecord, strSuiteLetConverter)
                        } else {
                            displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                        }
                    } else {
                        displayPRButton(objForm, recNewRecord, intSubsidiary, strSuiteLetConverter)
                    }
                }
            }
        } 
    }
    

    const displayPRButton = (objForm, recNewRecord, intSubsidiary, strSuiteLetConverter) => {
        let hasRequisition = getRequisition(recNewRecord);
        let sourceIngSummaryInProgress = isSourceIngredintSummaryMRInProgress(recNewRecord);
        let itemsAlreadyProcessed = areItemsAlreadyProcessed(recNewRecord);
        if(itemsAlreadyProcessed) showBannerAboutProcessedItem(objForm);
// TODO:
        log.audit('displayPRButton | hasRequisition', hasRequisition);
        log.audit('displayPRButton | sourceIngSummaryInProgress', sourceIngSummaryInProgress);
        log.audit('displayPRButton | itemsAlreadyProcessed', itemsAlreadyProcessed);
        if (!hasRequisition && !sourceIngSummaryInProgress && !itemsAlreadyProcessed){
            objForm.addButton({
                id: 'custpage_btn_createpr',
                label: 'Create PR',
                functionName: `
                window.open('${strSuiteLetConverter}&action=createPurchaseRequest&costingSheet=${recNewRecord.id}&subsidiary=${intSubsidiary}', '_self')
            `
            })
        }
    }

    const displaySRButton = (objForm, recNewRecord, strSuiteLetConverter) => {
        let hasTransferOrder = getTransferOrder(recNewRecord);
        let sourceIngSummaryInProgress = isSourceIngredintSummaryMRInProgress(recNewRecord);
        let itemsAlreadyProcessed = areItemsAlreadyProcessed(recNewRecord);
        if(itemsAlreadyProcessed) showBannerAboutProcessedItem(objForm);

        log.error('displaySRButton | hasTransferOrder', hasTransferOrder);
        log.error('displaySRButton | sourceIngSummaryInProgress', sourceIngSummaryInProgress);
        log.error('displaySRButton | itemsAlreadyProcessed', itemsAlreadyProcessed);

        if (!hasTransferOrder && !sourceIngSummaryInProgress && !itemsAlreadyProcessed){
            objForm.addButton({
                id: 'custpage_btn_createsr',
                label: 'Create SR',
                functionName: `
                    window.open('${strSuiteLetConverter}&action=createStockRequisition&costingSheet=${recNewRecord.id}', '_self')
                `
            });
        }
    }

    const showBannerAboutProcessedItem = (objForm) => {
        objForm.addPageInitMessage({
            type: message.Type.INFORMATION,
            title: 'Information',
            message: 'You cannot create PR/SR from this costing sheet as the items have already been purchased/received (i.e. existing PR, PO, RR transactions) and/or dispatched/received (i.e. existing SR, RR, Dispatch transactions) to the outlet. Please check the previous, related costing sheet(s) for these items.',
        });
    }

    const areItemsAlreadyProcessed = (recNewRecord) => {
        var relRecordsHandler = new RelatedRecordsHandler();
        return relRecordsHandler.areItemsAlreadyProcessed(recNewRecord)
    }

    const getRequisition = (recNewRecord) => {
        var requisitionRes = query.runSuiteQL({
            query: `Select id, recordtype from transaction where custbody_related_costing_sheet = ${recNewRecord.id} AND recordtype = 'purchaserequisition'`
            // query: `Select id, recordtype from transaction where custbody_tc_linked_purchase_request = ${recNewRecord.id} AND recordtype = 'purchaserequisition'`
        }).asMappedResults();
        var hasRequisition = requisitionRes.length > 0 ? true : false;
        log.debug('hasRequisition', hasRequisition)
        return hasRequisition;
    }

    const getTransferOrder = (recNewRecord) => {
        var transferOrderRes = query.runSuiteQL({
            query: `
            Select id, recordtype from transaction where custbody_related_costing_sheet = ${recNewRecord.id} AND recordtype IN ('transferorder', 'intercompanytransferorder')
        `
        }).asMappedResults();
        var hasTransferOrder = transferOrderRes.length > 0 ? true : false;
        log.debug('hasTransferOrder', hasTransferOrder)
        return hasTransferOrder;
    }

    const isSourceIngredintSummaryMRInProgress = (recNewRecord) => {
        const isInProgress = recNewRecord.getValue({
            fieldId: 'custrecord_cs_src_ing_mr_in_progress'
        });

        if(isInProgress == true || isInProgress == 'T'){
            return true;
        }else{
            return false;
        }
    }
    
    return {
        beforeLoad
    }

});