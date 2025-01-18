/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select
    cs.id,
    builtin.DF(cs.id) as name,
    'Costing Sheet' as custom_record_name,
    cs.created,
    location.custrecord_canteen_customer as customer,
    cs.custrecord_gl_dept,
    cs.custrecord_charge_to,
    cs.custrecord_tc_costingsheet_location,
    cs.custrecord_cs_subsidiary,
    builtin.DF(cs.custrecord_cs_subsidiary) as custrecord_cs_subsidiary_text,
    cs.custrecord_event_date,
    cs.custrecord_eventname,
from 
    customrecord_costing_sheet cs
left join
	location
on
	cs.custrecord_tc_costingsheet_location = location.id
where 
    paramcriteria