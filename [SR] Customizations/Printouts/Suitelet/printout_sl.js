/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
  '../Library/hcs_lib_foodrecipes',
  '../Library/hcs_lib_manpower',
  '../Library/hcs_lib_flowerrecipe',
  '../Library/hcs_lib_eventcalendar',
  'N/xml',
  'N/render'
],
(
  foodrecipes,
  manpower,
  flowerrecipe,
  calendarevent,
  xml,
  render
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

      log.debug('script context', scriptContext);
        try{
            let strTemplate = ''
            let strData = ''

            if(type == 'foodrecipes') {
                let objFoodRecipe = foodrecipes.generate({
                    id: scriptContext.request.parameters.foodrecipes_id
                })
               
                strTemplate = objFoodRecipe.template
                strData = objFoodRecipe.data
            }
          else if (type == 'manpowerrecipe') {
            let objManpowerRecipe = manpower.generate({
              id: scriptContext.request.parameters.manpowerrecipe_id
            });

            strTemplate = objManpowerRecipe.template
            strData = objManpowerRecipe.data
          }
          else if(type == 'flowerrecipe') {
            let objFlowerRecipe = flowerrecipe.generate({
              id: scriptContext.request.parameters.flowerrecipe_id
            })

             strTemplate = objFlowerRecipe.template
            strData = objFlowerRecipe.data
          }
          else if(type  == 'calendarevent') {
            let objCalendarEvent = calendarevent.generate({
              id: scriptContext.request.parameters.calendarevent_id
            })

             strTemplate = objCalendarEvent.template
            strData = objCalendarEvent.data            
          }
            if(action == 'print') {  
              log.debug('str template', typeof strTemplate)
              log.debug('template', strTemplate)
              scriptContext.response.renderPdf(strTemplate);
              
            }else if( action == 'getdata') {
              log.debug('getdata', action)
                scriptContext.response.write(JSON.stringify(strData));
            }

        }catch(objError) {
            log.error('objError', objError)
        }
        
        
    }

    return {onRequest}

});
