import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import VendorLayout from '../layouts/VendorLayout';

// Module-wise Page Imports
import VendorDashboard from '../modules/vendor/pages/VendorDashboard';
import ProductsListPage from '../modules/products/pages/ProductsListPage';
import CreateProductPage from '../modules/products/pages/CreateProductPage';
import ProductDetailsPage from '../modules/products/pages/ProductDetailsPage';
import InventoryListPage from '../modules/inventory/pages/InventoryListPage';
import BillsListPage from '../modules/bills/pages/BillsListPage';
import CreateBillPOSPage from '../modules/bills/pages/CreateBillPOSPage';
import CreateBillPage from '../modules/bills/pages/CreateBillPage';
import PublicCustomerBillPage from '../modules/bills/pages/PublicCustomerBillPage';
import BillDetailsPage from '../modules/bills/pages/BillDetailsPage';
import CreateSalesReturnPage from '../modules/bills/pages/CreateSalesReturnPage';
import SalesReturnsListPage from '../modules/bills/pages/SalesReturnsListPage';
import CreateBusinessProfilePage from '../modules/onboarding/pages/CreateBusinessProfilePage';
import SuppliersListPage from '../modules/suppliers/pages/SuppliersListPage';
import SupplierDetailsPage from '../modules/suppliers/pages/SupplierDetailsPage';
import PurchaseBillsListPage from '../modules/purchases/pages/PurchaseBillsListPage';
import CreatePurchaseBillPage from '../modules/purchases/pages/CreatePurchaseBillPage';
import PurchaseBillDetailsPage from '../modules/purchases/pages/PurchaseBillDetailsPage';
import CreatePurchaseReturnPage from '../modules/purchases/pages/CreatePurchaseReturnPage';
import PurchaseReturnsListPage from '../modules/purchases/pages/PurchaseReturnsListPage';
import PurchaseReturnDetailsPage from '../modules/purchases/pages/PurchaseReturnDetailsPage';
import CustomersListPage from '../modules/customers/pages/CustomersListPage';
import CustomerDetailsPage from '../modules/customers/pages/CustomerDetailsPage';
import StockAuditLogsPage from '../modules/inventory/pages/StockAuditLogsPage';
import ExpiryRiskIntelligencePage from '../modules/inventory/pages/ExpiryRiskIntelligencePage';
import TaxManagementPage from '../modules/tax/pages/TaxManagementPage';

export const VendorRoutes = (
  <Route
    path="/vendor"
    element={
      <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'EMPLOYEE']}>
        <VendorLayout />
      </ProtectedRoute>
    }
  >
    {/* Core Vendor Routes */}
    <Route index element={<Navigate to="/vendor/dashboard" replace />} />
    <Route path="dashboard" element={<VendorDashboard />} />
    <Route path="business-profile" element={<CreateBusinessProfilePage />} />
    <Route path="create-profile" element={<CreateBusinessProfilePage />} />

    {/* Products Module Routes */}
    <Route path="products" element={<ProductsListPage />} />
    <Route path="products/create" element={<CreateProductPage />} />
    <Route path="products/add" element={<CreateProductPage />} />
    <Route path="products/edit/:id" element={<CreateProductPage />} />
    <Route path="products/:id" element={<ProductDetailsPage />} />
    <Route path="products/details/:id" element={<ProductDetailsPage />} />

    {/* Sales & Inventory Routes */}
    <Route path="inventory" element={<InventoryListPage />} />
    <Route path="inventory/logs" element={<StockAuditLogsPage />} />
    <Route path="inventory/audit-logs" element={<StockAuditLogsPage />} />
    <Route path="inventory/history" element={<StockAuditLogsPage />} />
    <Route path="inventory/expiry" element={<ExpiryRiskIntelligencePage />} />
    <Route path="inventory/expiry-alerts" element={<ExpiryRiskIntelligencePage />} />
    <Route path="inventory/expiry-risk" element={<ExpiryRiskIntelligencePage />} />
    <Route path="invoices" element={<BillsListPage />} />
    <Route path="invoices/create" element={<CreateBillPage />} />
    <Route path="bills/create" element={<CreateBillPage />} />
    <Route path="invoices/edit/:id" element={<CreateBillPage />} />
    <Route path="bills/edit/:id" element={<CreateBillPage />} />
    <Route path="invoices/details/:id" element={<BillDetailsPage />} />
    <Route path="invoices/:id" element={<PublicCustomerBillPage />} />
    <Route path="invoices/returns" element={<SalesReturnsListPage />} />
    <Route path="invoices/returns/list" element={<SalesReturnsListPage />} />
    <Route path="invoices/returns/create" element={<CreateSalesReturnPage />} />
    <Route path="invoices/returns/:id" element={<CreateSalesReturnPage />} />
    <Route path="pos" element={<Navigate to="/vendor/bills/create" replace />} />
    <Route path="sales" element={<Navigate to="/vendor/invoices" replace />} />

    {/* Tax & Compliance Module Routes */}
    <Route path="tax" element={<TaxManagementPage />} />
    <Route path="tax/compliance" element={<TaxManagementPage />} />
    <Route path="tax/audit" element={<TaxManagementPage />} />
    <Route path="reports/tax" element={<TaxManagementPage />} />

    {/* Purchase Module Routes */}
    <Route path="purchases" element={<PurchaseBillsListPage />} />
    <Route path="purchases/bills" element={<PurchaseBillsListPage />} />
    <Route path="purchases/create" element={<CreatePurchaseBillPage />} />
    <Route path="purchases/bills/create" element={<CreatePurchaseBillPage />} />
    <Route path="purchases/edit/:id" element={<CreatePurchaseBillPage />} />
    <Route path="purchases/:id" element={<PurchaseBillDetailsPage />} />
    <Route path="purchases/bills/:id" element={<PurchaseBillDetailsPage />} />
    <Route path="purchases/returns" element={<PurchaseReturnsListPage />} />
    <Route path="purchases/returns/list" element={<PurchaseReturnsListPage />} />
    <Route path="purchases/returns/create" element={<CreatePurchaseReturnPage />} />
    <Route path="purchases/returns/:id" element={<PurchaseReturnDetailsPage />} />

    {/* Suppliers & Other Modules */}
    <Route path="customers" element={<CustomersListPage />} />
    <Route path="customers/:id" element={<CustomerDetailsPage />} />
    <Route path="suppliers" element={<SuppliersListPage />} />
    <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
    <Route path="payments" element={<VendorDashboard />} />
    <Route path="expenses" element={<VendorDashboard />} />
    <Route path="reports" element={<VendorDashboard />} />
    <Route path="employees" element={<VendorDashboard />} />
    <Route path="settings" element={<VendorDashboard />} />
  </Route>
);

