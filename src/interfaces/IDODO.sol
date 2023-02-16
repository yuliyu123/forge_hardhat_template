// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IDODO {
    function flashLoan(
        uint256 baseAmount,
        uint256 quoteAmount,
        address assetTo,
        bytes calldata data
    ) external;

    // wbnb-busd: wbnb -> base_token, busd-> quote token,
    // _BASE_RESERVE_: wbnb amount, _QUOTE_RESERVE_: busd amount
    function _BASE_TOKEN_() external view returns (address);
    function _BASE_RESERVE_() external view returns (uint112);
    function _QUOTE_TOKEN_() external view returns (address);
    function _QUOTE_RESERVE_() external view returns (uint112);
}
