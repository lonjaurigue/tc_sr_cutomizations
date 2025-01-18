select 
	id, 
	TO_CHAR(custbody_eventdate, 'Month DD, YYYY') as event_date, 
	BUILTIN.DF(custbody_venue) as venue, 
	BUILTIN.DF(custbody_event_name) as event_name,
	custbody_hz_total_number_of_pax as pax, 
	custbody_priceperhead as price_per_head,
        '/core/media/media.nl?id=5532&c=8154337&h=6V-_303f_GL_YjZq5rOwcO3gY_ng0ad_GP5w0w8mUZv7cOYt' as logo_catering
from 
	transaction 
where type='Estimate' AND 
	id=paramid