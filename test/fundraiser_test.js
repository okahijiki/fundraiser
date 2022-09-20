const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", accounts => {
 let fundraiser;
 const name =  "Beneficiary Name";


 beforeEach(async () => {
   fundraiser = await FundraiserContract.new(
     name,
   )
 });

 describe("initialization", () => {
   it("gets the beneficiary name", async () => {
     const actual = await fundraiser.name();
     assert.equal(actual, name, "names should match");
   });
 });
});;
