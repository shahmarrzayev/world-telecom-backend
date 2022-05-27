jest.mock('winston');
jest.mock('../helper/productHelper');
jest.mock('../../mapper/productMapper');
jest.mock('../../repository/productRepository');
jest.mock('../../repository/productOptionRepository');
jest.mock('../../utils/cacheUtils');

const {
    addNewProduct,
    addNewProductOption,
    addToPopularProducts,
    getAllPopularProducts,
    getManyProductOptionsByIds,
    getManyProducts,
    getProductById,
    getProductOptionById,
    getProductOptionByProductIdAndId,
    modifyProduct,
    modifyProductOption,
    removeManyProducts,
} = require('../productService');
const {
    checkAndPopulateLoans,
    checkIdentificator,
    detectColors,
    detectMemories,
    generateProductOptionFullName,
    getMemoryFromParameters,
    getSortAndFilterParamsFromRequestQuery,
} = require('../helper/productHelper');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapProductViewToProductAdmin } = require('../../mapper/productMapper');
const {
    deleteProductOptionInProductIds,
    findProductOptionById,
    findProdutOptionByProductAndOptionId,
    findProductOptionsByIds,
    saveProductOption,
    updateProductOption,
    updateProductOptionIsDefault,
    updateProductOptionsProductInfo,
} = require('../../repository/productOptionRepository');
const {
    countPopularProducts,
    countProducts,
    deleteManyProducts,
    findPopularProducts,
    findProductById,
    findProductByManufacturerAndModel,
    findProductByOptionId,
    findProducts,
    saveProduct,
    updateProduct,
} = require('../../repository/productRepository');
const { flushCache, getFromCache, setInCache } = require('../../utils/cacheUtils');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    checkAndPopulateLoans.mockReturnValue(Promise.resolve('loanOptions'));
    checkIdentificator.mockImplementation(() => {});
    countPopularProducts.mockReturnValue(Promise.resolve(1));
    detectColors.mockReturnValue('colors');
    detectMemories.mockReturnValue('memoryOptions');
    findProductById.mockReturnValue({ options: [] });
    findProductByManufacturerAndModel.mockReturnValue(Promise.resolve(null));
    flushCache.mockImplementation(() => {});
    generateProductOptionFullName.mockReturnValue('fullProductName');
    getMemoryFromParameters.mockReturnValue('memory');
    mapProductViewToProductAdmin.mockReturnValue('productEntity');
    saveProduct.mockReturnValue('savedProductEntity');
    saveProductOption.mockReturnValue({ _id: 'id' });
    setInCache.mockImplementation(() => {});
    updateProductOptionIsDefault.mockImplementation(() => Promise.resolve());
});

