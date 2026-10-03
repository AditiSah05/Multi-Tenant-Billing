import { Router } from 'express';
import * as taxController from './tax.controller.js';
import { authenticateToken, requireRole, enforceEmployeeRestrictions } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createTaxSchema, updateTaxSchema } from './tax.validator.js';

const router = Router();

router.use(authenticateToken);

// Tax Management Routes
router.post('/seed-defaults', requireRole(['TENANT_ADMIN']), taxController.handleSeedDefaultTaxes);
router.get('/summary', taxController.handleGetTaxSummary);
router.get('/product-tax-summary', taxController.handleGetProductTaxSummary);
router.get('/product-tax-summary/export/excel', taxController.handleExportProductTaxSummary);
router.get('/party-tax-summary', taxController.handleGetPartyTaxBreakdown);
router.get('/monthly-audit', taxController.handleGetMonthlyTaxAudit);
router.get('/monthly-audit/export/excel', taxController.handleExportMonthlyTaxAuditExcel);

router.post('/', requireRole(['TENANT_ADMIN']), validate(createTaxSchema), taxController.handleCreateTax);

router.get('/', taxController.handleGetTaxes);
router.get('/:taxId', taxController.handleGetTaxById);
router.put('/:taxId', requireRole(['TENANT_ADMIN']), validate(updateTaxSchema), taxController.handleUpdateTax);
router.delete('/:taxId', requireRole(['TENANT_ADMIN']), enforceEmployeeRestrictions, taxController.handleDeleteTax);

export default router;
