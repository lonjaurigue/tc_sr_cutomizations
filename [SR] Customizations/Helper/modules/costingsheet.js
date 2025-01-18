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
        
        let objCostingSheet = suiteql.execute({
            sqlfile: '../sql/costingsheet.sql',
            custparam: {
                paramcriteria: `
                    cs.isinactive = 'F' AND
                    cs.id = ${intId}
                `
            }
        })

        if(objCostingSheet.status == 'SUCCESS') {
            if(objCostingSheet.data.length > 0) {
                output.body = objCostingSheet.data[0]
            }
        }else {
            throw error.create({
                name: 'CUSTOM_ERROR_RECORD_NOT_FOUND',
                message: 'Costing Sheet Record not found.'
            })
        }

        if(options.hasOwnProperty('sublists') && options.sublists) {

            const sublistToSql = [
                {
                    sublist: 'recmachcustrecord_related_topsheet',
                    sql: '../sql/foodmenu.sql',
                    criteria: `
                        fm.isinactive = 'F' AND
                        fm.custrecord_related_topsheet = ${intId}
                    `
                }, 
                {
                    sublist: 'recmachcustrecord_fcs_c',
                    sql: '../sql/customizedingredients.sql',
                    criteria: `
                        ci.isinactive = 'F' AND
                        ci.custrecord_fcs_c = ${intId}
                    `
                }, 
                {
                    sublist: 'recmachcustrecord_fcs',
                    sql: '../sql/manpower.sql',
                    criteria: `
                        ci.isinactive = 'F' AND
                        ci.custrecord_fcs_c = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_fcs_amenities',
                    sql: '../sql/amenities.sql',
                    criteria: `
                        a.isinactive = 'F' AND
                        a.custrecord_fcs_amenities = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_costingsheet_equipment',
                    sql: '../sql/equipmentrequirements.sql',
                    criteria: `
                        er.isinactive = 'F' AND
                        er.custrecord_costingsheet_equipment = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_linen_ingredients_cs_ref',
                    sql: '../sql/linenrecipe.sql',
                    criteria: `
                        lr.isinactive = 'F' AND
                        lr.custrecord_linen_ingredients_cs_ref = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_costing_sheet_ref_rsrvd_items',
                    sql: '../sql/reserveditems.sql',
                    criteria: `
                        ri.isinactive = 'F' AND
                        ri.custrecord_costing_sheet_ref_rsrvd_items = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_hz_stylist_costing_sheet_ref',
                    sql: '../sql/stylist.sql',
                    criteria: `
                        sve.isinactive = 'F' AND
                        sve.custrecord_hz_stylist_costing_sheet_ref = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_costing_sheet_ref',
                    sql: '../sql/employeedetailsmanpowercosting.sql',
                    criteria: `
                        ed.isinactive = 'F' and
                        ed.custrecord_costing_sheet_ref = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_bundled_item_cost_sheet',
                    sql: '../sql/bundleditems.sql',
                    criteria: `
                        bi.isinactive = 'F' and
                        bi.custrecord_bundled_item_cost_sheet = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_flower_recipe_ing_costs_sheet',
                    sql: '../sql/cflowerrecipeingredientsflower.sql',
                    criteria: `
                        fr.isinactive = 'F' and
                        fr.custrecord_flower_recipe_ing_costs_sheet = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_fcs_addon',
                    sql: '../sql/addon.sql',
                    criteria: `
                        ao.isinactive = 'F' and
                        ao.custrecord_fcs_addon = ${intId}
                    `
                },
                {
                    sublist: 'recmachcustrecord_costing_sheet',
                    sql: '../sql/manpowerrequirement.sql',
                    criteria: `
                        mr.isinactive = 'F' and
                        mr.custrecord_costing_sheet = ${intId}
                    `
                },
            ]

            options.sublists.forEach(sublist => {

                const objSublistToSql = sublistToSql.find(obj => obj.sublist == sublist)

                if(objSublistToSql != undefined) {
                    output.sublists[objSublistToSql.sublist] = suiteql.execute({
                        sqlfile: objSublistToSql.sql,
                        custparam: {
                            paramcriteria: objSublistToSql.criteria
                        }
                    }).data
                }
                

            })
        }

        return output
    }

    return { get }
})