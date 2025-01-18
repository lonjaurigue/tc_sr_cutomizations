/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select 
	sve.id,
   	sve.custrecord_stylist_vase_equipment_code,
	sve.custrecord_stylist_vaseequip_qty_rcp,
	sve.custrecord_stylist_vasesequipment_total
from 
    customrecord_hz_stylist_vases_equipments sve
where 
    paramcriteria
