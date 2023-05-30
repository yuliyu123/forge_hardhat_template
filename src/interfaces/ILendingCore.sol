// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ILendingPoolCore {
    function getUserUnderlyingAssetBalance(address _reserve, address _user) external view returns (uint256);
    function getUserBorrowBalances(address _reserve, address _user) external view returns (uint256, uint256, uint256);
}