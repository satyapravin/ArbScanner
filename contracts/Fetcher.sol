//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./IExchangeWrapper.sol";
import "./Withdrawer.sol";

contract Fetcher is Withdrawer{
    mapping(uint8 => address) currencies;
    uint8[] currencyIds;

    mapping(uint8 => address) exchangeWrappers;
    uint8[] exchanges;

    modifier onlyOwner() {
        require(msg.sender == OWNER, "caller is not the owner!");
        _;
    }

    function addCurrency(uint8 currencyId, address currencyAddress) external onlyOwner {
        currencies[currencyId] = currencyAddress;
        currencyIds.push(currencyId);
    }

    function addExchangeWrapper(uint8 exchangeId, address wrapper) external onlyOwner {
        exchangeWrappers[exchangeId] = wrapper;
        exchanges.push(exchangeId);
    }

    function removeCurrency(uint8 currencyId) external onlyOwner {
        delete currencies[currencyId];
        
        for(uint ii=0; ii < currencyIds.length; ++ii) {
            if (currencyIds[ii] == currencyId) {
                delete currencyIds[ii];
                break;
            }
        }
    }

    function removeExchangeWrapper(uint8 exchangeId) external onlyOwner {
        delete exchangeWrappers[exchangeId];

        for(uint ii=0; ii < exchanges.length; ++ii) {
            if (exchanges[ii] == exchangeId) {
                delete exchanges[ii];
                break;
            }
        }

    }

    function getCurrency(uint8 currencyId) external view onlyOwner returns (address) {
        return currencies[currencyId];
    }

    function getExchangeWrapper(uint8 exchangeId) external view onlyOwner returns (address) {
        return exchangeWrappers[exchangeId];
    }

    function getRate(uint8 fromToken, uint8 toToken, uint256 amount) external onlyOwner returns(uint256) {
        address from = currencies[fromToken];
        address to = currencies[toToken];

        uint256 maxAmount = 0;

        for(uint ii = 0; ii < exchanges.length; ++ii) {
            IExchangeWrapper exchange = IExchangeWrapper(exchangeWrappers[exchanges[ii]]);
            uint256 returnAmount = exchange.getRate(from, to, amount);

            if (returnAmount > maxAmount) {
                maxAmount = returnAmount;
            }
        }

        return maxAmount;
    }    
}