"use client";

import { useState, useEffect } from "react";
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
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import EmployeeRegistryABI from "../../lib/abi/EmployeeRegistry.json";

const EMPLOYEE_REGISTRY_ADDRESS =
  "0xf23147Df55089eA6bA87BF24bb4eEE6f7Cea182b" as const;

interface EmployeeData {
  address: string;
  name: string;
  salary: bigint;
  isActive: boolean;
  role: string;
}

export default function EmployeesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    salary: "",
    role: "",
  });

  // Read calls
  const { data: totalEmployees } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI.abi,
    functionName: "totalEmployees",
  });

  const { data: activeEmployees } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI.abi,
    functionName: "activeEmployees",
  });

  const { data: employeeAddresses } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI.abi,
    functionName: "getActiveEmployees",
  });

  // Write contracts

  const {
    mutate: addEmployee,
    data: addHash,
    isPending: isAddPending,
  } = useWriteContract();

  const {
    mutate: updateEmployee,
    data: updateHash,
    isPending: isUpdatePending,
  } = useWriteContract();

  const {
    mutate: deactivateEmployee,
    data: deactivateHash,
    isPending: isDeactivatePending,
  } = useWriteContract();

  const {
    mutate: activateEmployee,
    data: activateHash,
    isPending: isActivatePending,
  } = useWriteContract();

  // Wait for transactions
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

  const resetForm = () => {
    setFormData({
      name: "",
      walletAddress: "",
      salary: "",
      role: "",
    });
    setEditingEmployee(null);
  };

  // Close dialogs on success
  useEffect(() => {
    if (isAddSuccess) {
      // setIsAddDialogOpen(false);
      resetForm();
    }
  }, [isAddSuccess]);

  useEffect(() => { 
    if (isUpdateSuccess) {
      // setIsEditDialogOpen(false);
      resetForm();
    }
  }, [isUpdateSuccess]);

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
      const salaryInSmallestUnit = parseUnits(formData.salary, 6); // USDC has 6 decimals

      addEmployee({
        address: EMPLOYEE_REGISTRY_ADDRESS,
        abi: EmployeeRegistryABI.abi,
        functionName: "addEmployee",
        args: [
          formData.walletAddress as `0x${string}`,
          formData.name,
          salaryInSmallestUnit,
          formData.role,
        ],
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee. Check console for details.");
    }
  };

  const handleEditEmployee = async (employeeAddress: string) => {
    // Fetch current employee data
    const employee = await getEmployeeData(employeeAddress);
    if (employee) {
      setEditingEmployee(employeeAddress);
      setFormData({
        name: employee.name,
        walletAddress: employeeAddress,
        salary: formatUnits(employee.salary, 6),
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

      updateEmployee({
        address: EMPLOYEE_REGISTRY_ADDRESS,
        abi: EmployeeRegistryABI.abi,
        functionName: "updateEmployee",
        args: [
          editingEmployee as `0x${string}`,
          formData.name,
          salaryInSmallestUnit,
          formData.role,
        ],
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee. Check console for details.");
    }
  };

  const handleDeactivateEmployee = (employeeAddress: string) => {
    if (confirm("Are you sure you want to deactivate this employee?")) {
      deactivateEmployee({
        address: EMPLOYEE_REGISTRY_ADDRESS,
        abi: EmployeeRegistryABI.abi,
        functionName: "deactivateEmployee",
        args: [employeeAddress as `0x${string}`],
      });
    }
  };

  const handleActivateEmployee = (employeeAddress: string) => {
    activateEmployee({
      address: EMPLOYEE_REGISTRY_ADDRESS,
      abi: EmployeeRegistryABI.abi,
      functionName: "activateEmployee",
      args: [employeeAddress as `0x${string}`],
    });
  };

  // Helper to get individual employee data
  const getEmployeeData = async (
    address: string
  ): Promise<EmployeeData | null> => {
    try {
      // This would need to be done differently - you'd need to read each employee
      // For now, we'll return null and rely on the table rendering
      return null;
    } catch (error) {
      console.error("Error fetching employee:", error);
      return null;
    }
  };

  return (
    <div className="p-8 bg-[#114277] min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Employees</h1>
          <p className="text-gray-300 mt-2">
            Manage your team and their payroll settings
          </p>
          <div className="mt-4 flex gap-4 text-sm text-gray-300">
            <span>Total: {totalEmployees?.toString() ?? "0"}</span>
            <span>Active: {activeEmployees?.toString() ?? "0"}</span>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-black">Add New Employee</DialogTitle>
              <DialogDescription className="text-black">
                Add a new employee to your payroll system on-chain.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-black">
                  Full Name
                </Label>
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
                <Label htmlFor="address" className="text-black">
                  Wallet Address
                </Label>
                <Input
                  id="address"
                  value={formData.walletAddress}
                  className="text-black"
                  onChange={(e) =>
                    setFormData({ ...formData, walletAddress: e.target.value })
                  }
                  placeholder="0x..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-black">
                  Role/Position
                </Label>
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
                <Label htmlFor="salary" className="text-black">
                  Monthly Salary (USDC)
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  className="text-black"
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
                className="text-black"
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
          <EmployeeTable
            employeeAddresses={employeeAddresses as `0x${string}`[] | undefined}
            onEdit={handleEditEmployee}
            onDeactivate={handleDeactivateEmployee}
            onActivate={handleActivateEmployee}
          />
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

// Separate component for the employee table
function EmployeeTable({
  employeeAddresses,
  onEdit,
  onDeactivate,
  onActivate,
}: {
  employeeAddresses: `0x${string}`[] | undefined;
  onEdit: (address: string) => void;
  onDeactivate: (address: string) => void;
  onActivate: (address: string) => void;
}) {
  if (!employeeAddresses || employeeAddresses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No employees found. Add your first employee to get started.
      </div>
    );
  }

  return (
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
        {employeeAddresses.map((address) => (
          <EmployeeRow
            key={address}
            address={address}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            onActivate={onActivate}
          />
        ))}
      </TableBody>
    </Table>
  );
}

// Individual employee row component
function EmployeeRow({
  address,
  onEdit,
  onDeactivate,
  onActivate,
}: {
  address: `0x${string}`;
  onEdit: (address: string) => void;
  onDeactivate: (address: string) => void;
  onActivate: (address: string) => void;
}) {
  const { data: employeeData } = useReadContract({
    address: EMPLOYEE_REGISTRY_ADDRESS,
    abi: EmployeeRegistryABI,
    functionName: "employees",
    args: [address],
  });

  if (!employeeData) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  const [name, salary, isActive, startDate, role] = employeeData as [
    string,
    bigint,
    boolean,
    bigint,
    string
  ];

  const formattedSalary = formatUnits(salary, 6);

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="font-mono text-sm">
        {address.slice(0, 6)}...{address.slice(-4)}
      </TableCell>
      <TableCell>{role}</TableCell>
      <TableCell>${Number(formattedSalary).toLocaleString()}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address)}
            disabled={!isActive}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeactivate(address)}
            >
              <UserX className="h-4 w-4 text-red-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActivate(address)}
            >
              <UserCheck className="h-4 w-4 text-green-500" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
