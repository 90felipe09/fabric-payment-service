# Payment service

## Models

There are two models in this service:

- Commitment: It's an object type that defines what data must be present in a commitment to send to the smart contract. It's purpose is to declare download intention from the receiver Public Key;

- HashChain: It's a class that represents a hash chain. It contains n + 1 hashes. N hashes represent payment value and the last represents the hash root to include in the commitment object. It exposes the functionality of `payHash()` that returns a hash and self updates the hash to pay in the next use.