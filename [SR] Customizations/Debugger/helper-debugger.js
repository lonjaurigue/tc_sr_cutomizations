require(['SuiteScripts/[SR] Customizations/Helper/helper'], function(helper){

    let output = helper.getCostingSheet({
        id: 45,
        sublists: [
            'recmachcustrecord_related_topsheet',
            'recmachcustrecord_fcs_c', 
            'recmachcustrecord_fcs',
            'recmachcustrecord_fcs_amenities',
            'recmachcustrecord_costingsheet_equipment',
            'recmachcustrecord_linen_ingredients_cs_ref',
            'recmachcustrecord_costing_sheet_ref_rsrvd_items',
            'recmachcustrecord_hz_stylist_costing_sheet_ref'
        ]
    })

    log.debug('output', output)
})