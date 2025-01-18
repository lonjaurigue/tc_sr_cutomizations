define([
    'N/error',
    '../library/suiteql',
], 
(error, suiteql) => {


    const get = (options) => {
        const intId = options.id
        
        let output = {
            body: {},
            sublists: {}
        }

        let objOpportunity = suiteql.execute({
            sqlfile: '../sql/opportunity.sql',
            custparam: {
                paramcriteria: `
                    opp.type = 'Opprtnty' and
                    opp.id = ${intId}
                `
            }
        })

        if(objOpportunity.status == 'SUCCESS') {
            if(objOpportunity.data.length > 0) {
                output.body = objOpportunity.data[0]
            }
        }else {
            throw error.create({
                name: 'CUSTOM_ERROR_RECORD_NOT_FOUND',
                message: 'Opportunity record not found.'
            })
        }
        
        if(options.hasOwnProperty('sublists') && options.sublists) {

            options.sublists.forEach(sublist => {

                if(sublist == 'recmachcustrecord_foodmenu_opportunity') { 
                    output.sublists[sublist] =  suiteql.execute({
                        sqlfile: '../sql/foodmenu.sql',
                        custparam: {
                            paramcriteria: `
                                fm.isinactive = 'F' AND
                                fm.custrecord_foodmenu_opportunity = ${intId}
                            `
                        }
                    }).data
                }
    
            })
        }

        return output
    }

    return { get }

})