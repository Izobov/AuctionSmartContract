<script>
  // @ts-nocheck

  import { ethers } from "ethers";
  import { GradientButton } from "flowbite-svelte";
  import { wallet, initWalletState } from "$lib/stores/wallet";
  import auctionABI from "$lib/contracts/AucEngine.json";
  import auctionAddress from "$lib/contracts/AucEngine-contract-address.json";
  import { auction } from "$lib/stores/auction";

  const HARDHAT_NETWORK = "31337";
  const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
  export let provider;

  async function connect() {
    const [acc] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK) {
      return ($wallet.networkError =
        "Please change your network to localhost:8545!");
    }
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) return reset();
    });
    window.ethereum.on("chainChanged", () => {
      return reset();
    });
    window.ethereum.on("disconnect", () => reset());
    init(acc);
  }

  function reset() {
    wallet(initWalletState);
  }

  async function init(address) {
    $wallet.account = address;
    const contract = new ethers.Contract(
      auctionAddress.AucEngine,
      auctionABI.abi,
      await provider.getSigner(0)
    );
    // @ts-ignore
    $auction = contract;
    await updateBalance();
  }

  async function updateBalance() {
    const balance = await provider.getBalance($wallet.account);
    const b = ethers.formatEther(balance);
    console.log(b);
    $wallet.balance = `${ethers.formatEther(balance)} ETH`;
  }
</script>

<div>
  {#if !$wallet.account && !$wallet.balance}
    <GradientButton on:click={connect} outline={false} shadow color="blue" pill>
      Connect Wallet!</GradientButton
    >
  {:else}
    <div class="text-3xl text-gray-800 font-bold">My Balance:</div>
    <div class="text-xs font-medium text-gray-600">{$wallet.account}</div>
    <div class="text-xl font-medium text-gray-600">
      {$wallet.balance || `0 ETH`}
    </div>
  {/if}
</div>
