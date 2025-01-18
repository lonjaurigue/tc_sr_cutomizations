/**
 * @NApiVersion 2.1
 */

define(['N/file'],

    (file) => {

        const execute = (options) => {

            let output = {};
            let sSql = '';
            let arrData = []


            if (options.sqlfile) {

                try {

                    sSql = file.load({
                        id: options.sqlfile
                    }).getContents();
                }
                catch (error) {
                    output.status = 'FAILED';
                    output.message = error.message;
                }
            }
            else if (options.query) {
                sSql = options.query;
            }
            else if (options.dataset) {
                //noop
            }

            if ((sSql == null || sSql == '' || sSql == undefined) && options.dataset == undefined) {
                output.status = 'FAILED';
                output.message = 'BLANK_SQL_STATEMENT';
            }

            if (options.custparam) {

                const regx = new RegExp(Object.keys(options.custparam).join("|"), "gi");
                sSql = sSql.replace(regx, function (matched) {
                    return options.custparam[matched];
                });
            }

            try {

                require(['N/query'], function (query) {

                    if (options.dataset) {
                      
                        let objQuery = {};

                        try {
                            objQuery = query.load({
                                id: options.dataset
                            });
                        }
                        catch (error) {
                            output.status = 'FAILED';
                            output.message = 'ERROR_LOADING_DATASET';
                        }

                        if (options.condition) {
                            objQuery.condition = options.condition;
                        }

                        sSql = objQuery.toSuiteQL().query;

                        const objPagedQuery = query.runSuiteQLPaged({
                            query: sSql,
                            pageSize: 1000
                        });

                        let iterator = objPagedQuery.iterator();

                        iterator.each(function (result) {
                            arrData = arrData.concat(result.value.data.asMappedResults());
                            return true;
                        });
                    }
                    else if (options.params) {
                       
                        const objPagedQuery = query.runSuiteQLPaged({
                            query: sSql,
                            params: options.params,
                            pageSize: 1000
                        });

                        let iterator = objPagedQuery.iterator();

                        iterator.each(function (result) {
                            arrData = arrData.concat(result.value.data.asMappedResults());
                            return true;
                        });
                    }
                    else {
                      
                        const objPagedQuery = query.runSuiteQLPaged({
                            query: sSql,
                            pageSize: 1000
                        });

                
                        let iterator = objPagedQuery.iterator();

                        iterator.each(function (result) {
                            arrData = arrData.concat(result.value.data.asMappedResults());
                            return true;
                        });
                    }

                });

                output.status = 'SUCCESS';
                output.data = arrData;
            }
            catch (error) {
                log.error('suiteql error', error)
                output.status = 'FAILED';
                output.message = error.message;
                output.data = []
            }

            return output;
        };

        const toCsv = (options) => {

            let output = {};

            try {

                const objData = execute(options)

                if (objData.status == 'SUCCESS') {

                    const arrHeader = Object.keys(objData.data[0]);
                    const replacer = (key, value) => value ?? '';
                    const arrRow = objData.data.map((row) =>
                        arrHeader
                            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
                            .join(',')
                    );

                    let objFile = file.create({
                        name: options.filename,
                        fileType: file.Type.CSV,
                        contents: [arrHeader.join(','), ...arrRow].join('\r\n'),
                        encoding: file.Encoding.UTF_8
                    });

                    output.status = 'SUCCESS'
                    output.file = objFile
                }
                else {
                    output = objData;
                }

            }
            catch (error) {
                log.error('suiteql error', error)
                output.status = 'FAILED'
                output.message = error.message
                output.data = []
            }

            return output;
        };

        return { execute, toCsv }

    });