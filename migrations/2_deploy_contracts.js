const Article = artifacts.require("./Article.sol");
const User = artifacts.require("./User.sol");



//module.exports = function(deployer, network, accounts) {
//  deployer.deploy(Article);
//};



//
//module.exports = (deployer, networks, accounts) => {
//    return deployer
//        .deploy(Article)
//        .deploy(User)
//        .then(() => {
//        [
//        'Article',
//        'User',
//        ].forEach((name) => {
//        const artifact = artifacts.require(`${name}.sol`);
//    const metaDataFile = `${__dirname}/../build/contracts/${name}.json`;
//    const metaData = require(metaDataFile);
//    metaData.networks[deployer.network_id] = {};
//    metaData.networks[deployer.network_id].address = artifact.address;
//    fs.writeFileSync(metaDataFile, JSON.stringify(metaData, null, 4));
//});
//}),


module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(Article);

    const metaDataFile = `${__dirname}/../build/contracts/Article.json`;
    const metaData = require(metaDataFile);
    metaData.networks[deployer.network_id] = {};
    metaData.networks[deployer.network_id].address = Article.address;
    fs.writeFileSync(metaDataFile, JSON.stringify(metaData, null, 4));
}





