"use client";

import { Button } from "@/components/ui/button";
import { Wallet, LogOut, User } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

export function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get the user's wallet address
  const walletAddress = user?.wallet?.address;

  const handleConnect = () => {
    login();
  };

  const handleDisconnect = () => {
    logout();
  };

  return (
    <div className="border-b bg-white border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Arc Network Payroll
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {authenticated && user ? (
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {walletAddress && formatAddress(walletAddress)}
                </span>
              </div>

              {/* Disconnect Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
              className="gap-2"
              disabled={!ready}
            >
              <Wallet className="h-4 w-4" />
              {ready ? "Connect Wallet" : "Loading..."}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
