define(['N/error'], (error) => {

    const checkPropertiesWithEmptyValue = (options) => {
        const objData = options.data
        const objMapping = options.mapping
        const bolThrowError = options.throwError

        const blankProperties = []
        for(let key in objMapping) {
            if(!objData[key]) {
                blankProperties.push({
                    id: key,
                    label: objMapping[key],
                })
            }
        }

        if(bolThrowError == true) {

            if(blankProperties.length > 0) {
                
                const labels = blankProperties.map(({label}) => label)
                let message = ''
                if(labels.length >= 2) {
                    const strLastValue = labels.pop()
                    const arrPrevValues = labels.map(val => `'${val}'`).join(', ')
                    message = `${arrPrevValues} and '${strLastValue}' must not be blank.`
                }else {
                    message = `${labels.map(val => `'${val}'`).join(', ')} must not be blank.`
                }
                throw error.create({
                    name: 'HCS_OBJECT_HAS_EMPTY_VALUE',
                    message: message
                })
            }
        }
       
        return blankProperties
   }

    return { checkPropertiesWithEmptyValue }
})