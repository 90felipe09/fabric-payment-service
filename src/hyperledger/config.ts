// A ideia aqui é guardar os nomes padrão de como estariam lá na hyperledger que o toshi subiu.
// Se o nome do canal mudar ou do smart contract, só mudar aqui.

export const PAYMENT_CHANNEL="channel2"
export const CHAINCODE_ID="currency"
export const PAYMENT_INTENTION_CONTRACT="PaymentIntentionContract"
export const ACCOUNT_CONTRACT="AccountContract"
export const REDEEM_CONTRACT="RedeemContract"
// export const HYPERLEDGER_IP = "143.107.111.58"
export const HYPERLEDGER_DNS = "hyperledger.larc.usp.br"
export const HYPERLEDGER_IP = "http://hyperledger.larc.usp.br"
export const HYPERLEDGER_PORT = "7051"
export const HYPERLEDGER_CONNECTION_PROFILE_PORT = "3003"
export const HYPERLEDGER_CONNECTION_PROFILE_ENDPOINT = "connection-profile"

export const HYPERLEDGER_CONNECTION_PROFILE = `${HYPERLEDGER_IP}:${HYPERLEDGER_CONNECTION_PROFILE_PORT}/${HYPERLEDGER_CONNECTION_PROFILE_ENDPOINT}`
