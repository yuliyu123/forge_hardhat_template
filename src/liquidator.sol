// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/interface.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IPoolAddressesProvider.sol";
import "./interfaces/IUiPoolDataProviderV3.sol";
import "./interfaces/IAaveOracle.sol";
import "forge-std/console.sol";


// todo
struct LiqudationData {
    address collateralAsset;
    address debtAsset;
    address user;
    uint256 debtToCover;
}

contract Liquidator {
    mapping (address => IUiPoolDataProviderV3.UserReserveData[]) userToUserReserveData;
    address owner;
    // ILendingPoolCore lendingPoolCore = ILendingPoolCore();
    IPoolAddressesProvider poolProvider = IPoolAddressesProvider(0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb);
    IUiPoolDataProviderV3 uniPoolProvider = IUiPoolDataProviderV3(0x145dE30c929a065582da84Cf96F88460dB9745A7);
    IAaveOracle oracle = IAaveOracle(0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7);
    IPool pool = IPool(0x794a61358D6845594F94dc1DB02A252b5b4814aD);
    address[] liquidatableUsers;
    LiqudationData liqudationData;

    modifier onlyOwner {
        require(msg.sender == owner, "not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // // https://github.com/aave/aave-protocol/blob/4b4545fb583fd4f400507b10f3c3114f45b8a037/contracts/lendingpool/LendingPoolCore.sol
    // function getUserUnderlyingAssetBalance(address collateral, address user) public returns (uint256) {
    //     return getUserUnderlyingAssetBalance(collateral, user);
    // }

    // function getUserBorrowBalances(address collateral, address user) public returns (uint256) {
    //     return getUserBorrowBalances(collateral, user);
    // }

    // https://docs.aave.com/developers/guides/liquidations
    // debtToCover = (userStableDebt + userVariableDebt) * LiquidationCloseFactor
    function getDebtToCover(IUiPoolDataProviderV3.UserReserveData memory userReserveData, uint256 LiquidationCloseFactor) public returns (uint256) {
       return (userReserveData.scaledVariableDebt + userReserveData.principalStableDebt) * LiquidationCloseFactor;
    }

    function maxAmountOfCollateralToLiquidate(uint256 debtAssetPrice, uint256 debtToCover, uint256 liquidationBonus, uint256 collateralPrice) public returns (uint256) {
        return (debtAssetPrice * debtToCover * liquidationBonus) / collateralPrice;
    }

    // get the maximum collateral asset and the maximum borrow asset to liquidate
    function getLiqudationsData(address user, IUiPoolDataProviderV3.UserReserveData[] memory userReserveData) public {
        require(userReserveData.length == 0, "not the user");

        address bestCollAsset;
        uint256 maxCollValue;
        address bestDebtAsset;
        uint256 maxDebtValue;
        for (uint i = 0; i < userReserveData.length; i++) {
            // get maximum collateral asset
            if (userReserveData[i].usageAsCollateralEnabledOnUser) {
                uint256 collValue = oracle.getAssetPrice(userReserveData[i].underlyingAsset) * userReserveData[i].scaledATokenBalance;
                if (maxCollValue < collValue) {
                    maxCollValue = collValue;
                    bestCollAsset = userReserveData[i].underlyingAsset;
                }
            } else {
                // get maximum borrow asset
                uint256 debtValue = getDebtToCover(userReserveData[i], 1);
                if (maxDebtValue < debtValue) {
                    maxDebtValue = debtValue;
                    bestDebtAsset = userReserveData[i].underlyingAsset;
                }
            }
        }

        liqudationData.debtAsset = bestDebtAsset;
        liqudationData.collateralAsset = bestCollAsset;
        liqudationData.debtToCover = maxDebtValue;
        liqudationData.user = user;
    }
    
    function getUserReserveData(address[] memory accounts) public {    
        require(accounts.length > 0, "no accounts");

        for (uint8 i = 0; i < accounts.length; ++i) {
            (,,,,, uint256 hf) = pool.getUserAccountData(accounts[i]);
            if (hf >= 1) {
                continue;
            }

            IUiPoolDataProviderV3.UserReserveData[] memory userReserveData = new IUiPoolDataProviderV3.UserReserveData[](0);
            (userReserveData,) = uniPoolProvider.getUserReservesData(poolProvider, liquidatableUsers[i]);
            userToUserReserveData[accounts[i]] = userReserveData;
        }
    }

    function start(address[] memory accounts) public onlyOwner {
        getUserReserveData(accounts);

        address[] memory assets = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory modes = new uint[](1);
        for (uint8 i = 0; i < accounts.length; ++i) {
            getLiqudationsData(accounts[i], userToUserReserveData[accounts[i]]);
            if (liqudationData.collateralAsset == address(0) || liqudationData.debtAsset == address(0) || liqudationData.debtToCover == 0 || liqudationData.user == address(0)) {
                continue;
            }

            assets[0] = liqudationData.debtAsset;
            amounts[0] = liqudationData.debtToCover;
            modes[0] = 0;
            pool.flashLoan(address(this), assets, amounts, modes, address(this), "", 0);
        }
    }

    function executeOperation(
        address[] calldata,
        uint256[] calldata,
        uint256[] calldata,
        address,
        bytes calldata
    ) external payable returns (bool) {
        require(msg.sender == address(pool), "not the flash loan provider");

        pool.liquidationCall(liqudationData.collateralAsset, liqudationData.debtAsset, liqudationData.user, liqudationData.debtToCover, false);
        return true;
    }
}
