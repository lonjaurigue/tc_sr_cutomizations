/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select
    a.id,
    a.custrecord_amenities_name,
    a.custrecord_amenity_qty,
    a.custrecord_amenity_cost,
    case when item.custitem_tc_perishableitem = 'T' then 'T' else 'F' end as is_perishable,
    case when item.custitem_common_item = 'T' then 'T' else 'F' end as is_common,
    case when item.custitem_hz_buy_at_par = 'T' then 'T' else 'F' end as is_buy_at_par,
    case 
		when a.custrecord_amenity_cost >=0 then a.custrecord_amenity_cost
        when item.lastpurchaseprice >=0 then item.lastpurchaseprice
        else 0
	end as custom_unit_cost
from
    customrecord_amenities a
left join
	item
on a.custrecord_amenities_name = item.id
where
    paramcriteria