<script>
    import { Banner } from "flowbite-svelte";
import "../app.css";
  import Wallet from "./Wallet.svelte";

</script>
<Banner position="absolute" bannerType="cta" > Be carfull and use only localhost:8545! Do not send any real tokens to this smart contract  </Banner>

<div class="p-24 w-full h-full bg-gray-400">
    <Wallet />
</div>
