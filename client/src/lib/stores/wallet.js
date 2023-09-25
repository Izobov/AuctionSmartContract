import { writable } from "svelte/store";

export const initWalletState = {
  account: null,
  txBeingSent: null,
  networkError: null,
  transactionErr: null,
  balance: null,
};
export const wallet = writable(initWalletState);
