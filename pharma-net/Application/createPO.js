'use strict';

/*
Node JS app to create a purchase order on the network
*/

const helper = require('./contractHelper.js');

async function main(buyerCRN, sellerCRN, drugName, quantity, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating new purchase order request');
    const userBuffer = await Contract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

    console.log('Processing request to create a new purchase order');
    let newPO = JSON.parse(userBuffer.toString());
    console.log(newPO);
    console.log('Purchase order is created');
    return newPO;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;