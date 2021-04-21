pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
import './utils.sol';
import './IExchangeWrapper.sol';

interface Structs {
    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address srcReceiver;
        address dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 guaranteedAmount;
        uint256 flags;
        address referrer;
        bytes permit;
    }

    struct Val {
        uint256 value;
    }

    enum ActionType {
        Deposit, // supply tokens
        Withdraw, // borrow tokens
        Transfer, // transfer balance between accounts
        Buy, // buy an amount of some token (externally)
        Sell, // sell an amount of some token (externally)
        Trade, // trade tokens against another account
        Liquidate, // liquidate an undercollateralized or expiring account
        Vaporize, // use excess tokens to zero-out a completely negative account
        Call       // send arbitrary data to an address
    }

    enum AssetDenomination {
        Wei // the amount is denominated in wei
    }

    enum AssetReference {
        Delta // the amount is given as a delta from the current value
    }

    struct AssetAmount {
        bool sign; // true if positive
        AssetDenomination denomination;
        AssetReference ref;
        uint256 value;
    }

    struct ActionArgs {
        ActionType actionType;
        uint256 accountId;
        AssetAmount amount;
        uint256 primaryMarketId;
        uint256 secondaryMarketId;
        address otherAddress;
        uint256 otherAccountId;
        bytes data;
    }

    struct Info {
        address owner;  // The address that owns the account
        uint256 number; // A nonce that allows a single address to control many accounts
    }

    struct Wei {
        bool sign; // true if positive
        uint256 value;
    }
}

abstract contract DyDxPool is Structs {
    function getAccountWei(Info memory account, uint256 marketId) public virtual view returns (Wei memory);
    function operate(Info[] memory, ActionArgs[] memory) public virtual;
}


contract DyDxFlashLoan is Structs {
    DyDxPool pool = DyDxPool(0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e);
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    mapping(address => uint256) public currencies;

    constructor() {
        currencies[WETH] = 1;
        currencies[SAI] = 2;
        currencies[USDC] = 3;
        currencies[DAI] = 4;
    }

    modifier onlyPool() {
        require(
            msg.sender == address(pool),
            "FlashLoan: could be called by DyDx pool only"
        );
        _;
    }

    function tokenToMarketId(address token) public view returns (uint256) {
        uint256 marketId = currencies[token];
        require(marketId != 0, "FlashLoan: Unsupported token");
        return marketId - 1;
    }

    // the DyDx will call `callFunction(address sender, Info memory accountInfo, bytes memory data) public` after during `operate` call
    function flashloan(address token, uint256 amount, bytes memory data)
    internal
    {
        IERC20(token).approve(address(pool), amount + 1);
        Info[] memory infos = new Info[](1);
        ActionArgs[] memory args = new ActionArgs[](3);

        infos[0] = Info(address(this), 0);

        AssetAmount memory wamt = AssetAmount(
            false,
            AssetDenomination.Wei,
            AssetReference.Delta,
            amount
        );
        ActionArgs memory withdraw;
        withdraw.actionType = ActionType.Withdraw;
        withdraw.accountId = 0;
        withdraw.amount = wamt;
        withdraw.primaryMarketId = tokenToMarketId(token);
        withdraw.otherAddress = address(this);

        args[0] = withdraw;

        ActionArgs memory call;
        call.actionType = ActionType.Call;
        call.accountId = 0;
        call.otherAddress = address(this);
        call.data = data;

        args[1] = call;

        ActionArgs memory deposit;
        AssetAmount memory damt = AssetAmount(
            true,
            AssetDenomination.Wei,
            AssetReference.Delta,
            amount + 1
        );
        deposit.actionType = ActionType.Deposit;
        deposit.accountId = 0;
        deposit.amount = damt;
        deposit.primaryMarketId = tokenToMarketId(token);
        deposit.otherAddress = address(this);

        args[2] = deposit;

        pool.operate(infos, args);
    }
}

// SPDX-License-Identifier: MIT

