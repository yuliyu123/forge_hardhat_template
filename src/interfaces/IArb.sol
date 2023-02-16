// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IArb {
    function startArb() external returns (uint256);
    function dexTrade(bytes memory _data) external;
    function receiveLoan(bytes memory _data) external;
}
