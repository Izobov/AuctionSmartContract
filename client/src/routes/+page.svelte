<script>
  // @ts-nocheck
  import { wallet } from "$lib/stores/wallet";

  import { Banner, GradientButton, Card, TabItem, Tabs } from "flowbite-svelte";
  import "../app.css";
  import Wallet from "./Wallet.svelte";
  import auctionABI from "$lib/contracts/AucEngine.json";
  import auctionAddress from "$lib/contracts/AucEngine-contract-address.json";
  import { auction } from "$lib/stores/auction";
  import { ethers } from "ethers";
  import { browser } from "$app/environment";
  import AuctionItem from "./AuctionItem.svelte";

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
  let active = [];
  let closed = [];
  $: auctions.forEach((a) => (a.stopped ? closed.push(a) : active.push(a)));
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

<div
  class="px-24 py-10 w-full h-full bg-gray-200 overflow-hidden flex flex-col"
>
  <Wallet {provider} />
  <div class="mt-6 overflow-hidden grow">
    <Tabs
      style="full"
      defaultClass="flex  rounded-lg bg-gray-50 shadow"
      contentClass="h-5/6 overflow-auto bg-gray-50 mt-3 p-4"
    >
      <TabItem
        class="w-full"
        activeClasses="w-full inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-4  border-b-2 border-blue-600 dark:text-primary-500 dark:border-primary-500 active text-blue-600"
        open
        title="Active"
      >
        <div class="h-full overflow-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {#each active as item}
            <AuctionItem {item} />
          {/each}
        </div>
      </TabItem>
      <TabItem
        class="w-full"
        title="Closed"
        activeClasses="w-full inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-4  border-b-2 border-blue-600 dark:text-primary-500 dark:border-primary-500 active text-blue-600"
      />
    </Tabs>
  </div>
  <!-- {#each auctions as auction}
    <h2>{auction.title}</h2>
    <span>{auction.id}</span>
    <p>{auction.description}</p>
  {/each} -->
</div>
