define(['N/file', '../../Helper/library/suiteql', '../Third-Party/handlebars.js'], (file, suiteql, Handlebars) => {
    
    const generate = (options) => {
        let intFoodRecipeId = options.id;

      
        
        Handlebars.registerHelper('getCategory', function(setName) {
            return setName.replace('Set', 'category');
        });
        Handlebars.registerHelper('getRecipe', function(setName) {
            return setName.replace('Set', 'recipe');
        });

        let strTemplate = file.load({
            id: '../../Printouts/Template/food-recipe.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../../Printouts/Css/food-recipe.css'
        })

        log.audit('srtCss url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())

      log.debug('options', intFoodRecipeId);
        
        //sql for bodyfields
        let objFoodRecipes = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/foodRecipesBody.sql',
            custparam: {
                paramid:intFoodRecipeId
            }
        }).data[0]

        //sql for sublists
        let objFoodRecipeIngredients = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/foodRecipeIngredients.sql',
            custparam: {
                paramid:intFoodRecipeId
            }
        }).data

        //combine bodyfields and sublists
        const objDataFoodRecipe = {
            bodyfields: objFoodRecipes,
            sublists: {}
          };

          var cost = objDataFoodRecipe.bodyfields.totalcost.toString().split(".")
          cost[0] = cost[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          objDataFoodRecipe.bodyfields.totalcost = cost.join(".")
      
          for (let i = 0; i < objFoodRecipeIngredients.length; i++) {
            const ingredient = objFoodRecipeIngredients[i];
            const sublistName = 'Ingredients';
            const category = ingredient.category;
            const recipe = ingredient.recipe;

            var amount = ingredient.amount.toString().split(".")
            amount[0] = amount[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            ingredient.amount = amount.join(".")
          
            log.debug('recipe', recipe)
            log.debug('category', category)
            log.debug('ingredient', ingredient)
            
            if (!objDataFoodRecipe.sublists[sublistName]) {
              objDataFoodRecipe.sublists[sublistName] = {};
            }

            if (!objDataFoodRecipe.sublists[sublistName][category]) {
                objDataFoodRecipe.sublists[sublistName][category] = {};
              }
            
            if (!objDataFoodRecipe.sublists[sublistName][category][recipe]) {
              objDataFoodRecipe.sublists[sublistName][category][recipe] = [];
            }
            
            objDataFoodRecipe.sublists[sublistName][category][recipe].push(ingredient);
          }

          

        log.debug('obj food recipe', objFoodRecipes);
        log.debug('obj food recipe ingredients', objFoodRecipeIngredients);
        log.debug('combine data', objDataFoodRecipe);

        //handlebars
        const xmlTemplate = Handlebars.compile(strTemplate);
        const populatedXml = xmlTemplate(objDataFoodRecipe);
      
        
        return {
            data: objDataFoodRecipe,
            template: populatedXml
        }
        
    }


    return {
        generate
    }
})