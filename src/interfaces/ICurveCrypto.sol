// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ICurveCrypto {
    function exchange(
        uint256 from,
        uint256 to,
        uint256 from_amount,
        uint256 min_to_amount
    ) external payable;

    function get_dy(
        uint256 from,
        uint256 to,
        uint256 from_amount
    ) external view returns (uint256);
}
