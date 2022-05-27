jest.mock('winston');

const { generateProductOptionFullName, mapOneSPricesToProductOption } = require('../productHelper');

describe('productHelper', () => {
    describe('generateProductOptionFullName', () => {
        test('success - with identificator', () => {
            const productEntity = {
                manufacturer: 'manufacturer',
                model: 'model',
            };
            const productOptionEntity = { identificator: 'identificator' };

            const result = generateProductOptionFullName(productEntity, productOptionEntity);

            expect(result).toBe('manufacturer model identificator');
        });

        test('success - without identificator', () => {
            const productEntity = {
                manufacturer: 'manufacturer',
                model: 'model',
            };

            const result = generateProductOptionFullName(productEntity, {});

            expect(result).toBe('manufacturer model');
        });

        test('returns null when productEntity param not defined', () => {
            const result = generateProductOptionFullName(null, {});

            expect(result).toBe(null);
        });

        test('returns null when productOptionEntity param not defined', () => {
            const result = generateProductOptionFullName({});

            expect(result).toBe(null);
        });
    });

    describe('mapOneSPricesToProductOption', () => {
        test('success', () => {
            const productOption = {
                price: 1,
                discount: { price: 1 },
                loanOptions: [
                    { period: 6, price: 1, title: 'Daxili kredit' },
                    { period: 12, price: 2, title: 'Daxili kredit' },
                    { period: 18, price: 3, title: 'Daxili kredit' },
                    { period: 18, price: 3, title: 'EXTERNAL LOAN' },
                ],
            };
            const oneSPriceMapping = {
                price: 10,
                discountedPrice: 8,
                loan12Months: 12,
                loan18Months: 18,
            };

            const result = mapOneSPricesToProductOption(productOption, oneSPriceMapping);

            expect(result).toBeDefined();
            expect(result.price).toBe(oneSPriceMapping.price);
            expect(result.discount.price).toBe(oneSPriceMapping.discountedPrice);

            const loan6Months = result.loanOptions.find(lo => lo.period === 6);
            expect(loan6Months).toBeDefined();
            expect(loan6Months.price).toBe(oneSPriceMapping.price);

            const loan12Months = result.loanOptions.find(lo => lo.period === 12);
            expect(loan12Months).toBeDefined();
            expect(loan12Months.price).toBe(oneSPriceMapping.loan12Months);
            expect(loan12Months.firstPayment).toBe(0);

            const loan18Months = result.loanOptions.find(lo => lo.period === 18);
            expect(loan18Months).toBeDefined();
            expect(loan18Months.price).toBe(oneSPriceMapping.loan18Months);
            expect(loan18Months.firstPayment).toBe(0);

            const externalLoan = result.loanOptions.find(lo => lo.title === 'EXTERNAL LOAN');
            expect(externalLoan).toBeDefined();
            expect(externalLoan.price).toBe(oneSPriceMapping.discountedPrice);
        });
    });
});
