//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import './IExchangeWrapper.sol';
import './Withdrawer.sol';


abstract contract IBancorContractRegistry {
    function addressOf(bytes32 contractName) external virtual view returns (address);
}

/*
    ERC20 Standard Token interface
*/
abstract contract IERC20Token {
    // these functions aren't abstract since the compiler emits automatically generated getter functions as external
    function name() public virtual view returns (string memory);
    function symbol() public virtual view returns (string memory);
    function decimals() public virtual view returns (uint8);
    function totalSupply() public virtual view returns (uint256);
    function balanceOf(address _owner) public virtual view returns (uint256);
    function allowance(address _owner, address _spender) public virtual view returns (uint256);

    function transfer(address _to, uint256 _value) public virtual returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public virtual returns (bool success);
    function approve(address _spender, uint256 _value) public virtual returns (bool success);
}

// File: contracts/IBancorNetwork.sol
/*
    Bancor Network interface
*/
abstract contract BancorNetwork {
    function conversionPath(IERC20Token _sourceToken, IERC20Token _targetToken) public virtual view returns (address[] memory);
    function rateByPath(IERC20Token[] calldata _path, uint256 _amount) public virtual view returns (uint256);
    function convertByPath(IERC20Token[] calldata _path, uint256 _amount, uint256 _minReturn, address _beneficiary, address _affiliateAccount, uint256 _affiliateFee)
        public virtual payable returns (uint256);
}

contract BancorWrapper is IExchangeWrapper, Withdrawer {

    constructor() {
    }

    function getRate(address fromToken, address toToken, uint256 amount) override external view returns (uint256) {

        address bancorRegistryAddress = 0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4;
        IBancorContractRegistry bancorRegistry = IBancorContractRegistry(bancorRegistryAddress);
        address bancorNetworkAddress = bancorRegistry.addressOf('BancorNetwork');
        BancorNetwork bancor = BancorNetwork(bancorNetworkAddress);

        address[] memory path = bancor.conversionPath(IERC20Token(fromToken), IERC20Token(toToken));

        if (path.length == 0) return 0;
        IERC20Token[] memory tokenPaths = new IERC20Token[](path.length);
        for (uint ii=0; ii < path.length; ++ii) tokenPaths[ii] = IERC20Token(path[ii]);
        return bancor.rateByPath(tokenPaths, amount);
    }

    function swapTokens(address fromToken, address toToken, uint256 amount, address to) override public payable {
        address bancorRegistryAddress = 0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4;
        IBancorContractRegistry bancorRegistry = IBancorContractRegistry(bancorRegistryAddress);
        address bancorNetworkAddress = bancorRegistry.addressOf('BancorNetwork');
        BancorNetwork bancor = BancorNetwork(bancorNetworkAddress);

        address[] memory path = bancor.conversionPath(IERC20Token(fromToken), IERC20Token(toToken));
        IERC20Token[] memory tokenPaths = new IERC20Token[](path.length);
        for (uint ii=0; ii < path.length; ++ii) tokenPaths[ii] = IERC20Token(path[ii]);
        
        IERC20 fromERC20 = IERC20(fromToken);
        fromERC20.approve(bancorNetworkAddress, amount);
        bancor.convertByPath(tokenPaths, amount, 1, address(0), address(0), 0);
        fromERC20.approve(bancorNetworkAddress, 0);
    }
}
