/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	ed.id,
	ed.custrecord_manpower_rank,
	ed.custrecord_totalcost_employeedetails
from 
	customrecord_employeedetails ed
where
	paramcriteria