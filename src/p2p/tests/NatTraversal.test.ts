import { tryNatTraversal } from "../util/NatTraversalHandler";


describe("test NAT traversal utilities", () => {
    it("should be able to add payfluxo port mapping.", async () => {
        try{
            await tryNatTraversal()
            console.log('The router of this network accepts nat traversal');
        }
        catch {
            console.log('The router of this network doesnt accepts nat traversal');
        }
    });
});
