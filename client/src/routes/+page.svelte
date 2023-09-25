<script>
    import { Banner } from "flowbite-svelte";
import "../app.css";
  import Wallet from "./Wallet.svelte";

</script>
<Banner position="absolute" bannerType="cta" ><div >

      <p class="font-bold">Be careful: Use only localhost:8545!</p>
      <p>Do not send any real tokens to this smart contract!</p>
      <p>Add a new account: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d (import key)</p>
  </div></Banner>

<div class="p-24 w-full h-full bg-gray-400">
    <Wallet />
</div>
