# Payment service

## Models

There are two models in this service:

### Commitment

It's a class that represents a commitment to send to the smart contract. It's purpose is to declare download intention from the receiver Public Key. It has a static method to assert message integrity and authenticity.;

### HashChain

It's a class that represents a hash chain. It contains n + 1 hashes. N hashes represent payment value and the last represents the hash root to include in the commitment object. It exposes the functionality of `payHash()` that returns a hash and self updates the hash to pay in the next use.

### PaymentNotificationModel

It's an object type that defines which data must be present when notifying a Torrente client application that it received a valid payment for a block.

## Controllers

### SessionController

This controller controls the payment sending and payment receivement. It stores the user private key in order to sign it's payment operations.

It stores two lists: one of ReceiverController instances and another for PaymentController instances.

Each time the user knows it'll receive a payment from some user with a known public key, it may add a receivement listener for the given ip.

Each time the user wants to start a payment flow to a new peer, it may add a paymentController to the list of PaymentController instances.

The caller can invoke a payment use case for a given uploader by simply providing it uploaderPublicKey and torrentId.

### PaymentController

This controller instantiate a hashChain of provided chain size and a signed commitment;

It may be connected to a connection socket module to emit payments to the peer and also register in the blockchain the commitment object.

### ReceiverController

This controller has a list of payment hashes received. When it receives, it asserts if are valid;

It may be connected to a connection socket module to receive payment by peers and also check commitment validity in the blockchain;

## Connections

### TorrentePaymentReceivedSocket

This connection is an IPC over port 7700 to communicate with Torrente client aplication. It is the channel used to send notification objects informing that a payment hash from a given ip was accepted.

It only emits messages in PaymentNotificationModel format.

### PaymentPeerConnection

Represents the connection estabilisher with peer connections for payments.

### HyperledgerConnection

Represents the connection gRPC estabilished with the blockchain