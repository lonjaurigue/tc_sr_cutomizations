select
    fm.id as id,
    fr.name as item,
    builtin.DF(fm.custrecord_option) as options,
    'FoodMenu' as sublist,
from 
    customrecord_food_menu_fb as fm
left join
    customrecord_food_recipes as fr
on 
	fr.id = fm.custrecord_fcs_menu
where
    fm.custrecord_transaction_fb_food = paramid