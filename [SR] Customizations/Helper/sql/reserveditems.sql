/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	ri.id,
 	ri.custrecord_reserved_item_code,
	ri.custrecord_reserved_item_qty
from 
    customrecord_reserved_items ri
where 
    paramcriteria
