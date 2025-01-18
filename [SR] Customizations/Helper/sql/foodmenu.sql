/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select
    fr.custrecord_recipeitemcode as item,
    ROUND(fm.custrecord_fcs_pax) as custrecord_fcs_pax,
    fm.custrecord_fcs_price_head as custrecord_fcs_price_head,
    fm.custrecord_fcs_date,
    fm.custrecord_option,
    builtin.DF(fm.custrecord_option) as custrecord_option_text,
    fm.custrecord_food_eventclassification,
    builtin.DF(fm.custrecord_food_eventclassification) as custrecord_food_eventclassification_text,
from 
    customrecord_food_menu_fb as fm
left join
    customrecord_food_recipes as fr
on 
	fr.id = fm.custrecord_fcs_menu
where
    paramcriteria