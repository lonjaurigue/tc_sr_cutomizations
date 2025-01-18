SELECT 
item.displayname as ingredient,
BUILTIN.DF(FRC.custrecord_fr_flower_unit_of_measure) as uomsize,
FRC.custrecord_fr_qty_per_vase as qty,
FRC.custrecord_fr_flowers_unit_cost as cost,
FRC.custrecord_floweringdts_amount as amount,
'Flower' as classification 
FROM customrecord_tc_fr_ingredients_flowers as FRC
JOIN item
ON item.id = FRC.custrecord_flower_code_ingredients
WHERE FRC.custrecord_fr_flowerrecipe_parent = paramid

UNION

SELECT
FAM.altname as ingredient,
BUILTIN.DF(FRB.custrecord_vase_equipment_size) as uomsize,
FRB.custrecord_vase_equipment_qty_recipe as qty,
FRB.custrecord_vase_equipment_cost_recipe as cost,
FRB. custrecord_vase_equipment_amount_recipe as amount,
'Vase' as classification
FROM customrecord_flower_recipe_ingredients as FRB
JOIN customrecord_ncfar_asset as FAM
ON FAM.id = FRB.custrecord_vase_code
WHERE FRB.custrecord_flower_recipe_parent = paramid

ORDER BY Classification