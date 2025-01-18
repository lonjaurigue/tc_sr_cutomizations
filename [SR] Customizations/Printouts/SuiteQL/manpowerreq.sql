SELECT 
MPR.custrecord_manpowerreqt_itemname as rank,
MPR.custrecord_manpower_requirement_qty as quantity,
MPR.custrecord_manpower_cost as cost,
(MPR.custrecord_manpower_requirement_qty*MPR.custrecord_manpower_cost) as amount
 FROM customrecord_manpower_requirement_costin as MPR
JOIN item as item
on item.id = MPR.custrecord_manpower_requirement_rank
WHERE MPR.custrecord_manpowerrecipeparent= paramid