define(
    [
        'N/record',
        'N/error',
        'N/runtime',
        'N/redirect',
        './hcs_lib_mapping',
        './hcs_lib_mapper',
        './hcs_lib_validator',
        '../../Helper/helper'
    ]
,
(record, error, runtime, redirect, mapping, mapper, validator, helper) => {

    const create = (options) => {

        log.debug('create options', options)

        const objCostingSheet = helper.getCostingSheet({
            id: options.costingSheet,
            sublists: ['recmachcustrecord_related_topsheet']
        })
        objCostingSheet.body.current_user = runtime.getCurrentUser().id
        log.debug('objCostingSheet', objCostingSheet)

        // const bodyErrorMapping = {
        //     customer: 'Customer',
        //     custrecord_tc_costingsheet_location: 'Location',
        //     custrecord_event_date: 'Event Date',
        //     custrecord_gl_dept: 'Department',
        //     custrecord_charge_to: 'Charge To',
        //     custrecord_cs_subsidiary: 'Subsidiary'
        //   };
        
        // double check error.create to have consistent error page
        validator.checkPropertiesWithEmptyValue({
            throwError: true,
            data: objCostingSheet.body,
            mapping: {
                customer: 'Customer',
                custrecord_event_date: 'Event Date',
                custrecord_cs_subsidiary: 'Subsidiary',
                custrecord_gl_dept: 'Department',
                custrecord_tc_costingsheet_location: 'Location',
                custrecord_charge_to: 'Charge To'
            }
        });

        //validation for sublist
        if (objCostingSheet.sublists.recmachcustrecord_related_topsheet == 0){
            throw new Error('There is no item to be added to the Sales order');
        };
        
        //group by date SO
        const subItemGroup = objCostingSheet.sublists.recmachcustrecord_related_topsheet;
        log.debug("subItemGroup", subItemGroup);

        const groupedItems = subItemGroup.reduce((result, item) => {
            const date = item.custrecord_fcs_date;
            if (result[date]){
                result[date].push(item);
            } else {
                result[date] = [item];
            }
            return result;
        }, {});

        log.debug("groupedItems", groupedItems);
        
        const csBodyData = objCostingSheet.body;
        log.debug("csBodyData", csBodyData);
        const newSoData = Object.entries(groupedItems).map(([date, items]) => ({
            body: {
              ...csBodyData,
              custrecord_event_date: date,
            },
            sublists: {
              recmachcustrecord_related_topsheet: items
            }
          }));
          
          log.debug('newSoData', newSoData);

        newSoData.forEach((dataObj) => {
            let recSalesOrder = record.create({
                type: 'salesorder',
                isDynamic: true
            })
          log.debug('recsalesorder', recSalesOrder)

          log.debug('mapping', mapping.SALES_ORDER)
          log.debug('recordSO', dataObj)
            //custrecord_fcs_date
            const output = mapper.jsonMapToRecord({
              data: dataObj,
              mapping: mapping.SALES_ORDER,
              record: recSalesOrder
              
            });
            log.error('output', output.record)
          log.audit('output', output.record)
            const recSOId = output.record.save()
            log.debug('recSOId', recSOId);
          });


        redirect.toRecord({
            type: 'customrecord_costing_sheet',
            id: options.costingSheet
     });



    }

    return {
        create
    }

})