describe('productService', () => {
    describe('addNewProduct', () => {
        test('success', async () => {
            const result = await addNewProduct('productView', 'userId');

            expect(result).toBe('savedProductEntity');
            expect(findProductByManufacturerAndModel).toHaveBeenCalledTimes(1);
            expect(mapProductViewToProductAdmin).toHaveBeenCalledTimes(1);
            expect(saveProduct).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when productView param not defined', async () => {
            await expect(addNewProduct(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(addNewProduct('productView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when such product already exists', async () => {
            findProductByManufacturerAndModel.mockReturnValue(Promise.resolve('productEntity'));

            await expect(addNewProduct('productView', 'userId')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot save product', async () => {
            saveProduct.mockReturnValue(Promise.resolve(null));

            await expect(addNewProduct('productView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('addNewProductOption', () => {
        test('success - when default product option', async () => {
            const result = await addNewProductOption('productId', { isDefault: true }, 'userId');

            expect(result._id).toBe('id');
            expect(findProductById).toHaveBeenCalledTimes(1);
            expect(checkIdentificator).toHaveBeenCalledTimes(1);
            expect(getMemoryFromParameters).toHaveBeenCalledTimes(1);
            expect(checkAndPopulateLoans).toHaveBeenCalledTimes(1);
            expect(generateProductOptionFullName).toHaveBeenCalledTimes(1);
            expect(updateProductOptionIsDefault).toHaveBeenCalledTimes(1);
            expect(saveProductOption).toHaveBeenCalledTimes(1);
            expect(detectMemories).toHaveBeenCalledTimes(1);
            expect(saveProduct).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('success - when not default product option', async () => {
            const result = await addNewProductOption('productId', { isDefault: false }, 'userId');

            expect(result._id).toBe('id');
            expect(findProductById).toHaveBeenCalledTimes(1);
            expect(checkIdentificator).toHaveBeenCalledTimes(1);
            expect(getMemoryFromParameters).toHaveBeenCalledTimes(1);
            expect(checkAndPopulateLoans).toHaveBeenCalledTimes(1);
            expect(generateProductOptionFullName).toHaveBeenCalledTimes(1);
            expect(saveProductOption).toHaveBeenCalledTimes(1);
            expect(detectMemories).toHaveBeenCalledTimes(1);
            expect(saveProduct).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
            expect(updateProductOptionIsDefault).toHaveBeenCalledTimes(0);
        });

        test('throws general exception when productId param not defined', async () => {
            await expect(addNewProductOption(null, { isDefault: false }, 'userId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when productOption param not defined', async () => {
            await expect(addNewProductOption('productId', null, 'userId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(addNewProductOption('productId', { isDefault: false }, null)).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws not found exception when product not found', async () => {
            findProductById.mockReturnValue(Promise.resolve(null));

            await expect(addNewProductOption('productId', { isDefault: false }, 'userId')).rejects.toEqual(
                expect.any(NotFoundException)
            );
        });

        test('throws general exception when cannot save product option', async () => {
            saveProductOption.mockReturnValue(null);

            await expect(addNewProductOption('productId', { isDefault: false }, 'userId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when cannot save product', async () => {
            saveProduct.mockReturnValue(null);

            await expect(addNewProductOption('productId', { isDefault: false }, 'userId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });
    });

    describe('addToPopularProducts', () => {
        beforeEach(() => {
            findProductById.mockReturnValue(Promise.resolve({ options: [{ published: true }] }));
        });

        test('success', async () => {
            const result = await addToPopularProducts('id', 'order');

            expect(result).toBe('savedProductEntity');
            expect(countPopularProducts).toHaveBeenCalledTimes(1);
            expect(findProductById).toHaveBeenCalledTimes(1);
            expect(saveProduct).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(addToPopularProducts(null, 'order')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when order param not defined', async () => {
            await expect(addToPopularProducts('id')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when max no of popular products achieved', async () => {
            countPopularProducts.mockReturnValue(Promise.resolve(36));

            await expect(addToPopularProducts('id', 'order')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws not found exception when product not found', async () => {
            findProductById.mockReturnValue(null);

            await expect(addToPopularProducts('id', 'order')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when product does not have published options', async () => {
            findProductById.mockReturnValue(Promise.resolve({ options: [{ published: false }] }));

            await expect(addToPopularProducts('id', 'order')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save product', async () => {
            saveProduct.mockReturnValue(Promise.resolve(null));

            await expect(addToPopularProducts('id', 'order')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllPopularProducts', () => {
        beforeEach(() => {
            getFromCache.mockReturnValue([{ _id: 'p1' }, { _id: 'p2' }]);
            findPopularProducts.mockReturnValue(Promise.resolve([{ _id: 'p1' }, { _id: 'p2' }]));
        });

        test('success - hits cache', async () => {
            const result = await getAllPopularProducts();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findPopularProducts).toHaveBeenCalledTimes(0);
        });

        test('success - db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getAllPopularProducts();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findPopularProducts).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get products', async () => {
            getFromCache.mockReturnValue(null);
            findPopularProducts.mockReturnValue(Promise.resolve(null));

            await expect(getAllPopularProducts()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getManyProductOptionsByIds', () => {
        beforeEach(() => {
            findProductOptionsByIds.mockReturnValue(Promise.resolve([{ _id: 'id1' }, { _id: 'id2' }]));
        });

        test('success', async () => {
            const result = await getManyProductOptionsByIds(['id1', 'id2']);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(findProductOptionsByIds).toHaveBeenCalledTimes(1);
        });

        test('returns empty array when ids param not defined', async () => {
            const result = await getManyProductOptionsByIds();

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });

        test('returns empty array when ids param is empty array', async () => {
            const result = await getManyProductOptionsByIds([]);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });

        test('throws general exception when cannot get product options', async () => {
            findProductOptionsByIds.mockReturnValue(Promise.resolve(null));

            await expect(getAllPopularProducts(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getManyProducts', () => {
        beforeEach(() => {
            countProducts.mockReturnValue(Promise.resolve(2));
            getSortAndFilterParamsFromRequestQuery.mockReturnValue(Promise.resolve({ limit: 'limit', page: 'page' }));
            findProducts.mockReturnValue(
                Promise.resolve({ filter: 'filter', query: 'query', products: [{ _id: 'id1' }, { _id: 'id2' }] })
            );
        });

        test('success', async () => {
            const result = await getManyProducts('requestQuery');

            expect(result).toBeDefined();
            expect(result.limit).toBe('limit');
            expect(result.page).toBe('page');
            expect(result.total).toBe(2);
            expect(result.products).toBeDefined();
            expect(result.products.length).toBe(2);
            expect(getSortAndFilterParamsFromRequestQuery).toHaveBeenCalledTimes(1);
            expect(findProducts).toHaveBeenCalledTimes(1);
            expect(detectColors).toHaveBeenCalledTimes(2);
            expect(countProducts).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when requestQuery param not defined', async () => {
            await expect(getManyProducts()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot get filter params', async () => {
            getSortAndFilterParamsFromRequestQuery.mockReturnValue(Promise.resolve(null));

            await expect(getManyProducts('requestQuery')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot get products', async () => {
            findProducts.mockReturnValue(Promise.resolve({ filter: 'filter', query: 'query', products: null }));

            await expect(getManyProducts('requestQuery')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getProductById', () => {
        beforeEach(() => {
            findProductById.mockReturnValue(
                Promise.resolve({
                    options: [{ published: true }, { published: true }, { published: false }],
                })
            );
            getFromCache.mockReturnValue(null);
        });

        test('success - hits cache', async () => {
            getFromCache.mockReturnValue('productEntity');
            const result = await getProductById('id');

            expect(result).toBeDefined();
            expect(result).toBe('productEntity');
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findProductById).toHaveBeenCalledTimes(0);
            expect(detectColors).toHaveBeenCalledTimes(0);
            expect(setInCache).toHaveBeenCalledTimes(0);
        });

        test('success - db', async () => {
            getFromCache.mockReturnValue(null);

            const result = await getProductById('id');

            expect(result).toBeDefined();
            expect(result.options).toBeDefined();
            expect(result.options.length).toBe(2);
            expect(getFromCache).toHaveBeenCalledTimes(1);
            expect(findProductById).toHaveBeenCalledTimes(1);
            expect(detectColors).toHaveBeenCalledTimes(1);
            expect(setInCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(getProductById()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when product not found', async () => {
            findProductById.mockReturnValue(Promise.resolve(null));

            await expect(getProductById('id')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('getProductOptionById', () => {
        beforeEach(() => {
            findProductOptionById.mockReturnValue(Promise.resolve('productOptionEntity'));
        });

        test('success', async () => {
            const result = await getProductOptionById('id');

            expect(result).toBe('productOptionEntity');
            expect(findProductOptionById).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(getProductOptionById()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when product option not found', async () => {
            findProductOptionById.mockReturnValue(Promise.resolve(null));

            await expect(getProductOptionById('id')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('getProductOptionByProductIdAndId', () => {
        beforeEach(() => {
            findProdutOptionByProductAndOptionId.mockReturnValue(Promise.resolve('productOption'));
        });

        test('success', async () => {
            const result = await getProductOptionByProductIdAndId('id', 'optionId');

            expect(result).toBe('productOption');
            expect(findProdutOptionByProductAndOptionId).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(getProductOptionByProductIdAndId(null, 'optionId')).rejects.toEqual(
                expect.any(GeneralException)
            );
        });

        test('throws general exception when id param not defined', async () => {
            await expect(getProductOptionByProductIdAndId('id')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when product option not found', async () => {
            findProdutOptionByProductAndOptionId.mockReturnValue(Promise.resolve(null));

            await expect(getProductOptionByProductIdAndId('id', 'optionId')).rejects.toEqual(
                expect.any(NotFoundException)
            );
        });
    });

    describe('modifyProduct', () => {
        beforeEach(() => {
            updateProduct.mockReturnValue(Promise.resolve('updatedProductEntity'));
            updateProductOptionsProductInfo.mockReturnValue(Promise.resolve('updated'));
        });

        test('success', async () => {
            const result = await modifyProduct('id', 'product', 'userId');

            expect(result).toBe('updatedProductEntity');
            expect(findProductById).toHaveBeenCalledTimes(1);
            expect(mapProductViewToProductAdmin).toHaveBeenCalledTimes(1);
            expect(detectMemories).toHaveBeenCalledTimes(1);
            expect(updateProduct).toHaveBeenCalledTimes(1);
            expect(updateProductOptionsProductInfo).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyProduct(null, 'product', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when product param not defined', async () => {
            await expect(modifyProduct('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(modifyProduct('id', 'product')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when product not found', async () => {
            findProductById.mockReturnValue(Promise.resolve(null));

            await expect(modifyProduct('id', 'product', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot update product', async () => {
            updateProduct.mockReturnValue(Promise.resolve(null));

            await expect(modifyProduct('id', 'product', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('modifyProductOption', () => {
        beforeEach(() => {
            findProductByOptionId.mockReturnValue(Promise.resolve('productEntity'));
            updateProduct.mockReturnValue(Promise.resolve('updatedProductEntity'));
            updateProductOption.mockReturnValue(Promise.resolve('updatedProductOptionEntity'));
        });

        test('success', async () => {
            const result = await modifyProductOption('id', 'option', 'userId');

            expect(result).toBe('updatedProductOptionEntity');
            expect(checkAndPopulateLoans).toHaveBeenCalledTimes(1);
            expect(getMemoryFromParameters).toHaveBeenCalledTimes(1);
            expect(updateProductOption).toHaveBeenCalledTimes(1);
            expect(findProductByOptionId).toHaveBeenCalledTimes(1);
            expect(detectMemories).toHaveBeenCalledTimes(1);
            expect(updateProduct).toHaveBeenCalledTimes(1);
            expect(flushCache).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyProductOption(null, 'option', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when option param not defined', async () => {
            await expect(modifyProductOption('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(modifyProductOption('id', 'options')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when cannot update option', async () => {
            updateProductOption.mockReturnValue(Promise.resolve(null));

            await expect(modifyProductOption('id', 'options', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws not found exception when cannot find product by option id', async () => {
            findProductByOptionId.mockReturnValue(Promise.resolve(null));

            await expect(modifyProductOption('id', 'options', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws not found exception when cannot update product', async () => {
            updateProduct.mockReturnValue(Promise.resolve(null));

            await expect(modifyProductOption('id', 'options', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('GeneralException', () => {
        beforeEach(() => {
            deleteManyProducts.mockReturnValue(Promise.resolve('deleted'));
            deleteProductOptionInProductIds.mockReturnValue(Promise.resolve('deleted'));
        });

        test('success', async () => {
            await removeManyProducts(['id1', 'id2']);

            expect(deleteManyProducts).toHaveBeenCalledTimes(1);
            expect(deleteProductOptionInProductIds).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when productIds param not defined', async () => {
            await expect(removeManyProducts()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when productIds param is empty array', async () => {
            await expect(removeManyProducts([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete products', async () => {
            deleteManyProducts.mockReturnValue(Promise.resolve(null));

            await expect(removeManyProducts(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete product options', async () => {
            deleteProductOptionInProductIds.mockReturnValue(Promise.resolve(null));

            await expect(removeManyProducts(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
