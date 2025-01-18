/*
 Only use alias for joined tables. Retain internal ID of the main table columns.
*/
select
    fr.custrecord_recipeitemcode as item,
    ROUND(fm.custrecord_fcs_pax) as custrecord_fcs_pax,
    fm.custrecord_fcs_price_head as custrecord_fcs_price_head,
    fm.custrecord_fcs_date
from 
    customrecord_food_menu_fb as fm
left join
    customrecord_food_recipes as fr
on 
	fr.id = fm.custrecord_fcs_menu
where
    paramcriteria