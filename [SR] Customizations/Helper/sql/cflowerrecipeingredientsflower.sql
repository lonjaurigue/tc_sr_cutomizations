/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	fr.id,
	fr.custrecord_flower_code_ingredients,
	fr.custrecord_fr_qty_per_vase,
	fr.custrecord_fr_flowers_unit_cost,
	case when item.custitem_tc_perishableitem = 'T' then 'T' else 'F' end as is_perishable,
	case when item.custitem_common_item = 'T' then 'T' else 'F' end as is_common,
	case when item.custitem_hz_buy_at_par = 'T' then 'T' else 'F' end as is_buy_at_par,
	case 
		when fr.custrecord_fr_flowers_unit_cost >= 0 then fr.custrecord_fr_flowers_unit_cost
        when item.lastpurchaseprice >=0 then item.lastpurchaseprice
        else 0
	end as custom_unit_cost,
from 
	customrecord_tc_fr_ingredients_flowers as fr
left join
	item
on
	item.id = fr.custrecord_flower_code_ingredients
where
	paramcriteria