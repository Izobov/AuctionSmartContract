// SPDX-License_identifier: MIT

pragma solidity ^0.8.0;

contract AucEngine {
    address public owner;
    uint constant DURATION = 2 days;
    uint constant FEE = 10;

    struct Auction {
        address payable seller;
        uint startingPrice;
        uint finalPrice;
        uint startAt;
        uint endsAt;
        uint discountRate;
        string item;
        bool stopped;
    }
    event AuctionCreated(
        uint index,
        string itemName,
        uint startingPrice,
        uint duration
    );
    event AuctionEnded(uint index, uint price, address winner);

    Auction[] public auctions;

    constructor() {
        owner = msg.sender;
    }

    function createAuction(
        uint _startPrice,
        uint _discountRate,
        string calldata _item,
        uint _duration
    ) external {
        uint duration = _duration == 0 ? DURATION : _duration;

        require(
            _startPrice >= _discountRate * duration,
            "incorrect starting price"
        );

        Auction memory newAuction = Auction({
            seller: payable(msg.sender),
            startingPrice: _startPrice,
            finalPrice: _startPrice,
            discountRate: _discountRate,
            startAt: block.timestamp,
            endsAt: block.timestamp + duration,
            item: _item,
            stopped: false
        });
        auctions.push(newAuction);

        emit AuctionCreated(auctions.length - 1, _item, _startPrice, duration);
    }

    function getPrice(uint index) public view returns (uint) {
        Auction memory auction = auctions[index];
        require(!auction.stopped, "stopped!");
        uint elapsed = block.timestamp - auction.startAt;
        uint discount = auction.discountRate * elapsed;
        return auction.startingPrice - discount;
    }

    function buy(uint index) external payable {
        Auction storage a = auctions[index];
        require(!a.stopped, "stopped!");
        require(block.timestamp < a.endsAt, "ended!");

        uint price = getPrice(index);
        require(msg.value >= price, "not enough funds!");
        a.stopped = true;
        a.finalPrice = price;
        uint refund = msg.value - price;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }

        a.seller.transfer(price - ((price * FEE) / 100));

        emit AuctionEnded(index, price, msg.sender);
    }

    function withdraw(address payable _to) external {
        require(msg.sender == owner, "You are not owner");
        _to.transfer(address(this).balance);
    }
}
