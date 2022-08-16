'use strict';

/*
Node JS app to update the shipment on the network
*/

const helper = require('./contractHelper.js');

async function main(buyerCRN, drugName, transporterCRN, organisation) {
  try {
    //input organisation => to point to the right CCP
    const Contract = await helper.getContractInstance(organisation);
    //console.log(Contract);
    console.log('Creating update shipment request');
    const userBuffer = await Contract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

    console.log('Processing request to update the shipment');
    let updatedShipment = JSON.parse(userBuffer.toString());
    console.log(updatedShipment);
    console.log('Shipment is updated');
    return updatedShipment;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    console.log('Disconnect from fabric');
    helper.disconnect();
  }
}

module.exports.execute = main;