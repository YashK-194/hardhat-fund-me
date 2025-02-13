const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },

    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
};

// for mocks
// MockV3Aggregator takes 2 arguements: Decimal places and the intial amount of eth in usd
const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8; // decimal places
const INITIAL_ANSWER = 200000000000; // price of 1 eth in usd that we want to set for mocks

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
