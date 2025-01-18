select
  builtin.DF(fd.custrecord_flowercode) as name,
 'Design' as classification
from 
    CUSTOMRECORD_FLOWER_DESIGN as fd
where
    fd.custrecord_flowerdesign_transaction = paramid

UNION
select
builtin.DF(fdB.custrecord_vase_code_description) as name,
'Vase' as classification
from CUSTOMRECORD_FLOWER_RECIPE_INGREDIENTS as fdB
where fdb.custrecord_transactionparent = paramid

UNION
select
builtin.DF(item.displayName) as name,
'Flower' as classification
from CUSTOMRECORD_TC_FR_INGREDIENTS_FLOWERS as fdC
JOIN
item as item
ON fdC.custrecord_flower_code_ingredients = item.id
where fdC.custrecord_flowerrecipeingredients_trans = paramid

ORDER BY classification