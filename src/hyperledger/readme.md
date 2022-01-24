# Hyperledger module

The Hyperledger module has all the Hyperledger blockchain interaction logic in
order to payfluxo properly work.

## Connection model

Payfluxo connects to the Hyperledger Fabric blockchain by a gRPC connection.

By initializing a `HyperledgerPaymentService` and providing valid user
credentials, it starts a connection with the blockchain. This channel will be
used for smart contract calls and data blocks querying.

This module evaluates the blockchain when wants to query data and invokes
smart contract utilities when it's going to modify blockchain state.

## Architecture design

The `HyperledgerPaymentService` class is a `PaymentServiceInterface`
implementation. So, It's a `Facade` implementation. Plano C is another module
used for centralized communication. Since Plano C also implements
`PaymentServiceInterface`, it should behave towards Torrente equally.

## Tests specification

The objective of the automated tests for this module is to certify that it
appropriately call smart contract methods, retrieves data successfully and
updates blockchain world state.

`npm test hyperledger/tests`
