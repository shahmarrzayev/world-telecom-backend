const { mapLoanEntityToLoanView, mapLoanEntityToLoanViewAdmin, mapLoanViewToLoanEntity } = require('../loanMapper');

const loanMock = {
    _id: '_id',
    active: 'active',
    title: 'title',
    image: 'image',
    color: 'color',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    unknownParam: 'unknownParam',
};

describe('loanMapper', () => {
    describe('mapLoanEntityToLoanView', () => {
        test('success', () => {
            const view = mapLoanEntityToLoanView(loanMock);

            expect(view._id).toBe(loanMock._id);
            expect(view.active).toBe(loanMock.active);
            expect(view.title).toBe(loanMock.title);
            expect(view.image).toBe(loanMock.image);
            expect(view.color).toBe(loanMock.color);

            expect(view.createdBy).not.toBeDefined();
            expect(view.updatedBy).not.toBeDefined();
            expect(view.createdAt).not.toBeDefined();
            expect(view.updatedAt).not.toBeDefined();
            expect(view.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const view = mapLoanEntityToLoanView();

            expect(view).toBeNull();
        });
    });

    describe('mapLoanEntityToLoanViewAdmin', () => {
        test('success', () => {
            const view = mapLoanEntityToLoanViewAdmin(loanMock);

            expect(view._id).toBe(loanMock._id);
            expect(view.active).toBe(loanMock.active);
            expect(view.title).toBe(loanMock.title);
            expect(view.image).toBe(loanMock.image);
            expect(view.color).toBe(loanMock.color);
            expect(view.createdBy).toBe(loanMock.createdBy);
            expect(view.createdAt).toBe(loanMock.createdAt);

            expect(view.updatedBy).not.toBeDefined();
            expect(view.updatedAt).not.toBeDefined();
            expect(view.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const view = mapLoanEntityToLoanViewAdmin();

            expect(view).toBeNull();
        });
    });

    describe('mapLoanViewToLoanEntity', () => {
        test('success', () => {
            const entity = mapLoanViewToLoanEntity(loanMock);

            expect(entity.active).toBe(loanMock.active);
            expect(entity.title).toBe(loanMock.title);
            expect(entity.image).toBe(loanMock.image);
            expect(entity.color).toBe(loanMock.color);

            expect(entity._id).not.toBeDefined();
            expect(entity.createdBy).not.toBeDefined();
            expect(entity.updatedBy).not.toBeDefined();
            expect(entity.createdAt).not.toBeDefined();
            expect(entity.updatedAt).not.toBeDefined();
            expect(entity.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is not defined', () => {
            const entity = mapLoanViewToLoanEntity();

            expect(entity).toBeNull();
        });
    });
});
