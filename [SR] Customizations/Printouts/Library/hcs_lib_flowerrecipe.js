define(['N/file', '../../Helper/library/suiteql', '../Third-Party/handlebars.js', 'N/search'], (file, suiteql, Handlebars, search) => {
    
    const generate = (options) => {
        let intFlowerRecipe = options.id;

      
        
        Handlebars.registerHelper('getCategory', function(setName) {
            return setName.replace('Set', 'classification');
        });

        let strTemplate = file.load({
            id: '../../Printouts/Template/flower-recipe.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../../Printouts/Css/floral-recipe.css'
        })

        log.audit('srtCss url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())
        
        //sql for bodyfields
        let objFlowerRecipe = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/flowerrecipe.sql',
            custparam: {
                paramid:intFlowerRecipe
            }
        }).data[0]

        //sql for sublists
        let objFlowerIngredients = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/FRIngredients.sql',
            custparam: {
                paramid:intFlowerRecipe
            }
        }).data
        
        const objDataFlowerRecipe = {
            bodyfields: objFlowerRecipe,
            sublists: {}
          };

       var flowerImage = search.lookupFields({
         type: 'customrecord_flower_recipe',
         id: intFlowerRecipe,
         columns: 'custrecord_flower_image'
       })

      if(flowerImage.custrecord_flower_image[0]) {
       objDataFlowerRecipe.bodyfields['image'] = flowerImage.custrecord_flower_image[0].text
      }
      else {
        objDataFlowerRecipe.bodyfields['image'] = '/'
      }
          
        objDataFlowerRecipe.sublists['Ingredients'] = objFlowerIngredients.reduce((p, c) => (p[c.classification] = [...p[c.classification] || [], c], p), {});
        
        log.debug('obj flower recipe', objFlowerRecipe);
        log.debug('obj flower recipe ingredients', objFlowerIngredients);
        log.debug('combine data', objDataFlowerRecipe);


        //handlebars
        const xmlTemplate = Handlebars.compile(strTemplate);
        const populatedXml = xmlTemplate(objDataFlowerRecipe);
       
        return {
            data: objDataFlowerRecipe,
            template: populatedXml
        }
        
    }


    return {
        generate
    }
})