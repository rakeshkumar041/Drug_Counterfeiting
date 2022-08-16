'use strict';

const {Contract} = require('fabric-contract-api');

class PharmanetContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet');
	}
	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
	}
	
	/**
	 * Register a new company on the network
	 * @param ctx - The transaction context object
	 * @param companyCRN - Registration number of the company
	 * @param companyName - Name of the company
	 * @param location - Location of the student
	 * @param organisationRole - Organisation role of the company. It can be any of these (Manufacturer, Distributor, Retailer, Transporter)
	 * @returns 
	 */
	async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
		// Validate the caller
		if(!('ManufacturerMSP' == ctx.clientIdentity.mspId ||
			'DistributorMSP' == ctx.clientIdentity.mspId ||
			'RetailerMSP' == ctx.clientIdentity.mspId ||
			'TransporterMSP' == ctx.clientIdentity.mspId)) {
			throw new Error('You are not authorized to perform this operation');
		}

		// Create a new composite key companyId as CompanyName_CRN
		const companyId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.companyid', [companyCRN, companyName]);

		// Fetch company with given ID from blockchain
		let existingCompany = await ctx.stub
			.getState(companyId)
			.catch(err => console.log(err));
		
		// Make sure the company does not already exist.
		if (existingCompany.length != 0) {
			throw new Error('The company is already added in the ledger. Name: ' + companyName + ' and CRN: ' + companyCRN);
		} else {
			let hierarchyKey;
			if (organisationRole === "Manufacturer") {
				hierarchyKey = "1";
			} else if (organisationRole === "Distributor") {
				hierarchyKey = "2";
			} else if (organisationRole === "Retailer") {
				hierarchyKey = "3";
			} else if (organisationRole === "Transporter") {
				hierarchyKey = "";
			}

			// Create a new company object to be stored in ledger
			let newCompanyObject = {
				companyId : companyId,
				name: companyName,
				location : location,
				organisationRole : organisationRole,
				hierarchyKey: hierarchyKey,
			};

			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(newCompanyObject));
			await ctx.stub.putState(companyId, dataBuffer);
			// Return value of new company object
			return newCompanyObject;
		}
	}

	/**
	 * Register a new drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo - Serial no of the drug
	 * @param mfgDate - Manufactured date of the drug
	 * @param expDate - Expiry date of the drug
	 * @param companyCRN - Registration number of manufacturer company
	 * @returns
	 */
	async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
		// Validate the caller
		if('ManufacturerMSP' != ctx.clientIdentity.mspId) {
			throw new Error('You are not authorized to perform this operation');
		}

		// Create a new composite key productd as drugName_serialNo
		const productId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.productid', [drugName, serialNo]);

		// Fetch product with given ID from blockchain
		let existingProduct = await ctx.stub
			.getState(productId)
			.catch(err => console.log(err));
	
		// Make sure the product does not already exist.
		if (existingProduct.length != 0) {
			throw new Error('The product is already added in the ledger. Drug Name: ' + drugName + ' and serialNo: ' + serialNo);
		} else {
			const companyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [companyCRN]);

			let companyKey = await companyIterator.next();

			if (!companyKey) {
				throw new Error('Invalid company CRN: ' +  companyCRN);
			}

			// Create a new product object to be stored in ledger
			let newProductObject = {
				productId : productId,
				name: drugName,
				manufacturer : companyKey.value.key,
				manufacturingDate : mfgDate,
				expiryDate: expDate,
				owner: companyKey.value.key,
				shipment: "",
			};

			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(newProductObject));
			await ctx.stub.putState(productId, dataBuffer);
			// Return value of new product object
			return newProductObject;
		}		
	}

	/**
	 * Create a purchase order on the network
	 * @param ctx - The transaction context object
	 * @param buyerCRN - Registration number of buying company
	 * @param sellerCRN - Registration number of selling company
	 * @param drugName - Name of the drug
	 * @param quantity - No of quantity of the drug
	 * @returns
	 */
	async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
		// Validate the caller
		if(!('DistributorMSP' == ctx.clientIdentity.mspId ||
			'RetailerMSP' == ctx.clientIdentity.mspId)) {
			throw new Error('You are not authorized to perform this operation');
		}

		const buyerCompanyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [buyerCRN]);
		const buyerCompanyKey = await buyerCompanyIterator.next();
		if (!buyerCompanyKey) {
			throw new Error('Invalid buyer CRN: ' +  buyerCRN);
		}
		const sellerCompanyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [sellerCRN]);
		const sellerCompanyKey = await sellerCompanyIterator.next();	
		if (!sellerCompanyKey) {
			throw new Error('Invalid seller CRN: ' +  sellerCRN);
		}	

		// Fetch buyer company with given ID from blockchain
		let buyerCompanyAsBytes = await ctx.stub
			.getState(buyerCompanyKey.value.key)
			.catch(err => console.log(err));
	
		// Make sure the company already exist.
		if (buyerCompanyAsBytes.length == 0) {
			throw new Error('Invalid Buyer. Company CRN: ' + buyerCRN);
		} else {
			let buyerCompanyObj = JSON.parse(buyerCompanyAsBytes.toString());
			// Fetch seller company with given ID from blockchain
			let sellerCompanyAsBytes = await ctx.stub
				.getState(sellerCompanyKey.value.key)
				.catch(err => console.log(err));

			// Make sure the company already exist.	
			if (sellerCompanyAsBytes.length == 0) {
				throw new Error('Invalid Seller. Company CRN: ' + sellerCRN);
			} else {
				let sellerCompanyObj = JSON.parse(sellerCompanyAsBytes.toString());

				if (Number(buyerCompanyObj.hierarchyKey) - Number(sellerCompanyObj.hierarchyKey) != 1) {
					throw new Error('Transfer of drug is not in hierarchy. Buyer company hierarchy: ' + buyerCompanyObj.hierarchyKey + ' Seller company hierarchy ' + sellerCompanyObj.hierarchyKey);
				}	

				// Create a new composite key purchaseOrderId as buyerCRN_drugName
				const purchaseOrderId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchaseOrderId', [buyerCRN, drugName]);

				// Fetch purchase order with given ID from blockchain
				let existingPurchaseOrder = await ctx.stub
					.getState(purchaseOrderId)
					.catch(err => console.log(err));

				// Make sure the purchase order does not already exist.
				if (existingPurchaseOrder.length != 0) {
					throw new Error('The purchase order is already added in the ledger. Buyer CRN: ' + buyerCRN + ' Drug Name: ' + drugName);
				} else {
					// Create a new purchase order object to be stored in ledger
					let newPurchaseOrderObject = {
						poID : purchaseOrderId,
						drugName: drugName,
						quantity : quantity,
						buyer: buyerCompanyKey.value.key,
						seller: sellerCompanyKey.value.key,
					};

					// Convert the JSON object to a buffer and send it to blockchain for storage
					let dataBuffer = Buffer.from(JSON.stringify(newPurchaseOrderObject));
					await ctx.stub.putState(purchaseOrderId, dataBuffer);
					// Return value of new purchase order object
					return newPurchaseOrderObject;
				}
			}			
		}
	} 

	/**
	 * Create a shipment on the network
	 * @param ctx - The transaction context object
	 * @param buyerCRN - Registration number of buying company
	 * @param drugName - Name of the drug
	 * @param listOfAssets - List of composite key of all the assets shiped
	 * @param transporterCRN - Registration number of transporter company
	 * @returns
	 */
	async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
		// Validate the caller
		if(!('DistributorMSP' == ctx.clientIdentity.mspId ||
			'ManufacturerMSP' == ctx.clientIdentity.mspId)) {
			throw new Error('You are not authorized to perform this operation');
		}
		const transporterCompanyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [transporterCRN]);
		const transporterCompanyKey = await transporterCompanyIterator.next();
		if (!transporterCompanyKey) {
			throw new Error('Invalid transporter CRN: ' +  transporterCRN);
		}

		const purchaseOrderId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchaseOrderId', [buyerCRN, drugName]);
		// Fetch purchase order with given ID from blockchain
		let purchaseOrderAsBytes = await ctx.stub
			.getState(purchaseOrderId)
			.catch(err => console.log(err));

		// Make sure the purchase order already exist.
		if (purchaseOrderAsBytes.length == 0) {
			throw new Error('The purchase order does not exists in the ledger. Buyer CRN: ' + buyerCRN + ' Drug Name: ' + drugName);
		} else {
			let purchaseOrderObj = JSON.parse(purchaseOrderAsBytes.toString());
			//length of listofAsset == quantity specified in PO
            let listOfAssetArray = listOfAssets.split(",");
            let assets = [];
            //make sure quantity == length of list of assets
            if (listOfAssetArray.length == purchaseOrderObj.quantity) {
				for (let i = 0; i < listOfAssetArray.length; i++) {
					let drugId = await ctx.stub.createCompositeKey("org.pharma-network.pharmanet.productid",[drugName, listOfAssetArray[i]]);

					assets.push(drugId);
					let drugAsBytes = await ctx.stub
						.getState(drugId)
						.catch(err => console.log(err));
					//veryfiying if the serial number passed in list of assests are valid and if they point to a drug which is registered on the network
					if (drugAsBytes.length == 0) {
						throw new Error('The drug is not added in the ledger. Drug Name: ' + drugName);
					} else {
						let drugObj = JSON.parse(drugAsBytes.toString());
						drugObj.owner = transporterCompanyKey.value.key;
						let dataBuffer = Buffer.from(JSON.stringify(drugObj));
				    	await ctx.stub.putState(drugId, dataBuffer);
					}
				}
            } else {
				throw new Error('Either the drug Quantity does not match with PO, or drug ID is not valid');
            }

			// Create a new composite key shipmentId as buyerCRN_drugName
			const shipmentId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipmentid', [buyerCRN, drugName]);

			// Fetch shipment with given ID from blockchain
			let existingShipment = await ctx.stub
				.getState(shipmentId)
				.catch(err => console.log(err));

			// Make sure the Shipment does not already exist.
			if (existingShipment.length != 0) {
				throw new Error('The shipment is already added in the ledger. Buyer CRN: ' + buyerCRN + ' Drug Name: ' + drugName);
			} else {
				// Create a new shipment object to be stored in ledger
				let newShipmentObject = {
					shipmentId : shipmentId,
					creator: purchaseOrderObj.seller,
					assets: assets,
					transporter: transporterCompanyKey.value.key,
					status: "in-transit",
				};

				// Convert the JSON object to a buffer and send it to blockchain for storage
				let dataBuffer = Buffer.from(JSON.stringify(newShipmentObject));
				await ctx.stub.putState(shipmentId, dataBuffer);
				// Return value of new shipment object
				return newShipmentObject;
			}
		}
	}

	/**
	 * Update shipment on the network
	 * @param ctx - The transaction context object
	 * @param buyerCRN - Registration number of buying company
	 * @param drugName - Name of the drug
	 * @param transporterCRN - Registration number of transporter company
	 * @returns
	 */
	async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
		// Validate the caller
		if('TransporterMSP' != ctx.clientIdentity.mspId) {
			throw new Error('You are not authorized to perform this operation');
		}

		const transporterCompanyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [transporterCRN]);
		const transporterCompanyKey = await transporterCompanyIterator.next();
		if (!transporterCompanyKey) {
			throw new Error('Invalid transporter CRN: ' +  transporterCRN);
		}

		const shipmentId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipmentid', [buyerCRN, drugName]);

		// Fetch shipment with given ID from blockchain
		let shipmentAsBytes = await ctx.stub
			.getState(shipmentId)
			.catch(err => console.log(err));	

		// Make sure the Shipment obj already exist.
		if (shipmentAsBytes.length == 0) {
			throw new Error('The shipment does not exists in the ledger. Buyer CRN: ' + buyerCRN + ' Drug Name: ' + drugName);
		} else {
			let shipmentObj = JSON.parse(shipmentAsBytes.toString());
			if (shipmentObj.transporter != transporterCompanyKey.value.key) {
				throw new Error('You are not the shipment transporter. Transporter CRN : ' + transporterCRN);
			}
			shipmentObj.status = "Delivered";
			for (let i = 0; i < shipmentObj.assets.length; i++) {
				let drugAsBytes = await ctx.stub
					.getState(shipmentObj.assets[i])
					.catch(err => console.log(err));
				
				// Make sure the drug obj already exist.
				if (drugAsBytes.length == 0) {
					throw new Error('The drug does not exists in the ledger.Drug Name: ' + drugName);
				} else {	
					let drugObj = JSON.parse(drugAsBytes.toString());
					drugObj.shipment = shipmentId;

					const buyerCompanyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [buyerCRN]);
					const buyerCompanyKey = await buyerCompanyIterator.next();
					if (!buyerCompanyKey) {
						throw new Error('Invalid Buyer CRN: ' +  buyerCRN);
					}
					drugObj.owner = buyerCompanyKey.value.key;					

					let dataBuffer = Buffer.from(JSON.stringify(drugObj));
					await ctx.stub.putState(shipmentObj.assets[i], dataBuffer);
				}									
			}	
			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(shipmentObj));
			await ctx.stub.putState(shipmentId, dataBuffer);
			return shipmentObj;		
		}		
	}

	/**
	 * Retail the drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo Serial number of the drug
	 * @param retailerCRN - Registration number of retailer
	 * @param customerAadhar - Aadhar number of the customer
	 * @returns
	 */
	async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
		// Validate the caller
		if('RetailerMSP' != ctx.clientIdentity.mspId) {
			throw new Error('You are not authorized to perform this operation');
		}

		const retailerCompanyIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.companyid', [retailerCRN]);
		const retailerCompanyKey = await retailerCompanyIterator.next();
		if (!retailerCompanyKey) {
			throw new Error('Invalid Retailer CRN: ' +  retailerCRN);
		}

		const productId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.productid', [drugName, serialNo]);

		// Fetch product with given ID from blockchain
		let productAsBytes = await ctx.stub
			.getState(productId)
			.catch(err => console.log(err));
	
		// Make sure the product already exist.
		if (productAsBytes.length == 0) {
			throw new Error('The product is not added in the ledger. Drug Name: ' + drugName + ' and serialNo: ' + serialNo);
		} else {		
			let productObj = JSON.parse(productAsBytes.toString());
			if (productObj.owner != retailerCompanyKey.value.key) {
				throw new Error('You are not the retailer of this drug. Retailer CRN: ' +  retailerCRN);
			} else {
				productObj.owner = customerAadhar;
			}

			let dataBuffer = Buffer.from(JSON.stringify(productObj));
			await ctx.stub.putState(productId, dataBuffer);
			return productObj;
		}
	}

	/**
	 * View History of the drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo Serial number of the drug
	 * @returns
	 */
	async viewHistory(ctx, drugName, serialNo) {
		const productId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.productid', [drugName, serialNo]);
		let resultsIterator = await ctx.stub.getHistoryForKey(productId);
		let allResults = [];
		while (true) {
			let res = await resultsIterator.next();

			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));

				jsonRes.TxId = res.value.tx_id;
				jsonRes.Timestamp = res.value.timestamp;
				try {
					jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
				} catch (err) {
					console.log(err);
					jsonRes.Value = res.value.value.toString('utf8');
				}
				allResults.push(jsonRes);
			}
			if (res.done) {
				await resultsIterator.close();
				console.info(allResults);
				return allResults;
			}
		}
	}

	/**
	 * View Current state of the drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo Serial number of the drug
	 * @returns
	 */
	async viewDrugCurrentState(ctx, drugName, serialNo) {
		const productId = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.productid', [drugName, serialNo]);
		let drugAsBytes = await ctx.stub
			.getState(productId)
			.catch(err => console.log(err));
		if (drugAsBytes.length == 0) {
			throw new Error('The drug is not added in the ledger. Drug Name: ' + drugName);
		} else {
			return JSON.parse(drugAsBytes.toString());
		}
	}
}

module.exports = PharmanetContract;