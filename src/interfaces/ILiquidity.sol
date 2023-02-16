// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ILiquidity {
    function borrow(
        address _token,
        uint256 _amount,
        bytes calldata _data
    ) external;
}
