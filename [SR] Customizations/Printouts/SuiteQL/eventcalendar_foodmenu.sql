SELECT
	item.displayname as item,
	CI.custrecord_qty_c as quantity,
	BUILTIN.DF(CI.custrecord_uom_c) as uom,
	BUILTIN.DF(FM.custrecord_fcs_menu) as menucode,
	FM.custrecord_fcs_serving as servingspecification,
	FM.custrecord_fcs_pax as pax
FROM customrecord_food_menu_fb as FM
JOIN  customrecord_custom_ingdt as CI
	ON FM.id = CI.custrecord_related_food_menu
JOIN item
	ON  CI.custrecord_ingdt_c = item.id
WHERE FM.custrecord_food_calendar_menu = paramid