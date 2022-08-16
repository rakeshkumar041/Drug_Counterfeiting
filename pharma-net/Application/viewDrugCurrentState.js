'use strict';

/*
Node JS app to view the current state of the drug on the network
*/

const helper = require('./contractHelper.js');

async function main(drugName, serialNo, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating view drug current state request');
    const userBuffer = await Contract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

    console.log('Processing request to view current state of the drug');
    let currentState = JSON.parse(userBuffer.toString());
    console.log(currentState);
    console.log('Current state of the drug is displayed');
    return currentState;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;