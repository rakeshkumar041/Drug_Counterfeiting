'use strict';

/*
Node JS app to create a shipment on the network
*/

const helper = require('./contractHelper.js');

async function main(buyerCRN, drugName, listOfAssets, transporterCRN, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating new shipment request');
    const userBuffer = await Contract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets, transporterCRN);

    console.log('Processing request to create a new shipment');
    let newShipment = JSON.parse(userBuffer.toString());
    console.log(newShipment);
    console.log('New Shipment is created');
    return newShipment;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;