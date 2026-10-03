import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Save, X, Trash2 } from 'lucide-react';
import {
  useCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useProductDetailsQuery,
} from '../hooks/useProductsQueries';
import { useToast } from '../../../context/ToastContext';

// Sub-components
import ProductBasicInfoCard from '../components/ProductBasicInfoCard';
import ProductPricingTaxCard from '../components/ProductPricingTaxCard';
import ProductStatusCard from '../components/ProductStatusCard';
import ProductDeleteModal from '../components/ProductDeleteModal';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('basic');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Queries & Mutations
  const { data: categoryRes } = useCategoriesQuery();
  const { data: productDetailsRes } = useProductDetailsQuery(id);
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();

  const categories = Array.isArray(categoryRes?.categories)
    ? categoryRes.categories
    : Array.isArray(categoryRes?.data?.categories)
      ? categoryRes.data.categories
      : Array.isArray(categoryRes?.data)
        ? categoryRes.data
        : [];

  const existingProduct = productDetailsRes?.product || productDetailsRes?.data || null;

  // Form State matching Screenshot 1 & Backend Schema
  // Form State matching Screenshot 1 & Backend Schema
  const [formData, setFormData] = useState({
    name: '',
    sku: `SKU-${Date.now().toString().slice(-6)}`,
    hsnCode: '',
    categoryId: '',
    subCategoryId: '',
    brand: '',
    unit: 'Nos',
    hasSecondaryUnit: false,
    secondaryUnit: 'Box',
    conversionFactor: 1,
    secondaryPurchasePrice: '',
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    taxType: 'GST',
    taxMode: 'INCLUSIVE',
    discountPercent: 0,
    taxPercent: 18,
    openingStock: 0,
    maxStockLevel: 0,
    minStockLevel: 0,
    stockAlertQuantity: 0,
    enableStockAlert: true,
    hasWarranty: false,
    warrantyPeriod: 12,
    warrantyUnit: 'MONTHS',
    warrantyTerms: '',
    description: '',
    expiryDate: '',
    status: 'ACTIVE',
  });

  const [additionalValues, setAdditionalValues] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Auto-Select First Category & SubCategory when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId && !isEditMode) {
      const firstCat = categories.find((c) => c.subCategories && c.subCategories.length > 0) || categories[0];
      const firstSubCat = firstCat?.subCategories?.[0];
      const hasCatWarranty = Boolean(firstSubCat?.enableWarranty || firstCat?.enableWarranty);
      setFormData((prev) => ({
        ...prev,
        categoryId: firstCat?.id || '',
        subCategoryId: firstSubCat?.id || '',
        hasWarranty: hasCatWarranty,
        warrantyPeriod: firstSubCat?.defaultWarrantyPeriod || firstCat?.defaultWarrantyPeriod || 12,
        warrantyUnit: firstSubCat?.defaultWarrantyUnit || firstCat?.defaultWarrantyUnit || 'MONTHS',
      }));
    }
  }, [categories, isEditMode, formData.categoryId]);

  // Populate data in edit mode
  useEffect(() => {
    if (existingProduct) {
      const rawTaxType = (existingProduct.taxType || '').toUpperCase();
      const isInclusiveTax = ['INCLUSIVE', 'GST_INCLUSIVE'].includes(rawTaxType);
      const isExempt = rawTaxType === 'EXEMPT';
      const isNonGst = rawTaxType === 'NON_GST';

      const mappedTaxType = (isExempt || isNonGst) ? rawTaxType : 'GST';
      const mappedTaxMode = isInclusiveTax ? 'INCLUSIVE' : 'EXCLUSIVE';
      const mappedTaxPercent = existingProduct.taxPercent ?? existingProduct.taxRate ?? existingProduct.tax?.percentage ?? (isExempt || isNonGst ? 0 : 18);

      setFormData({
        name: existingProduct.name || '',
        sku: existingProduct.sku || '',
        hsnCode: existingProduct.hsnCode || existingProduct.hsn || '',
        categoryId: existingProduct.categoryId || existingProduct.category?.id || '',
        subCategoryId: existingProduct.subCategoryId || existingProduct.subCategory?.id || '',
        brand: existingProduct.brand || '',
        unit: existingProduct.unit || 'Nos',
        hasSecondaryUnit: existingProduct.hasSecondaryUnit ?? false,
        secondaryUnit: existingProduct.secondaryUnit || 'Box',
        conversionFactor: existingProduct.conversionFactor || 1,
        secondaryPurchasePrice: existingProduct.secondaryPurchasePrice || '',
        purchasePrice: existingProduct.purchasePrice || '',
        sellingPrice: existingProduct.sellingPrice || '',
        mrp: existingProduct.mrp || '',
        taxType: mappedTaxType,
        taxMode: mappedTaxMode,
        discountPercent: existingProduct.discountPercent || 0,
        taxPercent: mappedTaxPercent,
        openingStock: existingProduct.openingStock ?? existingProduct.currentStock ?? 0,
        maxStockLevel: existingProduct.maxStockLevel || 0,
        minStockLevel: existingProduct.minStockLevel || 0,
        stockAlertQuantity: existingProduct.stockAlertQuantity || 0,
        enableStockAlert: existingProduct.enableStockAlert ?? true,
        hasWarranty: Boolean(existingProduct.hasWarranty),
        warrantyPeriod: existingProduct.warrantyPeriod || 12,
        warrantyUnit: existingProduct.warrantyUnit || 'MONTHS',
        warrantyTerms: existingProduct.warrantyTerms || '',
        description: existingProduct.description || '',
        expiryDate: existingProduct.expiryDate || '',
        status: existingProduct.status || 'ACTIVE',
      });
      if (existingProduct.additionalValues) {
        setAdditionalValues(existingProduct.additionalValues);
      }
      if (existingProduct.imageUrl || existingProduct.productImage) {
        setImagePreview(existingProduct.imageUrl || existingProduct.productImage);
      }
    }
  }, [existingProduct]);

  // Derived subcategories list
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const subCategories = selectedCategory?.subCategories || [];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'categoryId') {
      const cat = categories.find((c) => c.id === value);
      const firstSub = cat?.subCategories?.[0];
      const hasCatWarranty = Boolean(firstSub?.enableWarranty || cat?.enableWarranty);
      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        subCategoryId: firstSub?.id || '',
        hasWarranty: hasCatWarranty,
        warrantyPeriod: firstSub?.defaultWarrantyPeriod || cat?.defaultWarrantyPeriod || 12,
        warrantyUnit: firstSub?.defaultWarrantyUnit || cat?.defaultWarrantyUnit || 'MONTHS',
      }));
      return;
    }
    if (name === 'taxType') {
      setFormData((prev) => ({
        ...prev,
        taxType: value,
        taxPercent: value === 'GST' ? (prev.taxPercent || 18) : 0,
      }));
      return;
    }
    if (name === 'taxPercent') {
      setFormData((prev) => ({
        ...prev,
        taxPercent: value === '' ? '' : value,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAdditionalValueChange = (fieldName, val) => {
    setAdditionalValues((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSaveProduct = async (overrideStatus = null) => {
    if (!formData.name.trim()) {
      toast.error('Product name is required.');
      return;
    }
    if (!formData.hsnCode || !formData.hsnCode.trim()) {
      toast.error('HSN / SAC Code is required.');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a Category.');
      return;
    }

    const autoSku = `SKU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const finalSku = formData.sku && formData.sku.trim() ? formData.sku.trim() : autoSku;

    const payloadStatus = overrideStatus || formData.status;
    const currentTaxMode = (formData.taxMode || 'INCLUSIVE').toUpperCase();
    const computedTaxType = (formData.taxType === 'EXEMPT' || formData.taxType === 'NON_GST')
      ? formData.taxType
      : 'GST';

    const finalPayload = {
      ...formData,
      hasSecondaryUnit: Boolean(formData.hasSecondaryUnit),
      secondaryUnit: formData.hasSecondaryUnit ? (formData.secondaryUnit || 'Box') : null,
      conversionFactor: formData.hasSecondaryUnit ? (Number(formData.conversionFactor) || 1) : 1,
      secondaryPurchasePrice: formData.hasSecondaryUnit ? (Number(formData.secondaryPurchasePrice) || 0) : null,
      taxType: computedTaxType,
      taxMode: currentTaxMode,
      isTaxInclusive: currentTaxMode === 'INCLUSIVE',
      hsnCode: formData.hsnCode || '',
      hsn: formData.hsnCode || '',
      sku: finalSku,
      status: payloadStatus,
      purchasePrice: Number(formData.purchasePrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      mrp: Number(formData.mrp) || Number(formData.sellingPrice) || 0,
      discountPercent: Number(formData.discountPercent) || 0,
      taxPercent: (formData.taxType === 'EXEMPT' || formData.taxType === 'NON_GST') ? 0 : (Number(formData.taxPercent) || 0),
      taxRate: (formData.taxType === 'EXEMPT' || formData.taxType === 'NON_GST') ? 0 : (Number(formData.taxPercent) || 0),
      currentStock: Number(formData.openingStock) || 0,
      openingStock: Number(formData.openingStock) || 0,
      maxStockLevel: Number(formData.maxStockLevel) || 0,
      minStockLevel: Number(formData.minStockLevel) || 0,
      stockAlertQuantity: Number(formData.stockAlertQuantity) || 0,
      hasWarranty: Boolean(formData.hasWarranty),
      warrantyPeriod: formData.hasWarranty ? (Number(formData.warrantyPeriod) || 12) : null,
      warrantyUnit: formData.hasWarranty ? (formData.warrantyUnit || 'MONTHS') : null,
      warrantyTerms: formData.hasWarranty ? (formData.warrantyTerms || null) : null,
      additionalValues: additionalValues,
    };

    try {
      let dataToSend = finalPayload;
      if (imageFile || imagePreview) {
        const formDataObj = new FormData();
        Object.keys(finalPayload).forEach((key) => {
          if (key === 'additionalValues') {
            formDataObj.append('additionalValues', JSON.stringify(finalPayload[key]));
          } else if (finalPayload[key] !== undefined && finalPayload[key] !== null) {
            formDataObj.append(key, finalPayload[key]);
          }
        });
        if (imagePreview) {
          formDataObj.append('imageUrl', imagePreview);
        }
        if (imageFile) {
          formDataObj.append('productImage', imageFile);
          formDataObj.append('image', imageFile);
          formDataObj.append('file', imageFile);
        }
        dataToSend = formDataObj;
      }

      if (isEditMode) {
        await updateProductMutation.mutateAsync({ id, data: dataToSend });
      } else {
        await createProductMutation.mutateAsync(dataToSend);
      }

      toast.success(`Product "${formData.name}" ${isEditMode ? 'updated' : 'added'} successfully!`);
      navigate('/vendor/products');
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || '';
      if (serverMsg.includes('sku') || serverMsg.includes('Unique constraint') || serverMsg.includes('unique')) {
        toast.error(`SKU "${finalSku}" already exists! Please enter a unique SKU or leave it blank.`);
      } else {
        toast.error(serverMsg || 'Failed to save product.');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success(`Product "${formData.name || 'Product'}" deleted successfully!`);
      setDeleteModalOpen(false);
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 pb-16 animate-fadeIn">
      {/* Breadcrumb Navigation matching Screenshot 1 */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/vendor/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link to="/vendor/products" className="hover:text-indigo-600 transition-colors">
          Products
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 font-extrabold">{isEditMode ? 'Edit Product' : 'Add New Product'}</span>
      </div>

      {/* Top Header Row matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Add product details, pricing and inventory information.
          </p>
        </div>

        {/* Top Header Buttons matching Screenshot 1 */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isEditMode && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={createProductMutation.isPending || updateProductMutation.isPending}
            onClick={() => handleSaveProduct('INACTIVE')}
            className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {createProductMutation.isPending || updateProductMutation.isPending ? 'Saving Draft...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            disabled={createProductMutation.isPending || updateProductMutation.isPending}
            onClick={() => handleSaveProduct('ACTIVE')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{createProductMutation.isPending || updateProductMutation.isPending ? 'Saving...' : 'Save & Continue'}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Tab Navigation Segmented Bar matching Screenshot 1 */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-sm flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'basic', label: 'Basic Information' },
          { id: 'pricing', label: 'Pricing & Tax' },
          { id: 'status', label: 'Other Details' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 2x2 Form Cards Grid matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Basic Information */}
        <ProductBasicInfoCard
          formData={formData}
          onInputChange={handleInputChange}
          additionalValues={additionalValues}
          onAdditionalValueChange={handleAdditionalValueChange}
          categories={categories}
          subCategories={subCategories}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />

        {/* Section 2: Pricing & Tax */}
        <ProductPricingTaxCard formData={formData} onInputChange={handleInputChange} />

        {/* Section 3: Product Status */}
        <ProductStatusCard
          status={formData.status}
          onStatusChange={(st) => setFormData((prev) => ({ ...prev, status: st }))}
        />
      </div>

      {/* Bottom Mandatory Note matching Screenshot 1 */}
      <div className="text-[11px] font-bold text-slate-400 italic pt-2">* Fields marked with asterisk (*) are required.</div>

      {/* Delete Product Modal */}
      <ProductDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={formData.name || 'this product'}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CreateProductPage;
