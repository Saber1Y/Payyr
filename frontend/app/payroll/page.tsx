"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  Send,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface PayrollHistory {
  id: string;
  date: string;
  employeesPaid: number;
  totalAmount: number;
  transactionHash: string;
  status: string;
}

const mockPayrollHistory: PayrollHistory[] = [
  {
    id: "1",
    date: "Nov 15, 2024",
    employeesPaid: 24,
    totalAmount: 85200,
    transactionHash: "0xabc123...def789",
    status: "Completed",
  },
  {
    id: "2",
    date: "Oct 15, 2024",
    employeesPaid: 23,
    totalAmount: 81150,
    transactionHash: "0x456ghi...jkl012",
    status: "Completed",
  },
  {
    id: "3",
    date: "Sep 15, 2024",
    employeesPaid: 22,
    totalAmount: 77800,
    transactionHash: "0x789mno...pqr345",
    status: "Completed",
  },
];

export default function PayrollPage() {
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isPayAllDialogOpen, setIsPayAllDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [payrollHistory] = useState<PayrollHistory[]>(mockPayrollHistory);

  // Mock data
  const contractBalance = 125430;
  const requiredForNextPayroll = 85200;
  const hasSufficientFunds = contractBalance >= requiredForNextPayroll;

  const handleDeposit = () => {
    console.log("Depositing:", depositAmount);
    setIsDepositDialogOpen(false);
    setDepositAmount("");
  };

  const handlePayAll = () => {
    console.log("Processing payroll for all employees");
    setIsPayAllDialogOpen(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
        <p className="text-gray-600 mt-2">
          Manage deposits and payroll payments on Arc Network
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Contract USDC Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${contractBalance.toLocaleString()}.00
            </div>
            <p className="text-xs text-gray-500 mt-1">Available for payroll</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Required for Next Payroll
            </CardTitle>
            <Send className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${requiredForNextPayroll.toLocaleString()}.00
            </div>
            <p className="text-xs text-gray-500 mt-1">Due Dec 15, 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Funds Status
            </CardTitle>
            {hasSufficientFunds ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                hasSufficientFunds ? "text-green-600" : "text-red-600"
              }`}
            >
              {hasSufficientFunds ? "Ready" : "Insufficient"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {hasSufficientFunds
                ? "Sufficient funds available"
                : "Additional funds needed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <Dialog
          open={isDepositDialogOpen}
          onOpenChange={setIsDepositDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Wallet className="h-4 w-4" />
              Deposit USDC
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Deposit USDC</DialogTitle>
              <DialogDescription>
                Add funds to your payroll contract on Arc Network.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="10000"
                />
              </div>
              <div className="text-sm text-gray-500">
                Current balance: ${contractBalance.toLocaleString()}.00 USDC
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDepositDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDeposit}>Deposit Funds</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPayAllDialogOpen} onOpenChange={setIsPayAllDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!hasSufficientFunds}>
              <Send className="h-4 w-4" />
              Pay All Employees
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Payroll Payment</DialogTitle>
              <DialogDescription>
                This will process payroll for all active employees.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Employees to pay:</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total amount:</span>
                  <span className="font-semibold">
                    ${requiredForNextPayroll.toLocaleString()}.00 USDC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remaining balance:</span>
                  <span className="font-semibold">
                    $
                    {(
                      contractBalance - requiredForNextPayroll
                    ).toLocaleString()}
                    .00 USDC
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ This action cannot be undone. All payments will be
                  processed on Arc Network.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPayAllDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePayAll}>Confirm Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employees Paid</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>{record.employeesPaid}</TableCell>
                  <TableCell>
                    ${record.totalAmount.toLocaleString()}.00
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {record.transactionHash}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
