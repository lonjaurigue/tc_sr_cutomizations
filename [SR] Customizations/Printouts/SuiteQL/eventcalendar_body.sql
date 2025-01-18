SELECT 
	BUILTIN.DF(CS.custrecord_tc_costingsheet_location) as outlet,
	CASE 
		WHEN CS.custrecord_charge_to = 4 THEN BUILTIN.DF(FM. custrecord_category)
		WHEN CS.custrecord_charge_to = 3 THEN CE.title
		ELSE null
	END AS natureoffunction,
	CS.custrecord_fcs_remarks as remarks,
	TO_CHAR(CE.startdate, 'MM-DD-YYYY') as dateofevent,
	BUILTIN.DF(CS.custrecord_charge_to) as chargeto,
	TO_CHAR(CURRENT_DATE, 'MM-DD-YYYY') as currentdate,
	CE.location as venue
FROM calendarevent as CE
JOIN customrecord_costing_sheet as CS
ON CE.custevent_event_costing_sheet = CS.id
JOIN customrecord_food_menu_fb as FM
	ON FM.custrecord_food_calendar_menu = CE.id
WHERE CE.id = paramid