contract TradingBot is DyDxFlashLoan {
    event FlashTokenBeforeBalance(uint256 balance);
    event FlashTokenAfterBalance(uint256 balance);
    event EndBalance(uint256 balance);

    uint256 public loan;

    // Addresses
    address OWNER;

    // Currencies
    mapping(uint8 => address) currencyAddresses;
    uint8[] currencyIds;

    // Exchange Wrappers
    mapping(uint8 => address) exchangeWrappers;
    uint8[] exchangeIds;

    constructor() {
        OWNER = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == OWNER, "caller is not the owner!");
        _;
    }

    function addCurrency(uint8 currencyId, address currencyAddress) external onlyOwner {
        currencyAddresses[currencyId] = currencyAddress;
        currencyIds.push(currencyId);
    }

    function addExchangeWrapper(uint8 exchangeId, address wrapper) external onlyOwner {
        exchangeWrappers[exchangeId] = wrapper;
        exchangeIds.push(exchangeId);
    }

    function removeCurrency(uint8 currencyId) external onlyOwner {
        delete currencyAddresses[currencyId];
        
        for(uint ii=0; ii < currencyIds.length; ++ii) {
            if (currencyIds[ii] == currencyId) {
                delete currencyIds[ii];
                break;
            }
        }
    }

    function removeExchangeWrapper(uint8 exchangeId) external onlyOwner {
        delete exchangeWrappers[exchangeId];

        for(uint ii=0; ii < exchangeIds.length; ++ii) {
            if (exchangeIds[ii] == exchangeId) {
                delete exchangeIds[ii];
                break;
            }
        }

    }

    function getCurrency(uint8 currencyId) external view onlyOwner returns (address) {
        return currencyAddresses[currencyId];
    }

    function getExchangeWrapper(uint8 exchangeId) external view onlyOwner returns (address) {
        return exchangeWrappers[exchangeId];
    }

    function getRate(uint8 fromToken, uint8 toToken, uint256 amount) external view onlyOwner returns(uint8, uint256) {
        address from = currencyAddresses[fromToken];
        address to = currencyAddresses[toToken];

        uint8 selection = 0;
        uint256 maxAmount = 0;

        for(uint8 ii = 0; ii < exchangeIds.length; ++ii) {

            IExchangeWrapper exchange = IExchangeWrapper(exchangeWrappers[exchangeIds[ii]]);
            
            uint256 returnAmount = exchange.getRate(from, to, amount);

            if (returnAmount > maxAmount) {
                maxAmount = returnAmount;
                selection = ii;
            }
        }

        return (selection, maxAmount);
    } 

    fallback () external payable {}

    receive() external payable {}

	function getFlashloan(uint256 flashAmount, uint8 firstToken, 
                          uint8[] calldata nextTokens, uint8[] calldata exchanges) external payable onlyOwner {
        address flashToken = currencyAddresses[firstToken];
        uint256 balanceBefore = IERC20(flashToken).balanceOf(address(this));
        emit FlashTokenBeforeBalance(balanceBefore);
        bytes memory data = abi.encode(flashToken, nextTokens, exchanges, balanceBefore);
        flashloan(flashToken, flashAmount, data);
    }

    function callFunction(
        address, /* sender */
        Info calldata, /* accountInfo */
        bytes calldata data
    ) external onlyPool {
        (address flashToken, uint8[] memory nextTokens, uint8[] memory exchanges, uint256 balanceBefore) = abi
        .decode(data, (address, uint8[], uint8[], uint256));

        uint256 balanceAfter = IERC20(flashToken).balanceOf(address(this));
        
		emit FlashTokenAfterBalance(balanceAfter);
        
		require(
            balanceAfter > balanceBefore,  "contract did not get the loan"
        );

        address from = flashToken;
        address to = flashToken;
        uint256 amount = balanceAfter;

        for(uint8 ii = 0; ii < exchanges.length; ++ii) {
            to = currencyAddresses[nextTokens[ii]];
            _trade(from, to, exchangeWrappers[exchanges[ii]], amount);
            from = to;
            amount = IERC20(from).balanceOf(address(this));
        }

        uint256 retval = IERC20(flashToken).balanceOf(address(this));
        emit EndBalance(retval);
        require(retval > balanceAfter, "Swap not profitable.");
    }
	
    function bytesToString(bytes memory byteCode) public pure returns(string memory stringData)
    {
        uint256 blank = 0; //blank 32 byte value
        uint256 length = byteCode.length;

        uint cycles = byteCode.length / 0x20;
        uint requiredAlloc = length;

        if (length % 0x20 > 0) //optimise copying the final part of the bytes - to avoid looping with single byte writes
        {
            cycles++;
            requiredAlloc += 0x20; //expand memory to allow end blank, so we don't smack the next stack entry
        }

        stringData = new string(requiredAlloc);

        //copy data in 32 byte blocks
        assembly {
            let cycle := 0

            for
            {
                let mc := add(stringData, 0x20) //pointer into bytes we're writing to
                let cc := add(byteCode, 0x20)   //pointer to where we're reading from
            } lt(cycle, cycles) {
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
                cycle := add(cycle, 0x01)
            } {
                mstore(mc, mload(cc))
            }
        }

        //finally blank final bytes and shrink size (part of the optimisation to avoid looping adding blank bytes1)
        if (length % 0x20 > 0)
        {
            uint offsetStart = 0x20 + length;
            assembly
            {
                let mc := add(stringData, offsetStart)
                mstore(mc, mload(add(blank, 0x20)))
                //now shrink the memory back so the returned object is the correct size
                mstore(stringData, length)
            }
        }
    }

    function _trade(address from, address to, address exchAddress, uint256 amount) internal {
        (bool success, bytes memory result) = exchAddress.delegatecall(abi.encodeWithSignature("swapTokens(address,address,uint256,address)", 
                                                      from, to, amount, address(this)));
        require(success, bytesToString(result));
    }

    function getWeth() public payable onlyOwner {
        _getWeth(msg.value);
    }

    function _getWeth(uint256 _amount) internal {
        (bool success,) = WETH.call{value:_amount}("");
        require(success, "failed to get weth");
    }

    // KEEP THIS FUNCTION IN CASE THE CONTRACT RECEIVES TOKENS!
    function withdrawToken(address _tokenAddress) public onlyOwner {
        uint256 balance = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).transfer(OWNER, balance);
    }

    // KEEP THIS FUNCTION IN CASE THE CONTRACT KEEPS LEFTOVER ETHER!
    function withdrawEther() public onlyOwner {
        address self = address(this);
        // workaround for a possible solidity bug
        uint256 balance = self.balance;
        payable(OWNER).transfer(balance);
    }
}