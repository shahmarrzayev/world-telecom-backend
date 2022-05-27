const { mapBranchEntityToBranchAdminView } = require('../branchMapper');

const branch = {
    _id: '_id',
    address: 'address',
    name: 'name',
    lat: 'lat',
    lng: 'lng',
    phone: 'phone',
    type: 'type',
    order: 'order',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    unknownParam: 'unknownParam',
};

describe('branchMapper', () => {
    describe('mapBranchEntityToBranchAdminView', () => {
        test('success', () => {
            const branchAdminView = mapBranchEntityToBranchAdminView(branch);

            expect(branchAdminView._id).toBe(branch._id);
            expect(branchAdminView.address).toBe(branch.address);
            expect(branchAdminView.name).toBe(branch.name);
            expect(branchAdminView.lat).toBe(branch.lat);
            expect(branchAdminView.lng).toBe(branch.lng);
            expect(branchAdminView.phone).toBe(branch.phone);
            expect(branchAdminView.type).toBe(branch.type);
            expect(branchAdminView.order).toBe(branch.order);
            expect(branchAdminView.createdAt).toBe(branch.createdAt);
            expect(branchAdminView.createdBy).not.toBeDefined();
            expect(branchAdminView.unknownParam).not.toBeDefined();
        });

        test('returns null when entity param is null', () => {
            const branchAdminView = mapBranchEntityToBranchAdminView();

            expect(branchAdminView).toBeNull();
        });
    });
});
