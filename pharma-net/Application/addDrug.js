'use strict';

/*
Node JS app to add drug on the network
*/

const helper = require('./contractHelper.js');

async function main(drugName, serialNo, mfgDate, expDate, companyCRN, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating new drug addition request');
    const userBuffer = await Contract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

    console.log('Processing request to add a new drug');
    let newOrg = JSON.parse(userBuffer.toString());
    console.log(newOrg);
    console.log('New drug is added');
    return newOrg;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;