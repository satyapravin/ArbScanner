require('dotenv').config()
const Web3 = require('web3');
const contracts = require('./assets.js')
const assets = new contracts.Assets()

const abi = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ]

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const contract = new web3.eth.Contract(abi);
contract.options.address = assets.getContractAddress(process.argv[2]);
console.log(contract.options.address, process.env.ADDRESS);
contract.methods.balanceOf(process.env.CONTRACT_ADDRESS).call(console.log);