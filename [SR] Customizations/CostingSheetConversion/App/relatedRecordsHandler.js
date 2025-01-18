/**
 * @NApiVersion 2.1
 *
 */

define([
    'N/log',
    'N/record',
    'N/query'
    ], function(
    log,
    record,
    query
) {

    function RelatedRecordsHandler() {
        this.name = 'RelatedRecordsHandler';
    }

    RelatedRecordsHandler.prototype.areItemsAlreadyProcessed = function(recNewRecord){
        try{
            return _areItemsAlreadyProcessed(recNewRecord);
        }catch(e){
            log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | error', e);
            return false;
        }
    }

    function _areItemsAlreadyProcessed(recNewRecord){
        log.error('RelatedRecordsHandler', 'areItemsAlreadyProcessed');

        //return false; // temporary

        // get the originating SO
        const originatingSoId = recNewRecord.getValue({
            fieldId: 'custrecord_transaction_fcs'
        });
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | originatingSoId', originatingSoId);
        if(!originatingSoId) return false;

        const originatingSoRec = record.load({
            type: record.Type.SALES_ORDER,
            id: originatingSoId
        });

        // get all the preceeding SOs
        const logStr = originatingSoRec.getValue({
            fieldId: 'custbody_amendment_logs_hidden'
        });
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | logStr', logStr);
        if(!logStr) return false;

        const transactionObjects = getPreceedingSoObjects(logStr);
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | transactionObjects', JSON.stringify(transactionObjects));

        const salesOrderObjects = filterSalesOrderObjects(transactionObjects);
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | salesOrderObjects', JSON.stringify(salesOrderObjects));
        if(salesOrderObjects.length == 0) return false;

        // get all of their Costing Sheets
        var soIds = [];
        salesOrderObjects.forEach((soObj)=>{
            soIds.push(soObj.id);
        })
        const costingSheetIds = getCostingSheetIdsFromSalesOrderIds(soIds);
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | costingSheetIds', costingSheetIds);
        if(costingSheetIds.length == 0) return false;

        // get all their PR/SR
        const srPrObjects = getSrPrByCostingSheetIds(costingSheetIds);
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | srPrObjects', JSON.stringify(srPrObjects));
        if(srPrObjects.length == 0) return false;

        // get all their IF/IR
        var srPrIds = [];
        srPrObjects.forEach((obj)=>{
            srPrIds.push(obj.id);
        })
        const ifIrObjects = getiFiRByCostingSheetIds(srPrIds);
        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | ifIrObjects', JSON.stringify(ifIrObjects));
        
        var itemsAlreadyProcessed = false;
        if(ifIrObjects.length > 0) {
            itemsAlreadyProcessed = true;
        }

        log.error('RelatedRecordsHandler.areItemsAlreadyProcessed | itemsAlreadyProcessed', itemsAlreadyProcessed);

        return itemsAlreadyProcessed;
    }

    function getiFiRByCostingSheetIds(srPrIds){
        var statement = `
            Select 
                UNIQUE
                tran.id, 
                tran.recordtype 
            from 
                transaction tran,
                transactionline tl
            where 
                tl.transaction = tran.id 
                AND tl.createdfrom IN (${srPrIds})
                AND recordtype IN ('itemfulfillment', 'itemreceipt', 'purchaseorder')
        `;

        log.error('RelatedRecordsHandler.getiFiRByCostingSheetIds | statement', statement);

        var ifIrObjects = query.runSuiteQL({
                query: statement,
                params: []
            })
            .asMappedResults();


        return ifIrObjects;
    }

    function getSrPrByCostingSheetIds(costingSheetIds){
        var statement = `
            Select 
                id, 
                recordtype 
            from 
                transaction 
            where 
                custbody_related_costing_sheet IN (${costingSheetIds})
                AND recordtype IN ('transferorder', 'intercompanytransferorder', 'purchaserequisition')
        `;

        log.error('RelatedRecordsHandler.getSrPrByCostingSheetIds | statement', statement);

        var transactions = query.runSuiteQL({
                query: statement,
                params: []
            })
            .asMappedResults();

        return transactions;
    }

    function getCostingSheetIdsFromSalesOrderIds(salesOrderIds){
        var costingSheetIds = [];

        var statement = `
            Select 
                id as id
            from 
                customrecord_costing_sheet 
            where 
                custrecord_transaction_fcs IN (${salesOrderIds})
        `;

        log.error('RelatedRecordsHandler.getCostingSheetIdsFromSalesOrderIds | statement', statement);

        var results = query.runSuiteQL({
                query: statement,
                params: []
            })
            .asMappedResults();

        results.forEach((res)=>{
            costingSheetIds.push(res.id);
        })

        return costingSheetIds;
    }

    function filterSalesOrderObjects(transactionObjects){
        var salesOrderObjects = [];
        transactionObjects.forEach((transObj)=>{
            if(transObj.type.toLowerCase() == 'salesord'){
                salesOrderObjects.push(transObj);
            }
        });

        return salesOrderObjects;
    }

    function getPreceedingSoObjects(logStr){
        var logObjects = JSON.parse(logStr);

        var documentNumbers = [];
        logObjects.forEach((log)=>{
            documentNumbers.push(log.docNumber);
        });
        if(documentNumbers.length == 0) return [];

        var transactions = getTransactionsByDocumentNumbers(documentNumbers);
        return transactions;
    }

    function getTransactionsByDocumentNumbers(documentNumbers){
        // Data might be dirty. 
        // There can be multiple transactions with the same document number.
        var formattedDocNum = [];
        documentNumbers.forEach((docNum)=>{
            formattedDocNum.push("'"+docNum+"'");
        })

        var statement = `
            SELECT 
                MAX(trans.id) as id,
                trans.tranid as tranid,
                trans.type as type
            FROM 
                transaction trans 
            WHERE 
                trans.tranid IN (${formattedDocNum})
            GROUP BY 
                trans.tranid,
                trans.type
        `;

        log.error('RelatedRecordsHandler.getTransactionsByDocumentNumbers | statement', statement);

        var transactions = query.runSuiteQL({
                query: statement,
                params: []
            })
            .asMappedResults();

        return transactions;
    }


    return RelatedRecordsHandler;

});
