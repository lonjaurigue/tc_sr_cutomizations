SELECT 
TO_CHAR(foodRecipes.created, 'MM-DD-YYYY')  as created,
BUILTIN.DF(foodRecipes.custrecord_recipeitemcode) as productCode,
foodRecipes.name as productName,
BUILTIN.DF(foodRecipes.custrecord_fnbmenuclass) as menuClassification,
foodRecipes.custrecord_foodrecipe_servespecification as servingSpecification,
BUILTIN.DF(foodRecipes.custrecord_recipe_service_style) as serviceStyleCode,
BUILTIN.DF(custrecord_foodrecipe_status) as status,
foodRecipes.custrecord_foodrecipe_remarks as remarks,
foodRecipes.custrecord_recipemasterlevel as level,
foodRecipes.custrecord_site_procedure as siteProcedure,
foodRecipes.custrecord_food_recipe_cost_per_pax_stor as pricePerHead,
foodRecipes.custrecord_total_recipe_cost_stored as totalcost,
TO_CHAR(foodRecipes.lastmodified, 'MM-DD-YYYY') as revisionDate,
TO_CHAR(CURRENT_DATE, 'MM-DD-YYYY') as currentdate
FROM CUSTOMRECORD_FOOD_RECIPES as foodRecipes
WHERE foodRecipes.id = paramid