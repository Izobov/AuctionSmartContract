<script>
// @ts-nocheck

	import { ethers } from 'ethers';
    import { GradientButton } from 'flowbite-svelte';
  import { wallet, initWalletState } from '$lib/stores/wallet';
    import auctionABI from '$lib/contracts/AucEngine.json';
    import auctionAddress from '$lib/contracts/AucEngine-contract-address.json';

    const HARDHAT_NETWORK = "31337";
    const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
    let provider;


    async function connect() {
        if (window.ethereum === undefined) return $wallet.networkError = "Please install Metamask!"
            const [acc] = await  window.ethereum.request({
                method: "eth_requestAccounts"
            });
            if (window.ethereum.networkVersion !== HARDHAT_NETWORK) {
                return $wallet.networkError = "Please change your network to localhost:8545!"
            }
            window.ethereum.on('accountsChanged', ([newAddress]) => {
                if (newAddress === undefined) return reset()
            })
            window.ethereum.on('chainChanged', () => {
                return reset()
            })
            init(acc);
    }

    function reset() {
        wallet(initWalletState);
    }

    async function init(address) {
        provider =  new ethers.BrowserProvider(window.ethereum);
        const auction =  new ethers.Contract(auctionAddress.AucEngine, auctionABI.abi)
        await provider.getSigner(0);
        $wallet.account = address;
        await updateBalance();
    }

    async function updateBalance() {
        const balance = (await provider.getBalance($wallet.account))
        $wallet.balance =  `${ethers.formatEther(balance)} ethers`;
    }
</script>

<div>
    {#if !$wallet.account && !$wallet.balance}

    <GradientButton on:click={connect} outline={false} shadow color="blue" pill> Connect Wallet!</GradientButton>
    {:else}
        {$wallet.balance || 0}
    {/if}
</div>