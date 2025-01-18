select 
	id, 
	TO_CHAR(custbody_eventdate, 'Month DD, YYYY') as eventdate, 
	BUILTIN.DF(custbody_venue) as venue, 
	tranid as docum,
	custbody_hz_total_number_of_pax as pax, 
	custbody_priceperhead as price,
        '/core/media/media.nl?id=10826&c=8154337&h=zNbRp-L0eHsnyKiuL-NilCcyiofSbzFzdVXvc2eazrg0Grvb' as logo_catering,
		'/core/media/media.nl?id=11129&c=8154337&h=tirq4mKHMCJMWBz9CyLE2bDrpLxD_K2VW5fJp032g0knvNml' as check_box,
	TO_CHAR(CURRENT_DATE, 'Month DD, YYYY') AS formatted_date
from 
	transaction 
where type='Estimate' AND 
	id=paramid