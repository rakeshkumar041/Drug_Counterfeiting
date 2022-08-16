'use strict';

/*
Node JS app to view the history of the drug on the network
*/

const helper = require('./contractHelper.js');

async function main(drugName, serialNo, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating view history request');
    const userBuffer = await Contract.submitTransaction('viewHistory', drugName, serialNo);

    console.log('Processing request to view history of the drug');
    let history = JSON.parse(userBuffer.toString());
    console.log(history);
    console.log('History of the drug is displayed');
    return history;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;