// import {
//   EmergencyWithdraw as EmergencyWithdrawEvent,
//   Paused as PausedEvent,
//   PayrollClaimed as PayrollClaimedEvent,
//   PayrollDeposited as PayrollDepositedEvent,
//   PayrollExecuted as PayrollExecutedEvent,
//   RoleAdminChanged as RoleAdminChangedEvent,
//   RoleGranted as RoleGrantedEvent,
//   RoleRevoked as RoleRevokedEvent,
//   Unpaused as UnpausedEvent
// } from "../generated/PayrollManager/PayrollManager"
// import {
//   EmergencyWithdraw,
//   Paused,
//   PayrollClaimed,
//   PayrollDeposited,
//   PayrollExecuted,
//   RoleAdminChanged,
//   RoleGranted,
//   RoleRevoked,
//   Unpaused
// } from "../generated/schema"

// export function handleEmergencyWithdraw(event: EmergencyWithdrawEvent): void {
//   let entity = new EmergencyWithdraw(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.admin = event.params.admin
//   entity.amount = event.params.amount

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handlePaused(event: PausedEvent): void {
//   let entity = new Paused(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.account = event.params.account

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handlePayrollClaimed(event: PayrollClaimedEvent): void {
//   let entity = new PayrollClaimed(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.payrollId = event.params.payrollId
//   entity.employee = event.params.employee
//   entity.amount = event.params.amount

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handlePayrollDeposited(event: PayrollDepositedEvent): void {
//   let entity = new PayrollDeposited(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.depositor = event.params.depositor
//   entity.amount = event.params.amount

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handlePayrollExecuted(event: PayrollExecutedEvent): void {
//   let entity = new PayrollExecuted(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.payrollId = event.params.payrollId
//   entity.totalAmount = event.params.totalAmount
//   entity.employeeCount = event.params.employeeCount

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
//   let entity = new RoleAdminChanged(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.role = event.params.role
//   entity.previousAdminRole = event.params.previousAdminRole
//   entity.newAdminRole = event.params.newAdminRole

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handleRoleGranted(event: RoleGrantedEvent): void {
//   let entity = new RoleGranted(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.role = event.params.role
//   entity.account = event.params.account
//   entity.sender = event.params.sender

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handleRoleRevoked(event: RoleRevokedEvent): void {
//   let entity = new RoleRevoked(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.role = event.params.role
//   entity.account = event.params.account
//   entity.sender = event.params.sender

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handleUnpaused(event: UnpausedEvent): void {
//   let entity = new Unpaused(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.account = event.params.account

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

import { PayrollClaimed } from "../generated/PayrollManager/PayrollManager";
import { Employee, MonthlyPayroll } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handlePayrollClaimed(event: PayrollClaimed): void {
  let employeeId = event.params.employee.toHex();

  // -------- Employee --------
  let employee = Employee.load(employeeId);
  if (employee == null) {
    employee = new Employee(employeeId);
    employee.wallet = event.params.employee;
    employee.totalPaid = BigInt.zero();
  }

  employee.totalPaid = employee.totalPaid.plus(event.params.amount);
  employee.lastPaidAt = event.block.timestamp;
  employee.save();

  // -------- Monthly Payroll --------
  let timestamp = event.block.timestamp.toI32();
  let month =
    (timestamp / 31536000 + 1970) * 100 +
    ((timestamp % 31536000) / 2592000 + 1);

  let monthId = month.toString();

  let monthly = MonthlyPayroll.load(monthId);
  if (monthly == null) {
    monthly = new MonthlyPayroll(monthId);
    monthly.totalCost = BigInt.zero();
  }

  monthly.totalCost = monthly.totalCost.plus(event.params.amount);
  monthly.save();
}
