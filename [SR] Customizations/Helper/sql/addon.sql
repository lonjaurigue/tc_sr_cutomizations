/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	ao.id,
	ao.custrecord_add_on,
	ao.custrecord_addon_qty,
	ao.custrecord_cost_addon,
	case when item.custitem_tc_perishableitem = 'T' then 'T' else 'F' end as is_perishable,
	case when item.custitem_common_item = 'T' then 'T' else 'F' end as is_common,
	case when item.custitem_hz_buy_at_par = 'T' then 'T' else 'F' end as is_buy_at_par,
	case 
		when ao.custrecord_cost_addon >= 0 then ao.custrecord_cost_addon
        when item.lastpurchaseprice >=0 then item.lastpurchaseprice
        else 0
	end as custom_unit_cost,
from 
	customrecord_add_ons_fb as ao
left join
	item
on
	item.id =  ao.custrecord_add_on
where
	paramcriteria
	