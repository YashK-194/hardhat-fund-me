// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error FundMe__NotOwner(); // outside the contract

contract FundMe {
    using PriceConverter for uint256; // for .conversionRate()

    uint256 public constant MINIMUM_USD = 50 * 1e18; // constant value, needs to be initialised and value cannot change
    address[] private s_funders; // to keep track of all the funders
    mapping(address => uint256) private s_addressToAmountFunded; // mapping to keep track of which address paid how much
    address private immutable i_owner; // immutable value, value assigned in a different line and cannot be changed once assigned
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not the Owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    //function to send the funds
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didnt send enough amount"
        ); // 1e18 = 1 * 10 ** 18 == 1 ether in terms of wei
        // 1e18 == 1 eth
        s_funders.push(msg.sender); // msg.sender is the address of the address that called the function
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    //function to withdraw the funds
    function withdraw() public onlyOwner {
        //resetting the mapping
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        // resetting the mapping
        s_funders = new address[](0); // resets the funders array with zero addresses initalised

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Send failed");
    }

    function cheaperWithdraw() public onlyOwner {
        // creating a memory array for cheaper access
        address[] memory funders = s_funders;

        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Send failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 s_fundersIndex) public view returns (address) {
        return s_funders[s_fundersIndex];
    }

    function getAddressToAmountFunded(
        address funderAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funderAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
