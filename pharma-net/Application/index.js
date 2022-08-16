const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all function modules
const addToWallet_Manufacturer = require('./addToWallet_Manufacturer');
const addToWallet_Distributor = require('./addToWallet_Distributor');
const addToWallet_Retailer = require('./addToWallet_Retailer');
const addToWallet_Transporter = require('./addToWallet_Transporter');
const addToWallet_Consumer = require('./addToWallet_Consumer');
const registerCompany = require('./registerCompany.js');
const addDrug = require('./addDrug.js');
const createPO = require('./createPO.js');
const createShipment = require('./createShipment.js');
const updateShipment = require('./updateShipment.js');
const retailDrug = require('./retailDrug.js');
const viewHistory = require('./viewHistory.js');
const viewDrugCurrentState = require('./viewDrugCurrentState.js');
const helper = require('./contractHelper.js');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Drug Counterfeiting App');

app.get('/', (req, res) => res.send('Welcome to Pharma Network'));

app.post('/addToWallet', (req, res) => {
	const certificates  = helper.getCertificates(req.body.organisation);
	if (req.body.organisation == "Manufacturer") {
		addToWallet_Manufacturer.execute(certificates.certificatePath, certificates.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
	} else if (req.body.organisation == "Distributor") {
		addToWallet_Distributor.execute(certificates.certificatePath, certificates.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});		
	} else if (req.body.organisation == "Retailer") {
		addToWallet_Retailer.execute(certificates.certificatePath, certificates.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});		
	} else if (req.body.organisation == "Transporter") {
		addToWallet_Transporter.execute(certificates.certificatePath, certificates.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});		
	} else if (req.body.organisation == "Consumer") {
		addToWallet_Consumer.execute(certificates.certificatePath, certificates.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});		
	}
});


app.post('/registerCompany', (req, res) => {
	registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organisationRole, req.body.organisation)
		.then((newCompany) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (newCompany.error) {
				result = {
					status: 'Failure',
					message: 'Error while registering the company, condition to register company not fullfilled',
					error: newCompany.error,
					errorTrace: newCompany.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Company Registered',
					company: newCompany
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});


app.post('/addDrug', (req, res) => {
	addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.body.organisation)
		.then((newDrug) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (newDrug.error) {
				result = {
					status: 'Failure',
					message: 'Error while adding the drug, condition to add drug not fullfilled',
					error: newDrug.error,
					errorTrace: newDrug.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Drug added',
					drug: newDrug
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});

app.post('/createPO', (req, res) => {
	createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.organisation)
		.then((newPO) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (newPO.error) {
				result = {
					status: 'Failure',
					message: 'Error while creating the purchase order, condition to create purchase order not fullfilled',
					error: newPO.error,
					errorTrace: newPO.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Purchase order created',
					purchaseOrder: newPO
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});

app.post('/createShipment', (req, res) => {
	createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.body.organisation)
		.then((newShipment) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (newShipment.error) {
				result = {
					status: 'Failure',
					message: 'Error while creating the shipment, condition to create shipment not fullfilled',
					error: newShipment.error,
					errorTrace: newShipment.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Shipment created',
					shipment: newShipment
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});


app.post('/updateShipment', (req, res) => {
	updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.organisation)
		.then((shipment) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (shipment.error) {
				result = {
					status: 'Failure',
					message: 'Error while updating the shipment, condition to update shipment not fullfilled',
					error: shipment.error,
					errorTrace: shipment.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Shipment updated',
					updatedShipment: shipment
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});


app.post('/retailDrug', (req, res) => {
	retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.body.organisation)
		.then((sellDrug) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (sellDrug.error) {
				result = {
					status: 'Failure',
					message: 'Error while selling the drug to consumer, condition to sell the drug not fullfilled',
					error: sellDrug.error,
					errorTrace: sellDrug.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Drug sold to consumer',
					drugSold: sellDrug
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});

app.post('/viewHistory', (req, res) => {
	viewHistory.execute(req.body.drugName, req.body.serialNo, req.body.organisation)
		.then((history) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (history.error) {
				result = {
					status: 'Failure',
					message: 'Error while viewing the history of the drug, condition to view the history of the drug not fullfilled',
					error: history.error,
					errorTrace: history.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'History of drug displayed',
					history: history
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});

app.post('/viewDrugCurrentState', (req, res) => {
	viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo, req.body.organisation)
		.then((currentState) => {
			var result;
			//if the return object contains error property then return status = failure 
			//if return object doesn't have error property then return status = success
			//returnObject.errorTace property will print more detailed error or trace logs
			if (currentState.error) {
				result = {
					status: 'Failure',
					message: 'Error while viewing the current state of the drug, condition to view the current state of the drug not fullfilled',
					error: currentState.error,
					errorTrace: currentState.errorTrace
				};
			} else {
				result = {
					status: 'success',
					message: 'Current state of drug displayed',
					currentState: currentState
				};
			}
			res.json(result);
		})
		.catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		})

});

app.listen(port, () => console.log(`Distributed drug counterfeiting App listening on port ${port}!`));