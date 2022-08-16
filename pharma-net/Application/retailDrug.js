'use strict';

/*
Node JS app to retail the drug on the network
*/

const helper = require('./contractHelper.js');

async function main(drugName, serialNo, retailerCRN, customerAadhar, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating retail drug request');
    const userBuffer = await Contract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

    console.log('Processing request to retail the drug');
    let drugSold = JSON.parse(userBuffer.toString());
    console.log(drugSold);
    console.log('Drug is sold to the consumer');
    return drugSold;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;