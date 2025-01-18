select
    fm.id as id,
    builtin.DF(fm.custrecord_hz_fm_master_category) as master_category,
    builtin.DF(custrecord_hz_fm_masterlevel) as master_level,
    builtin.DF(fr.custrecord_recipeitemcode) as item_code,
    fr.custrecord_recipedescription as item,
    builtin.DF(fm.custrecord_hz_food_menu_set) as options
from 
    customrecord_food_menu_fb as fm
left join
    customrecord_food_recipes as fr
on 
	fr.id = fm.custrecord_fcs_menu
where
    fm.custrecord_transaction_fb_food = paramid