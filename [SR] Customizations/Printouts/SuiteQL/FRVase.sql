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