define(['N/file', '../../Helper/library/suiteql', '../Third-Party/handlebars.js'], (file, suiteql, Handlebars) => {

    const generate = (options) => {
        let intproposalId = options.id;

        Handlebars.registerHelper('getOptionName', function(setName) {
            return setName.replace('Set', 'Food Menu');
        });

        let strTemplate = file.load({
            id: '../Template/proposal-contract.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../Css/proposal-contract.css'
        })
        log.audit('srtCss url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())

        //sql for bodyfields
        let objProposal = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/proposalcontract.sql',
            custparam: {
                paramid:intproposalId
            }
        }).data[0]

        const arrFoodMenu = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/proposalcontractfoodmenu.sql',
            custparam: {
                paramid: intproposalId
            }
        }).data

        let objData = {
            bodyfields: objProposal,
            sublists: {}
        }
        objData.sublists['FoodMenu'] = arrFoodMenu.reduce((p, c) => (p[c.options] = [...p[c.options] || [], c], p), {});

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