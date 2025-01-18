/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	mp.id,
	mp.custrecord_manpowerdetails_itemcode,
	ROUND(mp.custrecord_manpower_quantity) as custrecord_manpower_quantity,
	mp.custrecord_manpowerunitcost,
from 
    customrecord_manpowerdetails mp
where 
   paramcriteria