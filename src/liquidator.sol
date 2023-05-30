// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// import "./interfaces/interface.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IPoolAddressesProvider.sol";
import "./interfaces/IUiPoolDataProviderV3.sol";

import "forge-std/console.sol";


contract Liquidator {
    AccountData[] accountDatas;
    address owner;
    address flashLoanProvider = address(0);
    IPoolAddressesProvider provider = IPoolAddressesProvider(0);
    IUiPoolDataProviderV3 uniPoolProvider = IUiPoolDataProviderV3(0);
    IAaveOracle oracle = IAaveOracle(0);
    IPool pool = IPool(0);
    address[] liquidatableUsers;

    // todo
    struct AccountData {
        uint256 hf;
        address collateralAsset;
        address debtAsset;
        address user;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getLiquidatable(address[] accounts) public {
        for (uint8 i = 0; i < accounts.length; ++i) {
            (,,,,, uint256b hf) = getUserAccountData(accounts[i]);
            if (hf >= 1) {
                continue;
            }
            liquidatableUsers.push(accounts[i]);
        }
    }

    function getDebtToCover(UserReserveData userReserveData) public returns (uint256) {
       return (userReserveData.userStableDebt + userReserveData.userStableDebt) * LiquidationCloseFactor;
    }

    function maxAmountOfCollateralToLiquidate(address debtAsset, uint256 debtToCover, uint256 liquidationBonus) public returns (uint256) {
        return (debtAssetPrice * debtToCover * liquidationBonus) / collateralPrice;
    }

    function getLiqudationData(UserReserveData[] userReserveData) public returns (address bestCollAsset, uint256 maxCollValue, address bestDebtAsset, uint256 maxDebtValue) {
        for (uint i = 0; i < userReserveData.length; i++) {
            // as collateral
            if (userReserveData[i].usageAsCollateralEnabledOnUser) {
                uint256 collValue = oracle.getAssetPrice(userReserveData[i].underlyingAsset) * userReserveData[i].currentATokenBalance;
                if (maxCollValue < collValue) {
                    maxCollValue = assetPrice;
                    bestCollAsset = userReserveData[i].underlyingAsset;
                }
            } else {
                // as borrow asset
                uint256 debtValue = getDebtToCover(userReserveData[i]);
                if (maxDebtValue < debtValue) {
                    maxDebtValue = debtValue;
                    bestDebtAsset = userReserveData[i].underlyingAsset;
                }
            }
        }
    }

    function getUserReserveData(address[] accounts) public {
        getLiquidatable(accounts);
        
        for (uint i = 0; i < liquidatableUsers.length; i++) {
            accountDatas.push(uniPoolProvider.getUserReservesData(liquidatableUsers[i]));
        }
    }

    function start(address collateralAsset, address debtAsset, address user) public onlyOwner {
        flashLoanProvider.flashLoan();
    }

    // flashloan cb
    function execution() {
        liqudate();
    }

    function liqudate(addres[] accounts) private {
        getLiquidatable(accounts);
        getUserReserveData(liquidatableUsers);
        getLiqudationData(accountDatas);
        pool.liquidationCall(collateralAsset, debtAsset, user, uint(-1), false);
    }
}
