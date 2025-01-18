/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'
    
],
(record) => {
    
    const beforeLoad = (scriptContext) => {
      
      if(scriptContext.type == scriptContext.UserEventType.VIEW) {
        const recNewRecord = scriptContext.newRecord
        const strRecordType = recNewRecord.type
        const objForm = scriptContext.form
        const strSuiteLetConverter = '/app/site/hosting/scriptlet.nl?script=1040&deploy=2'

      var currentRecord = record.load({
        type: strRecordType,
        id: recNewRecord.id
      })
      
      var custForm = currentRecord.getValue({
        fieldId: 'customform'
      })
      
      
          try{
            if(strRecordType == 'customrecord_food_recipes' && custForm == '178'){
                objForm.addButton({
                    id: 'custpage_btn_foodrecipes',
                    label: 'Print Food Recipes',
                    functionName: `
                        window.open('${strSuiteLetConverter}&action=print&type=foodrecipes&foodrecipes_id=${recNewRecord.id}', '_blank')
                    `
                })
            }
            else if(strRecordType == 'customrecord_manpowerrecipe' && custForm == '187') {
              objForm.addButton({
                    id: 'custpage_btn_manpowerrecipe',
                    label: 'Print Manpower Recipe',
                    functionName: `
                        window.open('${strSuiteLetConverter}&action=print&type=manpowerrecipe&manpowerrecipe_id=${recNewRecord.id}', '_blank')
                    `
                })
            }
            else if(strRecordType == 'customrecord_flower_recipe' && custForm == '186') {
              objForm.addButton({
                    id: 'custpage_btn_flowerrecipe',
                    label: 'Print Flower Recipe',
                    functionName: `
                        window.open('${strSuiteLetConverter}&action=print&type=flowerrecipe&flowerrecipe_id=${recNewRecord.id}', '_blank')
                    `
                })
            }
            else if(strRecordType == 'calendarevent' && custForm == '168') {

              log.debug('custform', custForm)
              objForm.addButton({
                    id: 'custpage_btn_calendarevent',
                    label: 'Print Calendar Event',
                    functionName: `
                        window.open('${strSuiteLetConverter}&action=print&type=calendarevent&calendarevent_id=${recNewRecord.id}', '_blank')
                    `
                })
            }
            
        }catch(objError) {
            log.error('ue error catched', objError)
        }
       }

    }
    return {beforeLoad}

});
