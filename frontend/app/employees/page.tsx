"use client";

import React, { useState } from "react";
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
import { Plus, Edit, UserX, UserCheck, Loader2 } from "lucide-react";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import EmployeeRegistryABI from "../../lib/abi/EmployeeRegistry.json";
import { useQueryClient } from "@tanstack/react-query";

const EMPLOYEE_REGISTRY_ADDRESS =
  "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5" as const;

// Type for formatted employee data
interface EmployeeData {
  address: string;
  name: string;
  salary: string;
  isActive: boolean;
  role: string;
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    salary: "",
    role: "",
  });

  /* ==================== READ CONTRACTS ==================== */

  const { data: totalEmployees } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI.abi,
    functionName: "totalEmployees",
    query: {
      enabled: isConnected,
    },
  });

  const { data: activeEmployees } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI.abi,
    functionName: "activeEmployees",
    query: {
      enabled: isConnected,
    },
  });

  console.log("totalEmployees:", totalEmployees?.toString());
  console.log("activeEmployees:", activeEmployees?.toString());

  // Get list of addresses
  const { data: employeeAddresses } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI.abi,
    functionName: "getActiveEmployees",
    query: {
      enabled: isConnected,
    },
  });

  console.log("Raw employeeAddresses:", employeeAddresses);

  // BATCH FETCH: Create array of calls for each employee
  const employeeCalls =
    (employeeAddresses as string[] | undefined)?.map((addr) => ({
      address: EMPLOYEE_REGISTRY_ADDRESS,
      abi: EmployeeRegistryABI.abi,
      functionName: "employees",
      args: [addr],
    })) || [];

  // Execute batch call to get all employee data at once
  const { data: employeesResults, isLoading: isTableLoading } =
    useReadContracts({
      contracts: employeeCalls,
      query: {
        enabled: isConnected && employeeCalls.length > 0,
      },
    });

  // FORMAT: Convert blockchain data to usable format
  const tableData: EmployeeData[] =
    employeesResults
      ?.map((res, index) => {
        // 🔍 STEP 4: Log each individual result as we process it
        console.log(`=== Processing Employee ${index + 1} ===`);
        console.log("Address:", employeeAddresses![index]);
        console.log("Raw result:", res);
        console.log("Has result?", !!res.result);

        // Check if we got valid data
        if (!res.result) {
          console.log("❌ No result for this employee!");
          return null;
        }

        // Destructure the struct returned from Solidity
        // Solidity returns: (string name, uint256 salary, bool isActive, uint256 startDate, string role)
        const [name, salary, isActive, startDate, role] = res.result as [
          string,
          bigint,
          boolean,
          bigint,
          string
        ];

        console.log(" Parsed data:", {
          name,
          salary: salary.toString(),
          isActive,
          role,
        });

        return {
          address: employeeAddresses![index],
          name,
          salary: formatUnits(salary, 6),
          isActive,
          role,
        };
      })
      .filter((item): item is EmployeeData => item !== null) || [];


  /* ==================== WRITE CONTRACTS ==================== */

  const { mutate: addEmployee, isPending: isAddPending, data: addHash } = useWriteContract();
  const { mutate: updateEmployee, isPending: isUpdatePending, data: updateHash } =
    useWriteContract();
  const { mutate: deactivateEmployee, isPending: isDeactivatePending, data: deactivateHash } =
    useWriteContract();
  const { mutate: activateEmployee, isPending: isActivatePending, data: activateHash } =
    useWriteContract();

  // Wait for transaction confirmations
  console.log("Transaction hashes:", { addHash, updateHash, deactivateHash, activateHash });
  
  const { isSuccess: isAddSuccess } = useWaitForTransactionReceipt({
    hash: addHash,
  });
  const { isSuccess: isUpdateSuccess } = useWaitForTransactionReceipt({
    hash: updateHash,
  });
  const { isSuccess: isDeactivateSuccess } = useWaitForTransactionReceipt({
    hash: deactivateHash,
  });
  const { isSuccess: isActivateSuccess } = useWaitForTransactionReceipt({
    hash: activateHash,
  });

  // Refetch when any transaction succeeds
  React.useEffect(() => {
    console.log("Transaction status check:", {
      isAddSuccess,
      isUpdateSuccess,
      isDeactivateSuccess,
      isActivateSuccess,
    });
    
    if (isAddSuccess || isUpdateSuccess || isDeactivateSuccess || isActivateSuccess) {
      console.log("Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      // Also try more aggressive invalidation
      queryClient.invalidateQueries();
    }
  }, [isAddSuccess, isUpdateSuccess, isDeactivateSuccess, isActivateSuccess, queryClient]);

  /* ==================== HANDLERS ==================== */

  const resetForm = () => {
    setFormData({
      name: "",
      walletAddress: "",
      salary: "",
      role: "",
    });
    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    if (
      !formData.name ||
      !formData.walletAddress ||
      !formData.salary ||
      !formData.role
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const salaryInSmallestUnit = parseUnits(formData.salary, 6);

      addEmployee(
        {
          address: EMPLOYEE_REGISTRY_ADDRESS,
          abi: EmployeeRegistryABI.abi,
          functionName: "addEmployee",
          args: [
            formData.walletAddress as `0x${string}`,
            formData.name,
            salaryInSmallestUnit,
            formData.role,
          ],
        },
        {
          onSuccess: () => {
            setIsAddDialogOpen(false);
            resetForm();
          },
        }
      );
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee. Check console for details.");
    }
  };

  const handleEditEmployee = (employeeAddress: string) => {
    
    const employee = tableData.find((e) => e.address === employeeAddress);

    if (employee) {
      setEditingEmployee(employeeAddress);
      setFormData({
        name: employee.name,
        walletAddress: employeeAddress,
        salary: employee.salary, // Already formatted from tableData
        role: employee.role,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateEmployee = () => {
    if (
      !editingEmployee ||
      !formData.name ||
      !formData.salary ||
      !formData.role
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const salaryInSmallestUnit = parseUnits(formData.salary, 6);

      updateEmployee(
        {
          address: EMPLOYEE_REGISTRY_ADDRESS,
          abi: EmployeeRegistryABI.abi,
          functionName: "updateEmployee",
          args: [
            editingEmployee as `0x${string}`,
            formData.name,
            salaryInSmallestUnit,
            formData.role,
          ],
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            resetForm();
          },
        }
      );
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee. Check console for details.");
    }
  };

  const handleDeactivateEmployee = (employeeAddress: string) => {
    if (confirm("Are you sure you want to deactivate this employee?")) {
      deactivateEmployee(
        {
          address: EMPLOYEE_REGISTRY_ADDRESS,
          abi: EmployeeRegistryABI.abi,
          functionName: "deactivateEmployee",
          args: [employeeAddress as `0x${string}`],
        },
        {
          onSuccess: () => {},
        }
      );
    }
  };

  const handleActivateEmployee = (employeeAddress: string) => {
    activateEmployee(
      {
        address: EMPLOYEE_REGISTRY_ADDRESS,
        abi: EmployeeRegistryABI.abi,
        functionName: "activateEmployee",
        args: [employeeAddress as `0x${string}`],
      },
{
          onSuccess: () => {},
        }
    );
  };

  return (
    <div className="p-8 bg-[#114277] min-h-screen">
      {/* Wallet Connection Section */}
      {!isConnected && (
        <div className="mb-8 bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
          <div className="flex gap-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Employees</h1>
          <p className="text-gray-300 mt-2">
            Manage your team and their payroll settings
          </p>
          <div className="mt-4 flex gap-4 text-sm text-gray-300">
            {isConnected && (
              <>
                <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <span>Total: {totalEmployees?.toString() ?? "0"}</span>
                <span>Active: {activeEmployees?.toString() ?? "0"}</span>
                <button
                  onClick={() => disconnect()}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Disconnect
                </button>
              </>
            )}
            {!isConnected && (
              <span className="text-yellow-300">Please connect your wallet to view employees</span>
            )}
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!isConnected}>
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Add a new employee to your payroll system on-chain.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  value={formData.walletAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, walletAddress: e.target.value })
                  }
                  placeholder="0x..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role/Position</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salary">Monthly Salary (USDC)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} disabled={isAddPending}>
                {isAddPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {isTableLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading employees...
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found. Add your first employee to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((employee) => (
                  <TableRow key={employee.address}>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {employee.address.slice(0, 6)}...
                      {employee.address.slice(-4)}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      ${Number(employee.salary).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee.address)}
                          disabled={!employee.isActive}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {employee.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeactivateEmployee(employee.address)
                            }
                          >
                            <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleActivateEmployee(employee.address)
                            }
                          >
                            <UserCheck className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and payroll settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role/Position</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-salary">Monthly Salary (USDC)</Label>
              <Input
                id="edit-salary"
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={isUpdatePending}>
              {isUpdatePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
