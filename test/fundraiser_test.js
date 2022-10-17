const FundraiserContract = artifacts.require("Fundraiser");
const truffleAssert = require('truffle-assertions');


contract("Fundraiser", accounts => {
  let fundraiser;
  const name =  "Beneficiary Name";
  const url = "beneficiaryname.org";
  const imageURL = "https://placekitten.com/600/350";
  const description = "Beneficiary description";
  const beneficiary = accounts[1];
  const owner = accounts[0];

  beforeEach(async () => {
    fundraiser = await FundraiserContract.new(
      name,
      url,
      imageURL,
      description,
      beneficiary,
      owner
    )
  });

  describe("initialization", () => {
    it("gets the beneficiary name", async () => {
      const actual = await fundraiser.name();
      assert.equal(actual, name, "names should match");
    });

    it("gets the beneficiary url", async () => {
      const actual = await fundraiser.url();
      assert.equal(actual, url, "url should match");
    });

    it("gets the beneficiary image url", async () => {
      const actual = await fundraiser.imageURL();
      assert.equal(actual, imageURL, "imageURL should match");
    });

    it("gets the beneficiary description", async () => {
      const actual = await fundraiser.description();
      assert.equal(actual, description, "description should match");
    });

    it("gets the beneficiary", async () => {
      const actual = await fundraiser.beneficiary();
      assert.equal(actual, beneficiary, "beneficiary addresses should match");
    });

    it("gets the owner", async () => {
      const actual = await fundraiser.owner();
      assert.equal(actual, owner, "bios should match");
    });
  });

  describe("setBeneficiary", () => {
    const newBeneficiary = accounts[2];

    it("updated beneficiary when called by owner account", async () => {
      await fundraiser.setBeneficiary(newBeneficiary, {from: owner});
      const actualBeneficiary = await fundraiser.beneficiary();
      assert.equal(actualBeneficiary, newBeneficiary, "beneficiaries should match");
    });

    it("throws and error when called from a non-owner account", async () => {
    await truffleAssert.fails(
      fundraiser.setBeneficiary(newBeneficiary, { from: accounts[3]}),
        truffleAssert.ErrorType.REVERT,
        "Ownable: caller is not the owner"
      );
  });

    describe("making donations",()=>{
      const value = web3.utils.toWei('0.0289');
      const donor = accounts[2];

      it("increases myDonationsCount", async () => {
            const currentDonationsCount = await fundraiser.myDonationsCount(
              {from: donor}
            );
            await fundraiser.donate({from: donor, value});
            const newDonationsCount = await fundraiser.myDonationsCount({from: donor});

            assert.equal(
              1,
              newDonationsCount - currentDonationsCount,
              "myDonationsCount should increment by 1");
          });

        it("includes donation in myDonations", async () => {
            await fundraiser.donate({from: donor, value});
            const {values, dates} = await fundraiser.myDonations(
              {from: donor}
            );

            assert.equal(
              value,
              values[0],
              "values should match"
            );
            assert(dates[0], "date should be present");
          });


        describe("making donations", ()=>{

          it("emits the DonationReceived event", async() => {
            const tx = await fundraiser.donate({from: donor, value});
            const expectedEvent = "DonationReceived";
            const actualEvent = tx.logs[0].event;

            assert.equal(actualEvent,expectedEvent, "events should match")
          });

          it("increase donationCount", async()=>{
            const currentDonationsCount = await fundraiser.donationsCount();
            await fundraiser.donate({from: donor, value});
            const newDonationsCount =await fundraiser.donationsCount();

            assert.equal(
              1,newDonationsCount-currentDonationsCount,
              "donationsCount should increment by 1"
            );
          });

          it("increase the totalDonations amaount", async()=>{
            const currentTotalDonations = await fundraiser.totalDonations();
            await fundraiser.donate({from: donor, value});
            const newTotakDonations = await fundraiser.totalDonations();

            const diff = newTotakDonations - currentTotalDonations;

            assert.equal(
              diff,
              value,
              "difference should match the donation value"
               );
             });
           });

          describe("withdrawing funds",()=>{
          beforeEach(async()=>{
            await fundraiser.donate(
            {from: accounts[2], value: web3.utils.toWei('0.1')}
          );
        });

          describe("accsess controals", ()=>{
            it("throw an error when called from non-owner account", async()=>{
              await truffleAssert.fails(
              fundraiser.withdraw({from:accounts[3]}),
              truffleAssert.ErrorType.REVERT,
              "Ownable: caller is not the owner"
               );
              });
           });

            it("emits withdraw event", async() =>{
              const tx = await fundraiser.withdraw({from: owner});
              const expectedEvent = "Withdraw";
              const actualEvent = tx.logs[0].event;

              assert.equal(
                actualEvent,
                expectedEvent,
                "event should match"
              );
            })



            it("permits the owner to call the function",async()=>{
              try{
              await fundraiser.withdraw({from:owner});
              assert(true, "no errors were thrown");
              }catch(err){
              assert.fail("should not have thrown owner")
            };
          });


            it("transfers balance to beneficiary", async () => {
            const currentContractBalance = await web3.eth.getBalance(fundraiser.address);
            const currentBeneficiaryBalance = await web3.eth.getBalance(beneficiary);

            await fundraiser.withdraw({from: owner});

            const newContractBalance = await web3.eth.getBalance(fundraiser.address);
            const newBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
            const beneficiaryDifference = newBeneficiaryBalance - currentBeneficiaryBalance;

            assert.equal(
            newContractBalance,
            0,
            "contract should have a 0 balance"
            );
            assert.equal(
            beneficiaryDifference,
            currentContractBalance,
            "beneficiary should receive all the funds"
            );
          });
      　
        });
      });
    });
  });
