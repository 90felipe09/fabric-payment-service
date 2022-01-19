type ClientProfile = {
    organization: string,
    connection: Object
}

type OrganizationProfile = {
    mspid: string,
    organizations: string[],
    certificateAuthorities: string[]
}

type OrganizationsProfile = {
    [key: string]: OrganizationProfile
}

type TLSCACerts = {
    pem: string
}

type TLSCACertsMultiple = {
    pem: string[]
}

type GRPCOptions = {
    "ssl-target-name-override": string,
    hostnameOverride: string
}

type PeerProfile = {
    url: string,
    tlsCACerts: TLSCACerts,
    grpcOptions: GRPCOptions
}

type PeerProfiles = {
    [key: string]: PeerProfile
}

type HTTPOptions = {
    verify: boolean
}

type CertificateAuthoritiesProfile = {
    url: string,
    caName: string,
    tlsCACerts: TLSCACertsMultiple,
    httpOptions: HTTPOptions
}

type CertificateAuthoritiesProfileObject = {
    [key: string]: CertificateAuthoritiesProfile
}

export type ConnectionProfile = {
    name: string,
    version: string,
    client: ClientProfile,
    organizations: OrganizationsProfile,
    peers: PeerProfiles,
    certificateAuthorities: CertificateAuthoritiesProfileObject
}
