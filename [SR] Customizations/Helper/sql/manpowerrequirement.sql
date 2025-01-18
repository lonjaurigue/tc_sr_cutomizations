/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	mr.id,
	mr.custrecord_manpower_requirement_rank,
	mr.custrecord_manpower_requirement_qty,
	mr.custrecord_manpower_cost,
	case when item.custitem_tc_perishableitem = 'T' then 'T' else 'F' end as is_perishable,
	case when item.custitem_common_item = 'T' then 'T' else 'F' end as is_common,
	case when item.custitem_hz_buy_at_par = 'T' then 'T' else 'F' end as is_buy_at_par,
	case 
		when mr.custrecord_manpower_cost >=0 then mr.custrecord_manpower_cost
        when item.lastpurchaseprice >=0 then item.lastpurchaseprice
        else 0
	end as custom_unit_cost
from 
	customrecord_manpower_requirement_costin as mr
left join
	item
on
	mr.custrecord_manpower_requirement_rank = item.id
where
	paramcriteria