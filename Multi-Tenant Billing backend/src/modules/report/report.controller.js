import * as reportService from './report.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const handleGetSalesReport = asyncHandler(async (req, res) => {
  const report = await reportService.getSalesReport(req.tenantId, req.query);
  return ApiResponse.success(res, report, 'Sales report generated successfully.');
});

export const handleExportSalesReportPDF = asyncHandler(async (req, res) => {
  await reportService.generateSalesReportPDF(req.tenantId, req.query, res);
});

export const handleExportSalesReportExcel = asyncHandler(async (req, res) => {
  await reportService.generateSalesReportExcel(req.tenantId, req.query, res);
});

export const handleGetGstr1Report = asyncHandler(async (req, res) => {
  const report = await reportService.getGstr1Report(req.tenantId, req.query);
  return ApiResponse.success(res, report, 'GSTR-1 report generated successfully.');
});

export const handleGetGstr3bReport = asyncHandler(async (req, res) => {
  const report = await reportService.getGstr3bReport(req.tenantId, req.query);
  return ApiResponse.success(res, report, 'GSTR-3B report generated successfully.');
});

