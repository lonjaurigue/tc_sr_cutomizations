select
	tr.tranid as doc_num,
	BUILTIN.DF(tr.custbody_hz_servicetime) as service_time,
	TO_CHAR(tr.trandate, 'Month DD, YYYY') as prepared_date,
	BUILTIN.DF(tr.custbody_nature_of_function) as nature_of_function,
	BUILTIN.DF(tr.custbody_venue) as venue,
	tr.custbody_hz_total_number_of_pax as pax,
	BUILTIN.DF(tr.entity) as customer,	
	tr.custbody_hz_other_charges as others,
	tr.custbody_hz_foodmenunotes as fm_notes,
	tr.custbody_hz_setup_requirements as setup_req,
	tr.custbody_hz_barrequirements as bar_req,
	builtin.DF(tr.terms) as ini_terms,
	'Not available' as amendment_no,
	TO_CHAR(tr.custbody_eventdate, 'Month DD, YYYY') as date_of_event,
	BUILTIN.DF(tr.custbody_hz_contact_details) as contact_details,
	tr.custbody_priceperhead as price_per_head,
    'Not available' as bill_to_client_terms,
    'Not available' as cash_by_client,
    'Not available' as am_snacks_oly,
    'Not available' as pm_snacks_oly,
    'Not available' as lunch_only,
    'Not available' as meals_only,
    'Not available' as prepared_by,
    'Not available' as approved_by,
    'Not available' as noted_by,
		'/core/media/media.nl?id=10826&c=8154337&h=zNbRp-L0eHsnyKiuL-NilCcyiofSbzFzdVXvc2eazrg0Grvb' as logo_catering,
from
	transaction as tr
where
	tr.id = paramid and
	tr.recordtype = 'salesorder'