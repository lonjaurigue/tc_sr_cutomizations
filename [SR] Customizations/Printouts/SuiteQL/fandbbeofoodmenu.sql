select
    fm.id as id,
    fr.custrecord_recipedescription as item,
    ROUND(fm.custrecord_fcs_pax)  as quantity,
    fm.custrecord_fcs_price_head as amount,
    builtin.DF(fm.custrecord_hz_fm_master_category) as master_category
from 
    customrecord_food_menu_fb as fm
left join
    customrecord_food_recipes as fr
on 
	fr.id = fm.custrecord_fcs_menu
where
    fm.custrecord_transaction_fb_food = paramid