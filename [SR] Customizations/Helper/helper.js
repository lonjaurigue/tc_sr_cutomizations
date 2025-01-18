define([
    './modules/costingsheet',
    './modules/opportunity'
],

(costingsheet, opportunity) => {

    /**
     * Retrieves a costing sheet using the provided options.
     *
     * @param {Object} options - The options for retrieving the costing sheet.
     * @param {number} options.id - The ID of the costing sheet.
     * @param {string[]} options.sublists - An array of sublist ids to include in the costing sheet.
     * @returns {Object} An object containing the body and sublists
     */
    const getCostingSheet = (options) => {
        return costingsheet.get(options)
    }

     /**
     * Retrieves an opportuntiy using the provided options.
     *
     * @param {Object} options - The options for retrieving opportunity.
     * @param {number} options.id - The ID of the opportuntiy record.
     * @param {string[]} options.sublists - An array of sublist ids to include in the opportuntiy data.
     * @returns {Object} An object containing the body and sublists of the opportuntiy
     */
    const getOpportunity = (options) => {
        return opportunity.get(options)
    }

    return {
        getCostingSheet,
        getOpportunity
    }  
})
