SELECT 
BUILTIN.DF(FR.custrecord_flower_item) as productcode,
'/core/media/media.nl?id=10826&c=8154337&h=zNbRp-L0eHsnyKiuL-NilCcyiofSbzFzdVXvc2eazrg0Grvb' as logo,
FR.name as productname,
BUILTIN.DF(FR.custrecord_flower_design_classification) as classification,
FR.custrecord_flowerrecipe_description as remarks,
BUILTIN.DF(FR.custrecord_flower_level) as level,
BUILTIN.DF(FR.custrecord_flower_status) as status,
FR.custrecord_no_of_pax_flowerrecipe as quantity,
FR.custrecord_flower_costperpc_stored as costperpiece,
FR.custrecord_total_flower_recipe_cost_stor as totalcost,
TO_CHAR(FR.created, 'MM-DD-YYYY') as datecreated,
TO_CHAR(CURRENT_DATE, 'MM-DD-YYYY') as currentdate
FROM customrecord_flower_recipe as FR
WHERE FR.id = paramid