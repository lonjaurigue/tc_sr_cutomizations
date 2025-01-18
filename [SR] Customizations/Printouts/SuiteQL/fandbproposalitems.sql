select 
	fci.id as id,
	fci.custrecord_flower_code_ingredients as item,
	fci.custrecord_fr_qty_per_vase as quantity,
	fci.custrecord_fr_flowers_unit_cost as amount,
    'FlowerDesign' as sublist,
from 
	customrecord_tc_fr_ingredients_flowers as fci
left join
	item
on
	item.id = fci.custrecord_flower_code_ingredients
where
	fci.custrecord_flowerrecipeingredients_trans = paramid

UNION ALL

select
    fm.id as id,
    fr.custrecord_recipeitemcode as item,
    ROUND(fm.custrecord_fcs_pax)  as quantity,
    fm.custrecord_fcs_price_head as amount,
    'FoodMenu' as sublist,
from 
    customrecord_food_menu_fb as fm
left join
    customrecord_food_recipes as fr
on 
	fr.id = fm.custrecord_fcs_menu
where
    fm.custrecord_transaction_fb_food = paramid
