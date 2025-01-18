SELECT 
BUILTIN.DF(MP.custrecord_manpower_itemcode) asitemcode,
MP.name AS recipename,
TO_CHAR( MP.created, 'MM-DD-YYYY') as datecreated,
MP.custrecord_manpowerecipedescription as description,
MP.custrecord_manpowerqty as quantity,
BUILTIN.DF(MP.custrecord_manpowerrecipeuom) as uom,
BUILTIN.DF(MP.custrecord_manpowerservicetype) as servicetype,
MP.custrecord_manpowerreciperemarks as remarks,
MP.custrecord_manpowerrecipetotalcoststored as totalcoststored,
MP.custrecord_manpowerunitcoststoredrecipe as unitcoststoredrecipe,
TO_CHAR(CURRENT_DATE, 'MM-DD-YYYY') as currentdate,
BUILTIN.DF(MP.custrecord_manpower_status) as status,
'/core/media/media.nl?id=10826&c=8154337&h=zNbRp-L0eHsnyKiuL-NilCcyiofSbzFzdVXvc2eazrg0Grvb' as logo
 FROM customrecord_manpowerrecipe as MP
WHERE MP.id = paramid