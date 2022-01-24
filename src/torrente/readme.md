# Torrente module

The Torrente module has all the Torrente interaction logic in order to payfluxo
properly work.

## Connection model

Payfluxo connects to Torrente by a WebSocket connection.

By initializing a `ConnectionController`, it starts a WebSocket connection
with Torrente. This channel will be utilized to notify Torrente application
and receive Torrente commands messages.

This module adopts a nomenclature of messages as the data packets incoming
from Torrente towards Payfluxo while notifications are data packets coming
from Payfluxo to Torrente.

## Architecture design

The `torrenteConnection` WebSocket, the `MessagesHandler` and the
`NotificationsHandler` are unique and may be used along all the payfluxo.
For that reason, they are designed with a `Singleton` design pattern in order
to achieve this.

This module should only serve as the bridge to communicate with Torrente.
The only way to Payfluxo interact with this module should be by sending a notification object throught its `NotificationHandler`. The only way to Torrente interact with payfluxo is by sending a message object to its 
`MessageHandler` in order to it dispatch the appropriate reaction for the
message.

## Tests specification

The objective of the automated tests for this module is to certify that it
dispatches messages to appropriate handlers when Torrente requests and also
notifies appropriately Torrente when a notification comes.

In order to do that, it creates a `TorrenteInterfaceSimulator` that behaves
similarly to a Torrente instance connected to payfluxo in order to execute
tests.

In order to verify the correct functioning, instead of attaching this module
with other modules from Payfluxo, we attach it to a `TestProxy`.

`npm test torrente/tests`
