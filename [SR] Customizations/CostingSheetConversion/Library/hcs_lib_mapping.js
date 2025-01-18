/**
 * Field mapping for creating/updating record
 * key = Map To
 * value = Map From
 */

define([], function() {

    const SUB_GOLDEN_HEART_SOCIAL_ENTERPRICES_INC = 4
    const SUB_SEVEN_GOLDENSPOONS_INC = 6
    const SUB_HIZONS_F_AND_B_SOLUTIONS = 3
    const SUB_HIZONS_RESTAURANT_CATERING_SERVICES = 2

    const STATUS_PENDING_FULFILLMENT = 'B'
    const STATUS_APPROVED = 2

    const FORM_FB_REQUISITION = 239
    const FORM_FB_CANTEEN_SO_CS = 242
    const FORM_STANDARD_REQUISITION = 64

    const LOC_F_AND_B_COMMISSARY = 3
    const LOC_HIZONS_CATERING_STOCK_ROOM = 9

    const ACC_COST_OF_GOODS_SOLD_RAW_MATERIALS = 214
    const INCOTERM_DAP = 1
    const TAX_VAT_PH_SPH = 6
    const STOCKROOM_RM_ISSUANCE = 3
    
    let mapping = {

        GLOBAL: {
            subsidiary: {
                F_AND_B_SOLUTIONS: SUB_HIZONS_F_AND_B_SOLUTIONS,
                GOLDEN_HEART_SOCIAL_ENTERPRICES_INC: SUB_GOLDEN_HEART_SOCIAL_ENTERPRICES_INC,
                SEVEN_GOLDENSPOONS_INC: SUB_SEVEN_GOLDENSPOONS_INC,
                HIZONS_RESTAURANT_CATERING_SERVICES: SUB_HIZONS_RESTAURANT_CATERING_SERVICES
            },
            status: {
                approved: STATUS_APPROVED
            },
            form: {
                FB_REQUISITION: FORM_FB_REQUISITION,
                STANDARD_REQUISITION: FORM_STANDARD_REQUISITION
            },
            location: {
                HIZONS_CATERING_STOCK_ROOM: LOC_HIZONS_CATERING_STOCK_ROOM
            },
            account: {
                COST_OF_GOODS_SOLD_RAW_MATERIALS: ACC_COST_OF_GOODS_SOLD_RAW_MATERIALS
            }
        },
        
        SALES_ORDER: {
            body: {
                fields: {
                    "customform": { value: FORM_FB_CANTEEN_SO_CS, isDefault: true }, 
                    "entity": { value: 'customer'}, 
                    "department": { value: 'custrecord_gl_dept'},
                    "class": { value: 'custrecord_charge_to' },
                    "location": { value: "custrecord_tc_costingsheet_location"},
                    "orderstatus": { value: STATUS_PENDING_FULFILLMENT, isDefault: true },
                    "trandate": { value: 'custrecord_event_date', setType: 'date'},
                    "custbody_related_costing_sheet": {value: 'id'},
                }
            },
            sublists: {
                item: {
                    "recmachcustrecord_related_topsheet": {
                        source: 'Food Menu',
                        target: 'Items',
                        fields: {
                            "item": { value: "item" },
                            "quantity": { value: "custrecord_fcs_pax" },
                            "rate": { value: 'custrecord_fcs_price_head' },
                            "amount": { value: (data) => {
                                return Number(data.currentLine.custrecord_fcs_pax) * Number(data.currentLine.custrecord_fcs_price_head)
                            }},
                            "taxcode": { value: TAX_VAT_PH_SPH, isDefault: true },
                            "custcol_so_plannedqty": {value: "custrecord_fcs_pax"}
                        }
                    }
                }
                
            }
           
        },

        PURCHASE_REQUEST: {
            body: {
                fields: {
                    "customform": {value: 'custom_form' },
                    "entity": { value: 'custom_current_user' },
                    //"trandate": { value: 'created', setType: 'date' },
                    "trandate": { value: 'custrecord_event_date', setType: 'date'},
                    "subsidiary": { value: 'custrecord_cs_subsidiary' },
                    "class": { value: 'custrecord_charge_to' },
                    "location": { value: 'custrecord_tc_costingsheet_location'},
                    "department": { value: 'custrecord_gl_dept'},
                    "custbody_related_costing_sheet": {value: 'id'}
                }
            },
            sublists: {
                item: {
                    "recmachcustrecord_fcs_c": {
                        source: 'Ingredients Summary',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_ingdt_c' },
                            //"quantity": { value: 'custrecord_qty_c' },
                            "quantity": { value: 'custrecord_qty_c_purchase' },
                            "estimatedrate": { value: 'custom_unit_cost' },
                        }
                    },
                    "recmachcustrecord_costing_sheet": {
                        source: 'Manpower > Manpower Requirement',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_manpower_requirement_rank' },
                            "quantity": { value: 'custrecord_manpower_requirement_qty' },
                            "estimatedrate": { value: 'custom_unit_cost'},
                        }
                    },
                    "recmachcustrecord_fcs_amenities": {
                        source: 'Amenities',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_amenities_name' },
                            "quantity": { value: 'custrecord_amenity_qty' },
                            "estimatedrate": { value: 'custom_unit_cost'},
                        }
                    },
                    "recmachcustrecord_bundled_item_cost_sheet": {
                        source: 'Bundled Items',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_itemcode' },
                            "quantity": { value: 'custrecord_quantity' },
                            "estimatedrate": { value: 'custom_unit_cost'},
                        }
                    },
                    "recmachcustrecord_flower_recipe_ing_costs_sheet": {
                        source: 'Floral > C - Flower Recipe Ingredients - Flowers',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_flower_code_ingredients' },
                            "quantity": { value: 'custrecord_fr_qty_per_vase' },
                            "estimatedrate": { value: 'custom_unit_cost'},
                        }
                    },
                    "recmachcustrecord_fcs_addon": {
                        source: 'Add-ons',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_add_on' },
                            "quantity": { value: 'custrecord_addon_qty' },
                            "estimatedrate": { value: 'custom_unit_cost'},
                        }
                    },
                }
            }
        },

        TRANSFER_ORDER: {
            body: {
                fields: {
                    "subsidiary": { value: 'custrecord_cs_subsidiary' },
                    "orderstatus": { value: STATUS_PENDING_FULFILLMENT, isDefault: true },
                    "transferlocation": { value: 'custrecord_tc_costingsheet_location'},
                    "location": { value: LOC_F_AND_B_COMMISSARY, isDefault: true },
                    "employee": { value: 'current_user' },
                    "incoterm": { value: INCOTERM_DAP, isDefault: true },
                    "custbody_related_costing_sheet":  {value: 'id'},
                    "trandate": { value: 'custrecord_event_date', setType: 'date'}
                }
            },
            sublists: {
                item: {
                    "recmachcustrecord_fcs_c": {
                        source: 'Ingredients Summary',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_ingdt_c' },
                            //"quantity": { value: 'custrecord_qty_c' }
                            "quantity": { value: 'custrecord_qty_c_stock', default:1},
                            "units": { value: 'custrecord_uom_c_stock' },
                            //"rate": { value: 'custrecord_customunit' }
                            "rate": { value: 'custrecord_unit_cost_uom_stock' }
                        }
                    },
                    // "recmachcustrecord_costing_sheet": {
                    //     source: 'Manpower > Manpower Requirement',
                    //     target: 'Items',
                    //     fields: {
                    //         "item": { value: 'custrecord_manpower_requirement_rank' },
                    //         "quantity": { value: 'custrecord_manpower_requirement_qty' }
                    //     }
                    // },
                    // "recmachcustrecord_fcs_amenities": {
                    //     source: 'Amenities',
                    //     target: 'Items',
                    //     fields: {
                    //         "item": { value: 'custrecord_amenities_name' },
                    //         "quantity": { value: 'custrecord_amenity_qty' }
                    //     }
                    // }
                }
                
            }
        },

        TRANSFER_ORDER_INTERCOMPANY: {
            body: {
                fields: {
                    "tosubsidiary": { value: 'custrecord_cs_subsidiary' },
                    "subsidiary": { value: SUB_HIZONS_F_AND_B_SOLUTIONS, isDefault: true },
                    "transferlocation": { value: 'custrecord_tc_costingsheet_location'},
                    "location": { value: LOC_F_AND_B_COMMISSARY, isDefault: true },
                    "employee": { value: 'current_user' },
                    "incoterm": { value: INCOTERM_DAP, isDefault: true },
                    "custbody_related_costing_sheet":  {value: 'id'},
                    "trandate": { value: 'custrecord_event_date', setType: 'date'}
                }
            },
            sublists: {
                item: {
                    "recmachcustrecord_fcs_c": {
                        source: 'Ingredients Summary',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_ingdt_c' },
                            //"quantity": { value: 'custrecord_qty_c' }
                            "quantity": { value: 'custrecord_qty_c_stock', default:1 },
                            "units": { value: 'custrecord_uom_c_stock' },
                            "rate": { value: 'custrecord_unit_cost_uom_stock' }
                        }
                    },
                    "recmachcustrecord_costing_sheet": {
                        source: 'Manpower > Manpower Requirement',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_manpower_requirement_rank' },
                            "quantity": { value: 'custrecord_manpower_requirement_qty' }
                        }
                    },
                    "recmachcustrecord_fcs_amenities": {
                        source: 'Amenities',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_amenities_name' },
                            "quantity": { value: 'custrecord_amenity_qty' }
                        }
                    }
                }
                
            }
        },

        COSTING_SHEET_FROM_OPPORTUNTIY: {
            body: {
                fields: {
                    "name": { value: 'custom_event_name' },
                    "custrecord_budget": { value: 'projectedtotal' },
                    "custrecord_cs_subsidiary": { value: 'subsidiary' },
                    "custrecord_event_date": { value: 'custbody_eventdate', setType: 'date'},
                    "custrecord_costing_sheet_venue": { value: 'custbody_venue' },
                    "custrecord_event_start_time": { value: 'custom_event_start_time', setType: 'timeofday' },
                    "custrecord_event_end_time": { value: 'custom_event_end_time', setType: 'timeofday' },
                    "custrecord_gl_dept": { value: 'department' },
                    "custrecord_charge_to": { value: 'class' },
                    "custrecord_tc_costingsheet_location": { value: 'location' },
                    "custrecord_cs_opportunity": { value: 'id' }
                }
            },
            // sublists: {
            //     recmachcustrecord_related_topsheet: {
            //         "recmachcustrecord_foodmenu_opportunity": {
            //             source: 'Food Menu',
            //             target: 'Food Menu',
            //             fields: {
            //                 "custrecord_fcs_menu": { value: "item" },
            //                 "quantity": { value: "custrecord_fcs_pax" },
            //                 "amount": { value: 'custrecord_fcs_price_head' },
            //                 "taxcode": { value: TAX_VAT_PH_SPH, isDefault: true }
            //             }
            //         }
            //     }
            // }
        },

        INVENTORY_ADJUSTMENT_FROM_COSTING_SHEET: {
            body: {
                fields: {
                    "subsidiary": { value: 'custrecord_cs_subsidiary' },
                    "class": { value: 'custrecord_charge_to' },
                    "adjlocation": { value: 'custrecord_tc_costingsheet_location' },
                    "account": { value: ACC_COST_OF_GOODS_SOLD_RAW_MATERIALS, isDefault: true },
                    "customer": { value: 'customer'},
                    "department": { value: 'custrecord_gl_dept'},
                    "custbody_event_name": {value: 'custrecord_eventname'},
                    "custbody_atlas_inv_adj_reason": { value: STOCKROOM_RM_ISSUANCE, isDefault: true },
                    "custbody_related_costing_sheet": { value: 'id' },
                  "subsidiary": { value: 'custrecord_cs_subsidiary'}
                }
            },
            sublists: {
                inventory: {
                    "recmachcustrecord_fcs_c": {
                        source: 'Ingredients Summary',
                        target: 'Items',
                        fields: {
                            "item": { value: 'custrecord_ingdt_c' },
                            "location": { value: (data) => data.body.adjlocation },
                            //"adjustqtyby": { value: 'custrecord_qty_c' },
                            "adjustqtyby": { value: 'custrecord_qty_c_stock' },
                            "custcol_hz_claimer": { value: 'custrecord_hz_ci_claimer' },
                            //"units": { value: 'custrecord_uom_c'},
                            "units": { value: 'custrecord_uom_c_stock'}
                        }
                    }
                }
            }
        }

    }

    return mapping
})