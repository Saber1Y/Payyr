import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  EmergencyWithdraw,
  Paused,
  PayrollClaimed,
  PayrollDeposited,
  PayrollExecuted,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Unpaused
} from "../generated/PayrollManager/PayrollManager"

export function createEmergencyWithdrawEvent(
  admin: Address,
  amount: BigInt
): EmergencyWithdraw {
  let emergencyWithdrawEvent = changetype<EmergencyWithdraw>(newMockEvent())

  emergencyWithdrawEvent.parameters = new Array()

  emergencyWithdrawEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  emergencyWithdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return emergencyWithdrawEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPayrollClaimedEvent(
  payrollId: BigInt,
  employee: Address,
  amount: BigInt
): PayrollClaimed {
  let payrollClaimedEvent = changetype<PayrollClaimed>(newMockEvent())

  payrollClaimedEvent.parameters = new Array()

  payrollClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "payrollId",
      ethereum.Value.fromUnsignedBigInt(payrollId)
    )
  )
  payrollClaimedEvent.parameters.push(
    new ethereum.EventParam("employee", ethereum.Value.fromAddress(employee))
  )
  payrollClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return payrollClaimedEvent
}

export function createPayrollDepositedEvent(
  depositor: Address,
  amount: BigInt
): PayrollDeposited {
  let payrollDepositedEvent = changetype<PayrollDeposited>(newMockEvent())

  payrollDepositedEvent.parameters = new Array()

  payrollDepositedEvent.parameters.push(
    new ethereum.EventParam("depositor", ethereum.Value.fromAddress(depositor))
  )
  payrollDepositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return payrollDepositedEvent
}

export function createPayrollExecutedEvent(
  payrollId: BigInt,
  totalAmount: BigInt,
  employeeCount: BigInt
): PayrollExecuted {
  let payrollExecutedEvent = changetype<PayrollExecuted>(newMockEvent())

  payrollExecutedEvent.parameters = new Array()

  payrollExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "payrollId",
      ethereum.Value.fromUnsignedBigInt(payrollId)
    )
  )
  payrollExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  payrollExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "employeeCount",
      ethereum.Value.fromUnsignedBigInt(employeeCount)
    )
  )

  return payrollExecutedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
