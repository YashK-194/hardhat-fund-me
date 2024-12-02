// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // function to get the current price of 1 ethereum in USD
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        // we are assuming that the contract at this address will have the functionality of Aggregator interface
        // AggregatorV3Interface pricefeed = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306
        // );

        // latestRoundData() returns a bunch of data, we only need to capture the answer variable which is the price of eth in usd
        (, int answer, , , ) = priceFeed.latestRoundData();

        // typecasting to uint256
        return uint256(answer * 1e10); // since msg.value has 18 zeros and the answer variable has 8 (multiplying with 10 raised to power 10)
    }

    // converting msg.value from eth to usd
    // we will pass it some amount in eth and it will return the equivalent in USD
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18; // always multiply before dividing in solidity
        return ethAmountInUSD; // returns with 18 zeros to represent decimal places
    }
}
