import * as taxService from './tax.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const handleCreateTax = asyncHandler(async (req, res) => {
  const tax = await taxService.createTax(req.tenantId, req.body);
  return ApiResponse.created(res, tax, 'Tax created successfully.');
});

export const handleGetTaxes = asyncHandler(async (req, res) => {
  const taxes = await taxService.getTaxes(req.tenantId);
  return ApiResponse.success(res, taxes, 'Taxes fetched successfully.');
});

export const handleGetTaxById = asyncHandler(async (req, res) => {
  const tax = await taxService.getTaxById(req.tenantId, req.params.taxId);
  return ApiResponse.success(res, tax, 'Tax details fetched successfully.');
});

export const handleUpdateTax = asyncHandler(async (req, res) => {
  const tax = await taxService.updateTax(req.tenantId, req.params.taxId, req.body);
  return ApiResponse.success(res, tax, 'Tax updated successfully.');
});

export const handleDeleteTax = asyncHandler(async (req, res) => {
  await taxService.deleteTax(req.tenantId, req.params.taxId);
  return ApiResponse.success(res, null, 'Tax deleted successfully.');
});

export const handleSeedDefaultTaxes = asyncHandler(async (req, res) => {
  const result = await taxService.seedDefaultGstSlabs(req.tenantId);
  return ApiResponse.success(res, result, result.message);
});

export const handleGetTaxSummary = asyncHandler(async (req, res) => {
  const summary = await taxService.getTaxSummaryBySlabs(req.tenantId, req.query);
  return ApiResponse.success(res, summary, 'Tax slabs liability summary fetched successfully.');
});

export const handleGetProductTaxSummary = asyncHandler(async (req, res) => {
  const summary = await taxService.getProductTaxSummary(req.tenantId, req.query);
  return ApiResponse.success(res, summary, 'Product-wise tax reconciliation summary fetched successfully.');
});

export const handleExportProductTaxSummary = asyncHandler(async (req, res) => {
  const exportData = await taxService.exportProductTaxSummary(req.tenantId, req.query);
  return ApiResponse.success(res, exportData, 'Product-wise tax summary formatted for export.');
});

export const handleGetPartyTaxBreakdown = asyncHandler(async (req, res) => {
  const partyTax = await taxService.getPartyTaxBreakdown(req.tenantId, req.query);
  return ApiResponse.success(res, partyTax, 'Party-wise tax breakdown fetched successfully.');
});

export const handleGetMonthlyTaxAudit = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const auditData = await taxService.getMonthlyTaxAuditDashboard(req.tenantId, year, month);
  return ApiResponse.success(res, auditData, 'Monthly tax audit and compliance dashboard fetched successfully.');
});

export const handleExportMonthlyTaxAuditExcel = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  return await taxService.exportMonthlyTaxAuditExcel(req.tenantId, year, month, res);
});



