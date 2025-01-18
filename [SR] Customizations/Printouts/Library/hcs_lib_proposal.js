define(['N/file', '../../Helper/library/suiteql', '../Third-Party/handlebars.js'], (file, suiteql, Handlebars) => {
    
    const generate = (options) => {
        let intproposalId = options.id;
        log.debug('options', intproposalId);
        Handlebars.registerHelper('getOptionName', function(setName) {
            return setName.replace('Set', 'Option');
        });

      Handlebars.registerHelper('getClassification', function(setName) {
            return setName.replace('Set', 'classification');
        });

        let strTemplate = file.load({
            id: '../Template/f-and-b-proposal.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../Css/f-and-b-proposal.css'
        })

        log.audit('srtCss url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())
        
        //sql for bodyfields
        let objProposal = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbproposal.sql',
            custparam: {
                paramid:intproposalId
            }
        }).data[0]

        //sql for sublists
        let objProposalItems = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbfoodmenuoptions.sql',
            custparam: {
                paramid:intproposalId
            }
        }).data

      //sql for sublists flower design A
        let objProposalFlowerDesign = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/fandbflowerdesign.sql',
            custparam: {
                paramid:intproposalId
            }
        }).data


        //combine bodyfields and sublists
        const objDataProposal = {
            bodyfields: objProposal,
            sublists: {}
          };
          
          for (let i = 0; i < objProposalItems.length; i++) {
            const item = objProposalItems[i];
            const sublistName = item.sublist;
            const options = item.options;
            
            if (!objDataProposal.sublists[sublistName]) {
              objDataProposal.sublists[sublistName] = {};
            }
            
            if (!objDataProposal.sublists[sublistName][options]) {
              objDataProposal.sublists[sublistName][options] = [];
            }
            
            objDataProposal.sublists[sublistName][options].push(item);
          }

        for (let i = 0; i < objProposalFlowerDesign.length; i++) {
            const item = objProposalFlowerDesign[i];
            const classification = item.classification;
            const sublistName = 'FlowerDesign'
            
            
            if (!objDataProposal.sublists[sublistName]) {
              objDataProposal.sublists[sublistName] = {};
            }
            
            if (!objDataProposal.sublists[sublistName][classification]) {
              objDataProposal.sublists[sublistName][classification] = [];
            }
            
            objDataProposal.sublists[sublistName][classification].push(item);
          }
          

        log.debug('objProposal', objProposal);
        log.debug('objProposalItems', objProposalItems);
      log.debug('Flower design A', objProposalFlowerDesign);
        log.debug('combine data', objDataProposal);

        //handlebars
        const xmlTemplate = Handlebars.compile(strTemplate);
        const populatedXml = xmlTemplate(objDataProposal);

        return {
            data: objDataProposal,
            template: populatedXml
        }
        
    }


    return {
        generate
    }
})