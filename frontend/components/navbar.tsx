"use client";
import { WalletConnect } from "./WalletConnect";

export function Navbar() {
  return (
    <div className="border-b bg-white border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
            Payyr
          </h1>
        </div>
        <WalletConnect />
      </div>
    </div>
  );
}
