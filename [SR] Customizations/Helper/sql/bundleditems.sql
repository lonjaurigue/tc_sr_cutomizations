/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	bi.id,
	bi.custrecord_itemcode,
	bi.custrecord_quantity,
	bi.custrecord_unitcost,
	case when item.custitem_tc_perishableitem = 'T' then 'T' else 'F' end as is_perishable,
	case when item.custitem_common_item = 'T' then 'T' else 'F' end as is_common,
	case when item.custitem_hz_buy_at_par = 'T' then 'T' else 'F' end as is_buy_at_par,
	case 
		when bi.custrecord_unitcost >= 0 then bi.custrecord_unitcost
        when item.lastpurchaseprice >=0 then item.lastpurchaseprice
        else 0
	end as custom_unit_cost,
from 
	customrecord_bundleditems bi
left join
	item
on
	bi.custrecord_itemcode = item.id
where
	paramcriteria
	