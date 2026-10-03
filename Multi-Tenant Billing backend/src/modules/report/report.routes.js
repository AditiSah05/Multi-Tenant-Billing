import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/sales', reportController.handleGetSalesReport);
router.get('/sales/export/pdf', reportController.handleExportSalesReportPDF);
router.get('/sales/export/excel', reportController.handleExportSalesReportExcel);

router.get('/gstr-1', reportController.handleGetGstr1Report);
router.get('/gstr-3b', reportController.handleGetGstr3bReport);

export default router;
