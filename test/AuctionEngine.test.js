const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction Engine", () => {
  let owner, buyer, seller, wallet, auct;
  const data = {
    startingPrice: ethers.parseEther("0.0001"),
    duration: 60,
    discountRate: 3,
    item: "House",
  };

  beforeEach(async () => {
    [owner, seller, buyer, wallet] = await ethers.getSigners();
    const AucEngine = await ethers.getContractFactory("AucEngine", owner);
    auct = await AucEngine.deploy();
    await auct.waitForDeployment();
  });

  it("set owner", async () => {
    const currentOwner = await auct.owner();
    expect(currentOwner).to.be.eq(owner.address);
  });

  it("creates auction", async () => {
    const { startingPrice, discountRate, item, duration } = data;
    const tx = await createAuction();
    const auction = await auct.auctions(item);
    const time = await getTimestamp(tx.blockNumber);
    expect(auction.startingPrice).to.eq(startingPrice);
    expect(auction.seller).to.eq(seller.address);
    expect(auction.startAt).to.eq(time);
    expect(auction.endsAt).to.eq(time + duration);
    expect(auction.discountRate).to.eq(discountRate);
    expect(auction.item).to.eq(item);
    expect(auction.stopped).to.be.false;
    expect(tx).to.emit(auct, "AuctionCreated");
  });

  it("allows to buy", async function () {
    await createAuction();
    const item = data.item;
    this.timeout(5000);
    await expect(
      auct.connect(buyer).buy(item, { value: 1 })
    ).to.be.revertedWith("not enough funds!");
    await delay(1000);
    const buyTx = await auct
      .connect(buyer)
      .buy(item, { value: data.startingPrice });
    const auction = await auct.auctions(item);
    const finalPrice = ethers.getNumber(auction.finalPrice);
    const fee = Math.floor((finalPrice * 10) / 100);
    const sellerAmount = finalPrice - fee;

    await expect(() => buyTx).to.changeEtherBalances(
      [seller, auct, buyer],
      [sellerAmount, fee, -finalPrice]
    );
    await expect(buyTx)
      .to.emit(auct, "AuctionEnded")
      .withArgs(item, finalPrice, buyer.address);
    expect(auction.stopped).to.be.true;
    await expect(
      auct.connect(buyer).buy(item, { value: data.startingPrice })
    ).to.be.revertedWith("stopped!");
    await expect(auct.connect(buyer).getPrice(item)).to.be.revertedWith(
      "stopped!"
    );
  });

  it("withdraw", async () => {
    await createAuction();
    const item = data.item;
    await auct.connect(buyer).buy(item, { value: data.startingPrice });
    const auction = await auct.auctions(item);
    const finalPrice = ethers.getNumber(auction.finalPrice);
    const fee = Math.floor((finalPrice * 10) / 100);
    await expect(
      auct.connect(seller).withdraw(wallet.address)
    ).to.be.revertedWith("You are not owner");

    const tx = auct.connect(owner).withdraw(wallet.address);
    expect(() => tx).to.changeEtherBalance(wallet, fee);
  });

  it("shouldn't allow to get buy when auction finished", async () => {
    await createAuction(1);
    await delay(2);
    await expect(
      auct.connect(buyer).buy(data.item, { value: 1 })
    ).to.be.revertedWith("ended!");
  });

  it("shouldn't allow to create auction with wrong price or discountRate", async () => {
    await expect(
      createAuction(data.duration, data.startingPrice)
    ).to.revertedWith("incorrect starting price");
  });

  async function createAuction(
    duration = data.duration,
    discountRate = data.discountRate
  ) {
    const { startingPrice, item } = data;
    const tx = await auct
      .connect(seller)
      .createAuction(startingPrice, discountRate, item, duration);
    return tx;
  }
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTimestamp(bn) {
  return (await ethers.provider.getBlock(bn)).timestamp;
}
