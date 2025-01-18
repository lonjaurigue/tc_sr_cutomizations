define(['N/file', '../../Helper/library/suiteql', '../Third-Party/handlebars.js'], (file, suiteql, Handlebars) => {
    
    const generate = (options) => {
        let intManpowerId = options.id;

        let strTemplate = file.load({
            id: '../../Printouts/Template/manpower.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../../Printouts/Css/manpower-recipe.css'
        })

        log.audit('srtCss manpower url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())

        
        //sql for bodyfields
        let objManpower = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/manpower.sql',
            custparam: {
                paramid:intManpowerId
            }
        }).data[0]

        //sql for sublists
        let objManpowerRequirements = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/manpowerreq.sql',
            custparam: {
                paramid:intManpowerId
            }
        }).data

         log.debug('obj manpower', objManpower);
        log.debug('obj manpower requirements', objManpowerRequirements);
      
        //combine bodyfields and sublists
        const objManpowerRecipe = {
            bodyfields: objManpower,
            sublists: {}
          };


      var cost = objManpowerRecipe.bodyfields.totalcoststored.toString().split(".")
      cost[0] = cost[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      objManpowerRecipe.bodyfields.totalcoststored = cost.join(".")
          
          for (let i = 0; i < objManpowerRequirements.length; i++) {
            const requirement = objManpowerRequirements[i];
            const sublistName = 'Requirements';

            var amount = requirement.amount.toString().split(".")
            amount[0] = amount[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            requirement.amount = amount.join(".")
            
            if (!objManpowerRecipe.sublists[sublistName]) {
              objManpowerRecipe.sublists[sublistName] = [];
            }

            log.debug('requirement', requirement)
            log.debug('combine data', objManpowerRecipe);
                                  
            objManpowerRecipe.sublists[sublistName].push(requirement);
          }
      
        //handlebars
        const xmlTemplate = Handlebars.compile(strTemplate);
        const populatedXml = xmlTemplate(objManpowerRecipe);
   
        return {
            data: objManpowerRecipe,
            template: populatedXml
        }
        
    }


    return {
        generate
    }
})