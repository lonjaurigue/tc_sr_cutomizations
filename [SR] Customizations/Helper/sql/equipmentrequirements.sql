/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select
    er.id,
    er.custrecord_equipment_code,
    er.custrecord_equipmentrequirementcostqty,
    er.custrecord_unitcost_
from
    customrecord_equipmentrequirementcosting as er
where 
    paramcriteria