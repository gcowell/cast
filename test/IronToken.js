var IronToken = artifacts.require("./IronToken.sol");

contract("IronToken", function(accounts) {
  it("should set the deployer", function() {
    var contract;
    return IronToken.deployed().then(function(instance) {
      contract = instance;
      return contract.getDeployer.call();
    }).then(function(addr) {
      assert.equal(addr, accounts[0], "Deployer was not set correctly");
    });
  });

});
