define(['N/format', 'N/error'], 

(format, error) => {

    /**
     * Converts JSON data to record using field mapping.
     *
     * @param {Object} options - The options for the mapper.
     * @param {Object} options.data - An object that contains the data.
     * @param {Object} options.mapping - Field mapping object
     * @param {nlobjRecord} options.record - NetSuite record to set the values
     * @returns {Object|string} An object of the record or if of the record created/updated
    */
    const jsonMapToRecord = (options) => {
        
        const json = options.data
        const mapping = options.mapping
        const recRecord = options.record
        const TRANSFER_ORDER = 'transferorder'
        const INTER_COMPANY_TRANSFER_ORDER = 'intercompanytransferorder'
        let lastFieldsCaptured = ''
        let recRecordType = options.recType
        
        try
        {
            //set body fields values
            for(let mapKey in mapping.body.fields) {
                const field = mapKey
                const setType = mapping.body.fields[mapKey].setType
                const mappingValue = mapping.body.fields[mapKey].value
                const isDefault = mapping.body.fields[mapKey].hasOwnProperty('isDefault')
                const value = isDefault == true? mappingValue: json.body[mapping.body.fields[mapKey].value]
                
                lastFieldsCaptured = `Field Id: ${field}\nValue: ${value}`
                try{
                    setValue({
                        field,
                        value: value, 
                        setType,
                        isDefault: isDefault,
                        record: recRecord
                    })
                }catch(objError) {

                    let errorMessage = objError.message
                    log.error('jsonMapToRecord error details', {
                        message: errorMessage,
                        field,
                        value: value, 
                        setType,
                        isDefault: isDefault,
                    })

                    throw error.create({
                        name: 'HCS_ERROR_SETTING_BODY_FIELD',
                        message: errorMessage
                    })
                }
                
                
            }

            if(!mapping.hasOwnProperty('sublists')) {
                return { record: recRecord }
            }
            if(objectEmpty(mapping.sublists)) { 
                return { record: recRecord }
            }

            for(let sublist in mapping.sublists) {
                const mappingSublists = mapping.sublists[sublist]
                
                for(let mappingSublist in mappingSublists) {
                    log.debug('mappingsublist', mappingSublist)
                    let data = []
                    if(json.hasOwnProperty('sublists')) {
                        if(json.sublists.hasOwnProperty(mappingSublist)) {
                            data = json.sublists[mappingSublist]
                        }
                    }

                    let stopper = null

                    for(let line in data) { 
                        
                        const objItem = data[line]

                        //set sublist values
                        if(recRecord.isDynamic == true) {

                            recRecord.selectNewLine({ sublistId: sublist })
                        }

                        for(let mapKey in mappingSublists[mappingSublist].fields) {
                            const mappingKey = mapKey
                            const mappingValue = mappingSublists[mappingSublist].fields[mappingKey].value
                            const mappingDefault = mappingSublists[mappingSublist].fields[mappingKey].default
                            const setType = mappingSublists[mappingSublist].fields[mappingKey].setType
                            const isDefault = mappingSublists[mappingSublist].fields[mappingKey].hasOwnProperty('isDefault')

                            let value = ''
                            if(isDefault == true) {
                                value = mappingValue
                            }
                            else if(typeof mappingValue == 'function') {
                                let objParam = {...json, currentLine: objItem}
                                value = eval(mappingValue)(objParam)
                            }
                            else {
                                value = objItem[mappingValue]
                            }

                            const source = json.body.custom_record_name==undefined? '': json.body.custom_record_name+' > '+mappingSublists[mappingSublist].source
                            const target = mappingSublists[mappingSublist].target
                            lastFieldsCaptured = `Source sublist: ${source}\nTarget sublist: ${target}\nTarget Field: ${mappingKey}\nSource Value: ${value}`

                            try{
                                if(mappingKey == 'quantity' &&  value == 0 && (recRecordType == TRANSFER_ORDER || recRecordType == INTER_COMPANY_TRANSFER_ORDER)){
                                    value = mappingDefault
                                }
                                // log.debug('setValue',{
                                //     field: mappingKey, 
                                //     value: value,
                                //     recRecordType:recRecordType,
                                //     setType,
                                //     sublist,
                                //     line
                                // })
                                setValue({
                                    field: mappingKey, 
                                    value: value, 
                                    setType,
                                    sublist,
                                    // isDefault: isDefault,
                                    record: recRecord,
                                    line
                                })
                            }catch(objError){
                                let errorMessage = objError.message + `\n\nThe following is the last information that has been tracked \n\n${lastFieldsCaptured}`
                                log.error('jsonMapToRecord error details', {
                                    message: errorMessage,
                                    field: mappingKey,
                                    value: value, 
                                    setType,
                                    sublist,
                                    // isDefault: isDefault,
                                })
                                throw error.create({
                                    name: 'HCS_ERROR_SETTING_LINE_ITEM',
                                    message: errorMessage
                                })
                            }
        
                            let stopper = null
                        }

                        if(recRecord.isDynamic == true) {
                          recRecord.commitLine({ sublistId: sublist, ignoreRecalc: false })
                        }
                    }
                }
                    
            }
            log.debug('record', recRecord)
            let stopper = null
            return {
                record: recRecord
            }
        }
        catch(objError) 
        {
            if(objError.name == 'USER_ERROR') {

                throw error.create({
                    name: 'HCS_USER_ERROR',
                    message: `${objError.message}\n\n${!lastFieldsCaptured? '': `The following is the last information that has been tracked \n\n${lastFieldsCaptured}`}`
                })
            }

            throw objError
        }
        
    }

    function setValue(options) {
        const field = options.field
        const setType = options.setType
        const sublist = options.sublist
        const recRecord = options.record
        const line = options.line

        let finalValue = options.value

        if(setType == 'text') 
        {
            if(sublist) {

                if(recRecord.isDynamic == true) {             
                    recRecord.setCurrentSublistText({
                        sublistId: sublist,
                        fieldId: field,
                        text: finalValue == null? "": finalValue
                    })
                }else if(recRecord.isDynamic == false) {
                    recRecord.setSublistText({
                        sublistId: sublist,
                        fieldId: field,
                        line,
                        text: finalValue == null? "": finalValue
                    })
                }
                
            } else {
                recRecord.setText({ fieldId: field, text: finalValue == null? "": finalValue })
            }
        }
        else 
        {
            switch(setType) {
                case 'timeofday': {
                        finalValue = finalValue == null? "": format.parse({value: finalValue, type: format.Type.TIMEOFDAY})
                    break
                }
                case 'date': {
                        finalValue = finalValue == null? "": format.parse({value: finalValue, type: format.Type.DATE})
                    break
                }   
            }

            if(sublist){
                if(recRecord.isDynamic == true) {
                    recRecord.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: field,
                        value: finalValue == null? "": finalValue
                    })  
                }else if(recRecord.isDynamic == false) {
                    recRecord.setSublistValue({
                        sublistId: sublist,
                        fieldId: field,
                        line,
                        value: finalValue == null? "": finalValue
                    })
                }
                
            }else {
                    recRecord.setValue({ fieldId: field, value: finalValue == null? "": finalValue })
            }
        }
    }

    function objectEmpty(obj) {
        return Object.entries(obj).length === 0
    }

    return{
        jsonMapToRecord
    }
  
})