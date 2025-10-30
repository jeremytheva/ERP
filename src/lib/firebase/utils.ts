export function resolveContractPath(contract: string, companyId: string) {
  return contract.replace("${companyId}", companyId);
}
