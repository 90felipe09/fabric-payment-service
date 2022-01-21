# p2p service

This module corresponds to the P2P communication module. It connects and is
connected by other payfluxos applications.

## Connection Model

Since it's a p2p module, when initialized it tries applying 3 NAT traversal
techniques at once: `UPnP`, `NAT-PMP` and `PCP`. Connections with peer payfluxo
applications are given in a `WebSocket` model.

## Architecture Design

Every connection established with payfluxo is registered as a 
`ConnectionResource` object that contains the WebSocket connection and an
observable `Subject`: a `ConnectionNotifier`. It stores the received messages
from the WebSocket. Every time a message is received, the `ConnectionNotifier`
object notifies all observer objects that are attached to it. This design
pattern is adopted in order to viabilize the protocol implementation to
be notified by incoming messages through each connection.

## Tests Schema

The tests seeks to verify that the `PayfluxoServer` can initialize and send
messages when asked by the `PayfluxoInterface`. It is simulated against a
`PayfluxoConnectionSimulator`

The tests only verifies loosely if the NAT device from the network accepts
programatic port forwarding and if these communication operations from the 
`PayfluxoServer` is working.
