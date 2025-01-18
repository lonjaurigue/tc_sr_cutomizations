define(['N/file', 'N/search', '../../Helper/library/suiteql', '../Third-Party/handlebars.js', 'N/record'], (file, search, suiteql, Handlebars, record) => {
    
    const generate = (options) => {
        let intSalesOrdelId = options.id;

        let strTemplate = file.load({
            id: '../Template/f-and-b-beo.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../Css/f-and-b-beo.css'
        })

        log.audit('srtCss url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())

        let objSalesOrder = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbbeo.sql',
            custparam: {
                paramid: intSalesOrdelId
            }
        }).data[0]

        const arrFoodMenu = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbbeofoodmenu.sql',
            custparam: {
                paramid: intSalesOrdelId
            }
        }).data

        const arrAmenities = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbbeoamenities.sql',
            custparam: {
                paramid: intSalesOrdelId
            }
        }).data

      //sql for sublists flower design
        let objProposalFlowerDesign = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbflowerdesign.sql',
            custparam: {
                paramid:intSalesOrdelId
            }
        }).data

        var fieldLookUp = search.lookupFields({
            type: search.Type.SALES_ORDER,
            id: intSalesOrdelId,
            columns: ['custbody_hz_dispatch_time']
        });

      //get billable items

      var soRec = record.load({
        type: record.Type.SALES_ORDER,
        id: intSalesOrdelId
      });
      
      var itemCount = soRec.getLineCount({
        sublistId: 'item'
      });

      var billableItems = [];
      
      for (var i=0; i<itemCount; i++) {
        var billItems = {};
        
        var itemDisplay = soRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'description',
          line: i
        })

        var itemQuantity = soRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'quantity',
          line: i
        })

        var itemAmount = soRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'amount',
          line: i
        })

        var itemRate = soRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'rate',
          line: i
        })

        billItems['itemDisplay'] = itemDisplay
        billItems['itemQuantity'] = itemQuantity
        billItems['itemAmount'] = itemAmount
        billItems['itemRate'] = itemRate

        billableItems.push(billItems);
      }        

        let objData = {
            bodyfields: objSalesOrder,
            sublists: {},
            lookUpfld: fieldLookUp
        }
        
        objData.sublists['Menu'] = arrFoodMenu.reduce((p, c) => (p[c.master_category] = [...p[c.master_category] || [], c], p), {});
        objData.sublists['Amenities'] = arrAmenities.reduce((p, c) => (p[c.item] = [...p[c.item] || [], c], p), {});
        objData.sublists['FlowerDesign'] = objProposalFlowerDesign.reduce((p, c) => (p[c.classification] = [...p[c.classification] || [], c], p), {});
        objData.sublists['BillableItems'] = billableItems;
      log.debug('objData', objData);
        

        const xmlTemplate = Handlebars.compile(strTemplate);
        const populatedXml = xmlTemplate(objData);
        return {
            data: objData,
            template: populatedXml
        }
    }


    return {
        generate
    }
})