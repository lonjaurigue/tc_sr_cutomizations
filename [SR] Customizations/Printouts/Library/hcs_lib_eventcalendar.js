define(['N/file', '../../Helper/library/suiteql', '../Third-Party/handlebars.js', 'N/search'], (file, suiteql, Handlebars, search) => {

    const generate = (options) => {
        let intCalendarId = options.id;

        Handlebars.registerHelper('getMenu', function(setName) {
            return setName.replace('Set', 'menucode');
        });

        let strTemplate = file.load({
            id: '../Template/eventcalendar.xml'
        }).getContents()

        let srtCss = file.load({
            id: '../Css/eventcalendar.css'
        })
        log.audit('srtCss url', srtCss.url)
        strTemplate = strTemplate.replace('{{css}}', srtCss.getContents())

        //sql for bodyfields
        let objEventBody = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/eventcalendar_body.sql',
            custparam: {
                paramid:intCalendarId
            }
        }).data[0]

        const arrEventFoodMenu = suiteql.execute({
            sqlfile: '../../Printouts/SuiteQL/eventcalendar_foodmenu.sql',
            custparam: {
                paramid: intCalendarId
            }
        }).data

        let objEventCalendar = {
            bodyfields: objEventBody,
            sublists: {}
        }
        objEventCalendar.sublists['FoodMenu'] = arrEventFoodMenu.reduce((p, c) => (p[c.menucode] = [...p[c.menucode] || [], c], p), {});

      var servingTime = search.lookupFields({
        type: search.Type.CALENDAR_EVENT,
        id: intCalendarId,
        columns: ['custevent_event_serving_time']
      });

      objEventCalendar.bodyfields['servingtime'] = servingTime.custevent_event_serving_time
      
      log.debug('obj event calendar', objEventCalendar);
        const xmlTemplate = Handlebars.compile(strTemplate);
        const populatedXml = xmlTemplate(objEventCalendar);

        return {
            data: objEventCalendar,
            template: populatedXml
        }
    }


    return {
        generate
    }
})