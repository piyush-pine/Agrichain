// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Placeholder for SustainabilityToken.sol - A simple ERC20 token
contract SustainabilityToken is ERC20, Ownable {
    constructor() ERC20("AgriClear Reward", "AGR") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
