#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Updating Chaincode CERTNET On Pharma Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="pharmachannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="Manufacturer Distributor Retailer Transporter Consumer"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "New Version : "$VERSION

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 and peer1 of all 5 orgs making them endorsers
echo "Installing chaincode on peer0.manufacturer.pharma-network.com ..."
installChaincode 0 'Manufacturer' $VERSION
echo "Installing chaincode on peer1.manufacturer.pharma-network.com ..."
installChaincode 1 'Manufacturer' $VERSION
echo "Installing chaincode on peer0.distributor.pharma-network.com ..."
installChaincode 0 'Distributor' $VERSION
echo "Installing chaincode on peer1.distributor.pharma-network.com ..."
installChaincode 1 'Distributor' $VERSION
echo "Installing chaincode on peer0.retailer.pharma-network.com ..."
installChaincode 0 'Retailer' $VERSION
echo "Installing chaincode on peer1.retailer.pharma-network.com ..."
installChaincode 1 'Retailer' $VERSION
echo "Installing chaincode on peer0.transporter.pharma-network.com ..."
installChaincode 0 'Transporter' $VERSION
echo "Installing chaincode on peer1.transporter.pharma-network.com ..."
installChaincode 1 'Transporter' $VERSION
echo "Installing chaincode on peer0.consumer.pharma-network.com ..."
installChaincode 0 'Consumer' $VERSION
echo "Installing chaincode on peer1.consumer.pharma-network.com ..."
installChaincode 1 'Consumer' $VERSION

# Upgrade chaincode on the channel using peer0.manufacturer
echo "Upgrading chaincode on channel using peer0.manufacturer.pharma-network.com ..."
upgradeChaincode 0 'Manufacturer' $VERSION

echo
echo "========= All GOOD, Chaincode PHARMANET Is Now Updated To Version '$VERSION' =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
