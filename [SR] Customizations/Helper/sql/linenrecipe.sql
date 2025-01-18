/*
 Only use alias for joined tables. Retail the names of the main table columns.
*/
select
  lr.id,
  lr.custrecord_tc_linen_code_linenrecipe,
  lr.custrecord_linenqty_required
from 
  customrecord_linen_recipe_ingredients lr
where
  paramcriteria