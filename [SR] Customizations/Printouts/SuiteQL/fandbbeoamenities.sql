select
    a.id,
     BUILTIN.DF(a.custrecord_amenities_name) as item,
    a.custrecord_amenity_qty as quantity,
    a.custrecord_amenity_cost as amount,
from
    customrecord_amenities a
left join
	item
on a.custrecord_amenities_name = item.id
where
	a.custrecord_amenities_transaction = paramid