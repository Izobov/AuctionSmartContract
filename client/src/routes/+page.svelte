<script>
  // @ts-nocheck
  import { wallet } from "$lib/stores/wallet";

  import { Banner } from "flowbite-svelte";
  import "../app.css";
  import Wallet from "./Wallet.svelte";
  import auctionABI from "$lib/contracts/AucEngine.json";
  import auctionAddress from "$lib/contracts/AucEngine-contract-address.json";
  import { auction } from "$lib/stores/auction";
  import { ethers } from "ethers";
  import { browser } from "$app/environment";

  export let data;

  $: auctions = data.auctions;
  let provider;
  $: if (browser) {
    if (window.ethereum === undefined) {
      $wallet.networkError = "Please install Metamask!";
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
  }
</script>

<Banner position="absolute" bannerType="cta"
  ><div>
    <p class="font-bold">Be careful: Use only localhost:8545!</p>
    <p>Do not send any real tokens to this smart contract!</p>
    <p>
      Add a new account:
      0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d (import
      key)
    </p>
  </div></Banner
>

<div class="p-24 w-full h-full bg-gray-400">
  <Wallet {provider} />
  <!-- {#each auctions as auction}
    <h2>{auction.title}</h2>
    <span>{auction.id}</span>
    <p>{auction.description}</p>
  {/each} -->
</div>
