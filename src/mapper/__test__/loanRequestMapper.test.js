const {
    mapLoanRequestEntityToLoanRequestView,
    mapLoanRequestViewToLoanRequestEntity,
    mapNumberEntityToOrderedNumber,
    mapProductOptionEntityToOrderedProductOption,
} = require('../loanRequestMapper');

const loanRequestMock = {
    _id: '_id',
    fullName: 'fullName',
    mobilePhone: 'mobilePhone',
    birthDate: 'birthDate',
    registeredAddress: 'registeredAddress',
    registeredAddressPhone: 'registeredAddressPhone',
    actualAddress: 'actualAddress',
    actualAddressPhone: 'actualAddressPhone',
    param: 'param',
    orderId: 'orderId',
    orderedProductOption: 'orderedProductOption',
    orderedNumber: 'orderedNumber',
    status: 'status',
    wtStatus: 'wtStatus',
    totalPrice: 'totalPrice',
    idInfo: {
        serialType: 'serialType',
        serialNumber: 'serialNumber',
        pin: 'pin',
        unknownParam: 'unknownParam',
    },
    jobInfo: {
        workPlace: 'workPlace',
        position: 'position',
        phone: 'phone',
        experience: 'experience',
        experienceMeasure: 'experienceMeasure',
        salary: 'salary',
        salaryCurrency: 'salaryCurrency',
        unknownParam: 'unknownParam',
    },
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    unknownParam: 'unknownParam',
};

const numberMock = {
    _id: '_id',
    operator: 'operator',
    number: 'number',
    price: 'price',
    loanPrice: 'loanPrice',
    unknownParam: 'unknownParam',
};

const productOptionMock = {
    _id: '_id',
    product: {
        manufacturer: 'manufacturer',
        model: 'model',
    },
    identificator: 'identificator',
    price: 'price',
    unknownParam: 'unknownParam',
};

describe('loanRequestMapper', () => {
    describe('mapLoanRequestEntityToLoanRequestView', () => {
        test('success', () => {
            const result = mapLoanRequestEntityToLoanRequestView(loanRequestMock);

            expect(result).toBeDefined();
            expect(result._id).toBe(loanRequestMock._id);
            expect(result.fullName).toBe(loanRequestMock.fullName);
            expect(result.mobilePhone).toBe(loanRequestMock.mobilePhone);
            expect(result.birthDate).toBe(loanRequestMock.birthDate);
            expect(result.registeredAddress).toBe(loanRequestMock.registeredAddress);
            expect(result.registeredAddressPhone).toBe(loanRequestMock.registeredAddressPhone);
            expect(result.actualAddress).toBe(loanRequestMock.actualAddress);
            expect(result.actualAddressPhone).toBe(loanRequestMock.actualAddressPhone);
            expect(result.param).toBe(loanRequestMock.param);
            expect(result.orderId).toBe(loanRequestMock.orderId);
            expect(result.orderedProductOption).toBe(loanRequestMock.orderedProductOption);
            expect(result.orderedNumber).toBe(loanRequestMock.orderedNumber);
            expect(result.status).toBe(loanRequestMock.status);
            expect(result.wtStatus).toBe(loanRequestMock.wtStatus);
            expect(result.totalPrice).toBe(loanRequestMock.totalPrice);
            expect(result.idInfo).toBe(loanRequestMock.idInfo);
            expect(result.createdAt).toBe(loanRequestMock.createdAt);

            expect(result.createdBy).not.toBeDefined();
            expect(result.updatedAt).not.toBeDefined();
            expect(result.updatedBy).not.toBeDefined();
            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const result = mapLoanRequestEntityToLoanRequestView();

            expect(result).toBeNull();
        });
    });

    describe('mapLoanRequestViewToLoanRequestEntity', () => {
        test('success', () => {
            const result = mapLoanRequestViewToLoanRequestEntity(loanRequestMock);

            expect(result).toBeDefined();
            expect(result.fullName).toBe(loanRequestMock.fullName);
            expect(result.mobilePhone).toBe(loanRequestMock.mobilePhone);
            expect(result.birthDate).toBe(loanRequestMock.birthDate);
            expect(result.registeredAddress).toBe(loanRequestMock.registeredAddress);
            expect(result.registeredAddressPhone).toBe(loanRequestMock.registeredAddressPhone);
            expect(result.actualAddress).toBe(loanRequestMock.actualAddress);
            expect(result.actualAddressPhone).toBe(loanRequestMock.actualAddressPhone);
            expect(result.orderedProductOption).toBe(loanRequestMock.orderedProductOption);
            expect(result.orderedNumber).toBe(loanRequestMock.orderedNumber);
            expect(result.idInfo).toBeDefined();
            expect(result.idInfo.serialType).toBe(loanRequestMock.idInfo.serialType);
            expect(result.idInfo.serialNumber).toBe(loanRequestMock.idInfo.serialNumber);
            expect(result.idInfo.pin).toBe(loanRequestMock.idInfo.pin);
            expect(result.jobInfo).toBeDefined();
            expect(result.jobInfo.workPlace).toBe(loanRequestMock.jobInfo.workPlace);
            expect(result.jobInfo.position).toBe(loanRequestMock.jobInfo.position);
            expect(result.jobInfo.phone).toBe(loanRequestMock.jobInfo.phone);
            expect(result.jobInfo.experience).toBe(loanRequestMock.jobInfo.experience);
            expect(result.jobInfo.experienceMeasure).toBe(loanRequestMock.jobInfo.experienceMeasure);
            expect(result.jobInfo.salary).toBe(loanRequestMock.jobInfo.salary);
            expect(result.jobInfo.salaryCurrency).toBe(loanRequestMock.jobInfo.salaryCurrency);

            expect(result._id).not.toBeDefined();
            expect(result.param).not.toBeDefined();
            expect(result.orderId).not.toBeDefined();
            expect(result.status).not.toBeDefined();
            expect(result.wtStatus).not.toBeDefined();
            expect(result.idInfo.unknownParam).not.toBeDefined();
            expect(result.jobInfo.unknownParam).not.toBeDefined();
            expect(result.createdBy).not.toBeDefined();
            expect(result.updatedAt).not.toBeDefined();
            expect(result.updatedBy).not.toBeDefined();
            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when view param is not defined', () => {
            const result = mapLoanRequestViewToLoanRequestEntity();

            expect(result).toBeNull();
        });
    });

    describe('mapNumberEntityToOrderedNumber', () => {
        test('success', () => {
            const result = mapNumberEntityToOrderedNumber(numberMock);

            expect(result).toBeDefined();
            expect(result._id).toBe(numberMock._id);
            expect(result.operator).toBe(numberMock.operator);
            expect(result.number).toBe(numberMock.number);
            expect(result.price).toBe(numberMock.price);
            expect(result.loanPrice).toBe(numberMock.loanPrice);

            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const result = mapNumberEntityToOrderedNumber();

            expect(result).toBeNull();
        });
    });

    describe('mapProductOptionEntityToOrderedProductOption', () => {
        test('success', () => {
            const result = mapProductOptionEntityToOrderedProductOption(productOptionMock);

            expect(result).toBeDefined();
            expect(result._id).toBe(productOptionMock._id);
            expect(result.manufacturer).toBe(productOptionMock.product.manufacturer);
            expect(result.model).toBe(productOptionMock.product.model);
            expect(result.identificator).toBe(productOptionMock.identificator);
            expect(result.price).toBe(productOptionMock.price);

            expect(result.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const result = mapProductOptionEntityToOrderedProductOption();

            expect(result).toBeNull();
        });
    });
});
