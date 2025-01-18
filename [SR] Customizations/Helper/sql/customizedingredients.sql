/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select
    ci.id,
    ci.custrecord_ingdt_c,
    ROUND(ci.custrecord_qty_c) as custrecord_qty_c,
    -- ROUND(ci.custrecord_qty_c_purchase) as custrecord_qty_c_purchase,
    -- ROUND(ci.custrecord_qty_c_stock) as custrecord_qty_c_stock,
    CASE
        WHEN (
          	item.custitem_item_class = 5 -- FRUIT/VEGETABLES
          	OR item.custitem_item_class = 2 -- FISH/SEAFOODS
          	OR item.custitem_item_class = 14 -- MEAT AND POULTRY
        )
        THEN ci.custrecord_qty_c_purchase
        ELSE ROUND(ci.custrecord_qty_c_purchase)
    END AS custrecord_qty_c_purchase,
    CASE
        WHEN (
          	item.custitem_item_class = 5 -- FRUIT/VEGETABLES
          	OR item.custitem_item_class = 2 -- FISH/SEAFOODS
          	OR item.custitem_item_class = 14 -- MEAT AND POULTRY
        )
        THEN ci.custrecord_qty_c_stock
        ELSE ROUND(ci.custrecord_qty_c_stock)
    END AS custrecord_qty_c_stock,
    ci.custrecord_customunit,
    ci.custrecord_unit_cost_uom_stock,
    ci.custrecord_hz_ci_claimer,
    ci.custrecord_uom_c,
    ci.custrecord_uom_c_purchase,
    ci.custrecord_uom_c_stock,
    case when item.custitem_tc_perishableitem = 'T' then 'T' else 'F' end as is_perishable,
    case when item.custitem_common_item = 'T' then 'T' else 'F' end as is_common,
    case when item.custitem_hz_buy_at_par = 'T' then 'T' else 'F' end as is_buy_at_par,
    case 
        when ci.custrecord_customunit >= 0 then ci.custrecord_customunit
        when item.lastpurchaseprice >=0 then item.lastpurchaseprice
        else 0
    end as custom_unit_cost
from
    customrecord_custom_ingdt as ci
left join
    item
on ci.custrecord_ingdt_c = item.id
where
    paramcriteria