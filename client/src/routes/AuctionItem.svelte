<script>
  // @ts-nocheck

  import { auction } from "./../lib/stores/auction.js";
  import { wallet } from "$lib/stores/wallet";
  import { Card, GradientButton, Spinner } from "flowbite-svelte";
  import { ethers } from "ethers";

  export let item;
  $: ({ img, id, title, description, startPrice } = item);
  let pending = false;
  async function buy() {
    const price = await $auction?.getPrice(id);
    try {
      pending = true;
      await $auction?.buy(id, { value: price });
    } catch (e) {
      console.error(e.message);
    } finally {
      pending = false;
    }
  }
</script>

<Card {img}>
  <h2 class="text-lg text-gray-600 font-bold">{title}</h2>
  <p>{description}</p>
  <div class="flex justify-between items-center">
    <span class="text-2xl font-bold text-gray-900 dark:text-white"
      >{ethers.formatEther(BigInt(startPrice), "eth")} ETH</span
    >
    <GradientButton
      outline={false}
      disabled={!$wallet.account || pending}
      shadow
      color="blue"
      pill
      on:click={buy}
    >
      {#if pending}
        <Spinner color="gray" />
      {:else}
        Buy Now
      {/if}
    </GradientButton>
  </div>
</Card>
