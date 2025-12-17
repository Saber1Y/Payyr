 import { formatUnits, parseUnits } from "viem";


export default function formatBalance(balance: bigint | undefined): number {
    if (!balance) return 0;
    return Number(formatUnits(balance, 6)); 
  };