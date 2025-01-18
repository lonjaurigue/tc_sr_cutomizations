/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    '../Library/hcs_lib_proposal',
    '../Library/hcs_lib_beo',
    '../Library/hcs_lib_proposalcontract.js'
],
(
    proposal,
    beo,
    proposalContract
) => {

    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (scriptContext) => {
        const action = scriptContext.request.parameters.action
        const type = scriptContext.request.parameters.type

        try{
            let strTemplate = ''
            let strData = ''

            if(type == 'fandbproposal') {
                let objProposal = proposal.generate({
                    id: scriptContext.request.parameters.proposal_id
                })
               
                strTemplate = objProposal.template
                strData = objProposal.data
            }

            if(type == 'fandbbeo') {
                let objBeo = beo.generate({
                    id: scriptContext.request.parameters.beo_id
                })
               
                strTemplate = objBeo.template
                strData = objBeo.data
            }

            if(type == 'proposalcontract') {
                let objProposal = proposalContract.generate({
                    id: scriptContext.request.parameters.proposal_id
                })

                strTemplate = objProposal.template
                strData = objProposal.data
            }

            if(action == 'print') {
                scriptContext.response.renderPdf(strTemplate);
            }else if( action == 'getdata') {
                scriptContext.response.write(JSON.stringify(strData));
            }
        }catch(objError) {
            log.error('objError', objError)
        }
        
        
    }

    return {onRequest}

});
