import { tryNatTraversal } from "../NatTraversalHandler";


describe("test NAT traversal utilities", () => {
    it("should be able to add payfluxo port mapping.", async () => {
        await tryNatTraversal()
    });
});
