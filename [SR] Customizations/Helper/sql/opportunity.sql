/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/

select
    opp.id,
    'Opportuntiy' as custom_record_name,
    opp.title,
    opp.projectedtotal,
    tl.subsidiary as subsidiary,
    opp.custbody_eventdate,
    opp.custbody_venue,
    tl.department as department,
    tl.class as class,
    tl.location as location,
from
	transaction as opp
left join transactionline tl
on
	opp.id = tl.transaction
where
    paramcriteria