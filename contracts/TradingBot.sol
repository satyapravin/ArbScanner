pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


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

contract DyDxPool is Structs {
    function getAccountWei(Info memory account, uint256 marketId) public view returns (Wei memory);
    function operate(Info[] memory, ActionArgs[] memory) public;
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see `ERC20Detailed`.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract DyDxFlashLoan is Structs {
    DyDxPool pool = DyDxPool(0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e);

    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    mapping(address => uint256) public currencies;

    constructor() public {
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
    event StartBalance(uint256 balance);
    event EndBalance(uint256 balance);
    event OneInchBeforeDAIBalance(uint256 balance);
    event OneInchAfterDAIBalance(uint256 balance);
    event OneInchBeforeWETHBalance(uint256 balance);
    event OneInchAfterWETHBalance(uint256 balance);
    event FlashTokenBeforeBalance(uint256 balance);
    event FlashTokenAfterBalance(uint256 balance);

    uint256 public loan;
//    uint256 reserve = 2 ether;


    // Addresses
    address payable OWNER;

    // OneInch Config
    address ONE_INCH_ADDRESS = 0x11111112542D85B3EF69AE05771c2dCCff4fAa26;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == OWNER, "caller is not the owner!");
        _;
    }

    // Allow the contract to receive Ether
    function () external payable {}

    constructor() public payable {
        OWNER = msg.sender;
    }
	
	function toUint256(bytes memory _bytes) internal pure returns (uint256 value) {
		assembly {
		value := mload(add(_bytes, 0x20))
		}
	}

    function getFlashloan(uint256 flashAmount, bytes calldata one, 
                          bytes calldata two, bytes calldata three, bytes calldata four) external payable onlyOwner {
        (address flashToken, bytes memory oneInch) = abi.decode(one, (address, bytes));
        uint256 balanceBefore = IERC20(flashToken).balanceOf(address(this));
        emit FlashTokenBeforeBalance(balanceBefore);
        bytes memory data = abi.encode(flashToken, balanceBefore, one, two, three, four);
        flashloan(flashToken, flashAmount, data);
    }

    function callFunction(
        address, /* sender */
        Info calldata, /* accountInfo */
        bytes calldata data
    ) external onlyPool {
        (address flashToken, uint256 balanceBefore, bytes memory one, bytes  memory two, bytes memory three, bytes memory four) = abi
        .decode(data, (address, uint256, bytes, bytes, bytes, bytes));

        uint256 balanceAfter = IERC20(flashToken).balanceOf(address(this));
        
		emit FlashTokenAfterBalance(balanceAfter);
        
		require(
            balanceAfter > balanceBefore,  "contract did not get the loan"
        );

        _trade(one);
		_trade(two);
        _trade(three);
		_trade(four);
		uint256 retval = IERC20(flashToken).balanceOf(address(this));
        emit EndBalance(retval);
        require(retval > balanceAfter, "Swap not profitable.");
    }
	
    function _trade(bytes memory data) internal {
        (address _fromToken, bytes memory _1inchData) = abi.decode(data, (address, bytes));
        if (_fromToken == address(0)) return;
        IERC20 _fromIERC20 = IERC20(_fromToken);
        uint256 balance = IERC20(_fromToken).balanceOf(address(this));
        _fromIERC20.approve(ONE_INCH_ADDRESS, balance);
        (bool success, bytes memory returndata) = ONE_INCH_ADDRESS.call.value(msg.value)(_1inchData);
        _fromIERC20.approve(ONE_INCH_ADDRESS, 0);
        require(success, string(abi.encodePacked('1INCH_SWAP_FAILED', string(returndata))));
    }

    function getWeth() public payable onlyOwner {
        _getWeth(msg.value);
    }

    function _getWeth(uint256 _amount) internal {
        (bool success,) = WETH.call.value(_amount)("");
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
        address(OWNER).transfer(balance);
    }
}