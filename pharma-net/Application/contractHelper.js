const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway, DefaultEventHandlerStrategies } = require('fabric-network');
const path = require('path'); 
let gateway;


async function getContractInstance(orgName) {
	
	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-$(orgName).yaml
	gateway = new Gateway();
	
	if (orgName == "Manufacturer") {
		var wallet = new FileSystemWallet('./identity/manufacturer');
		var fabricUserName = 'MANUFACTURER_ADMIN';
		var connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-manufacturer.yaml', 'utf8'));
	} else if (orgName == "Distributor") {
		var wallet = new FileSystemWallet('./identity/distributor');
		var fabricUserName = 'DISTRIBUTOR_ADMIN';
		var connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-distributor.yaml', 'utf8'));
	} else if (orgName == "Retailer") {
		var wallet = new FileSystemWallet('./identity/retailer');
		var fabricUserName = 'RETAILER_ADMIN';
		var connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-retailer.yaml', 'utf8'));
	} else if (orgName == "Transporter") {
		var wallet = new FileSystemWallet('./identity/transporter');
		var fabricUserName = 'TRANSPORTER_ADMIN';
		var connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-transporter.yaml', 'utf8'));
	} else if (orgName == "Consumer") {
		var wallet = new FileSystemWallet('./identity/consumer');
		var fabricUserName = 'CONSUMER_ADMIN';
		var connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-consumer.yaml', 'utf8'));
	}
	
	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true },
		eventHandlerOptions: {
			commitTimeout: 300,
      		endorseTimeout: 300,
			strategy: DefaultEventHandlerStrategies.PREFER_MSPID_SCOPE_ANYFORTX,
		}
	};
	
	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);
	
	// Access pharma channel
	console.log('.....Connecting to channel - pharmachannel');
	const channel = await gateway.getNetwork('pharmachannel');
	
	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to Pharmanet Smart Contract');
	const contract = await channel.getContract('pharmanet', 'org.pharma-network.pharmanet');
	return contract;
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

function getCertificates(orgName) {
	const crypto_materials = path.resolve(__dirname, '../Network/crypto-config'); // Directory where all Network artifacts are stored
	if (orgName == "Manufacturer") {
		var certificatePath = crypto_materials + "/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem";
		var privateKeyPath = crypto_materials + "/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/";
	} else if (orgName == "Distributor") {
		var certificatePath = crypto_materials + "/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem";
		var privateKeyPath = crypto_materials + "/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/";
	} else if (orgName == "Retailer") {
		var certificatePath = crypto_materials + "/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/signcerts/Admin@retailer.pharma-network.com-cert.pem";
		var privateKeyPath = crypto_materials + "/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/keystore/";
	} else if (orgName == "Transporter") {
		var certificatePath = crypto_materials + "/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem";
		var privateKeyPath = crypto_materials + "/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/";
	} else if (orgName == "Consumer") {
		var certificatePath = crypto_materials + "/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/signcerts/Admin@consumer.pharma-network.com-cert.pem";
		var privateKeyPath = crypto_materials + "/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/keystore/";
	}

	const files = fs.readdirSync(privateKeyPath);
	privateKeyPath = privateKeyPath + files[0];
	
	return {
		'certificatePath': certificatePath,
		'privateKeyPath': privateKeyPath
	};

}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;
module.exports.getCertificates = getCertificates;