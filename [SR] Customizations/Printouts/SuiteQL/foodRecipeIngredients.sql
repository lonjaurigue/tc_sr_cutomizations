WITH 
foodrecipe AS
(SELECT 
  	frLines.custrecord_recipe_parent as recipe,
	item.displayName as itemCode,
	BUILTIN.DF(frLines.custrecord_unit_of_measure_ingredients) as unitsOfMeasure,
	frLines.custrecord_recipe_ingredients_quantity as quantity,
	frLines.custrecord_ingredients_unit_cost as cost,
	frLines.custrecord_ingredients_amount as amount,
	BUILTIN.DF(frLines.custrecord_ingdt_category) as category,
	frLines.custrecord_foodrecipe_subrecipe as subrecipe
FROM CUSTOMRECORD_FOOD_RECIPE_LINES as frLines
JOIN item as item
	ON frLines.custrecord_recipe_ingredients_itemcode = item.id
WHERE frLines.custrecord_recipe_parent = paramid),

subingredient AS (
	SELECT
	frLines.custrecord_recipe_parent as recipe,
	item.displayName as itemCode,
	BUILTIN.DF(frLines.custrecord_unit_of_measure_ingredients) as unitsOfMeasure,
	frLines.custrecord_recipe_ingredients_quantity as quantity,
	frLines.custrecord_ingredients_unit_cost as cost,
	frLines.custrecord_ingredients_amount as amount,
	BUILTIN.DF(frLines.custrecord_ingdt_category) as category,
	frLines.custrecord_foodrecipe_subrecipe as subrecipe
FROM CUSTOMRECORD_FOOD_RECIPE_LINES as frLines
JOIN item as item
	ON frLines.custrecord_recipe_ingredients_itemcode = item.id
WHERE frLines.custrecord_recipe_parent IN (SELECT subrecipe from foodrecipe))

SELECT * FROM (
SELECT recipe, itemcode, unitsOfMeasure, quantity, cost, amount, category, subrecipe  FROM foodrecipe UNION ALL
SELECT recipe, itemcode, unitsOfMeasure, quantity, cost, amount, category, subrecipe FROM subingredient
)
