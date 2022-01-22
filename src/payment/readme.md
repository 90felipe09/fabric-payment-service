# Payment Module

This module implements all the payfluxo protocol specification. It's the
integrator hub for the Torrente, Hyperledger and P2P modules. That's why
this is the most important module of this application.

## Connection Model

This module, invokes Hyperledger, P2P and Torrente singleton instances in
order to interact with them.

## Architecture Design

It makes intensive use of `Observables` in order to appropriatelly react to
p2p and torrente module notifications and messages.

The way that the protocols are implemented makes use of a
`Chain of Responsibility`.

### Models

There are two models in this service:

#### Commitment

It's a class that represents a commitment to send to the smart contract. It's purpose is to declare download intention from the receiver Public Key. It has a static method to assert message integrity and authenticity.;

#### HashChain

It's a class that represents a hash chain. It contains n + 1 hashes. N hashes represent payment value and the last represents the hash root to include in the commitment object. It exposes the functionality of `payHash()` that returns a hash and self updates the hash to pay in the next use.

#### PaymentNotificationModel

It's an object type that defines which data must be present when notifying a Torrente client application that it received a valid payment for a block.

### Controllers

#### SessionController

This controller controls the payment sending and payment receivement. It stores the user private key in order to sign it's payment operations.

It stores two lists: one of ReceiverController instances and another for PaymentController instances.

Each time the user knows it'll receive a payment from some user with a known public key, it may add a receivement listener for the given ip.

Each time the user wants to start a payment flow to a new peer, it may add a paymentController to the list of PaymentController instances.

The caller can invoke a payment use case for a given uploader by simply providing it uploaderPublicKey and torrentId.

#### PaymentController

This controller instantiate a hashChain of provided chain size and a signed commitment;

It may be connected to a connection socket module to emit payments to the peer and also register in the blockchain the commitment object.

#### ReceiverController

This controller has a list of payment hashes received. When it receives, it asserts if are valid;

It may be connected to a connection socket module to receive payment by peers and also check commitment validity in the blockchain;


## Tests Schema

In order to test this module there are two ways: the unit tests verify the
standalone components that can be tested separately such as `commitment`,
`hash chain` and the `declare download intention` protocol.

In order to fully test the protocol interaction, it comes with a script to be
executed directly with `npm emulate`. There will be a terminal
listening prompt waiting for commands. These commands emulate what the Torrente
can do. Amongst them follows:

- `authenticate`: will send authentication data to login;
- `close`:  will close the emulator
- `logout`: will clean credentials and turn off Payfluxo server;
- `intention <download size> <magnetic link>`: declare a download intention for a test download for the given magnetic link. Will freeze funds equal to the download size.
- `downloaded <amount of blocks> <ip> <magnetic link>`: declare that downloaded a block from given ip, for the given magnetic link. With a amounts of blocks higher than 1 will send every one in a row. Good for load balance tests;
- `redeem`: Asks to redeem all redeemable values that it can.
- `refresh`: Asks for the new wallet data;
