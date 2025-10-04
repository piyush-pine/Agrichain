// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EscrowPayment is ReentrancyGuard {
    struct Escrow {
        address payable buyer;
        address payable seller;
        uint256 amount;
        State state;
    }

    enum State {
        Created,
        Locked,
        DeliveryConfirmed,
        Released,
        Refunded
    }

    mapping(string => Escrow) public escrows;

    event EscrowInitiated(string indexed orderId, address indexed buyer, uint256 amount);
    event PaymentReleased(string indexed orderId, uint256 amount);
    event RefundIssued(string indexed orderId, uint256 amount);
    event DeliveryConfirmed(string indexed orderId, address indexed buyer);

    modifier onlyBuyer(string memory orderId) {
        require(msg.sender == escrows[orderId].buyer, "Only buyer can call this function");
        _;
    }
    
    modifier onlySeller(string memory orderId) {
        require(msg.sender == escrows[orderId].seller, "Only seller can call this function");
        _;
    }

    function initiateEscrow(string memory orderId, address _seller) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(escrows[orderId].buyer == address(0), "Escrow already initiated for this orderId");

        escrows[orderId] = Escrow({
            buyer: payable(msg.sender),
            seller: payable(_seller),
            amount: msg.value,
            state: State.Locked
        });

        emit EscrowInitiated(orderId, msg.sender, msg.value);
    }
    
    function confirmDelivery(string memory orderId) external onlyBuyer(orderId) nonReentrant {
        require(escrows[orderId].state == State.Locked, "Escrow not in locked state");
        escrows[orderId].state = State.DeliveryConfirmed;
        emit DeliveryConfirmed(orderId, msg.sender);

        // Directly call releasePayment to complete the process
        (bool success, ) = address(this).call(abi.encodeWithSignature("releasePayment(string)", orderId));
        require(success, "Internal call to releasePayment failed");
    }

    function releasePayment(string memory orderId) public nonReentrant {
        // This can now be called by anyone (including the internal call from confirmDelivery), but state check is key.
        require(escrows[orderId].state == State.DeliveryConfirmed, "Delivery not confirmed by buyer");
        
        escrows[orderId].state = State.Released;
        uint256 amount = escrows[orderId].amount;

        (bool sent, ) = escrows[orderId].seller.call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit PaymentReleased(orderId, amount);
    }

    function refund(string memory orderId) external onlySeller(orderId) nonReentrant {
        // For simplicity, we'll allow the seller to refund. In a real app, this would be more complex.
        require(escrows[orderId].state == State.Locked, "Escrow not in locked state");
        escrows[orderId].state = State.Refunded;
        uint256 amount = escrows[orderId].amount;

        (bool sent, ) = escrows[orderId].buyer.call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit RefundIssued(orderId, amount);
    }
}
