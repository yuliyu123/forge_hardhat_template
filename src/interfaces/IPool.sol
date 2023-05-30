// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IPool {
    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken) external;

}
