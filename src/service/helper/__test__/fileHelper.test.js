jest.mock('winston');

const fs = require('fs');

const { parseNumberExcelFile } = require('../fileHelper');

afterEach(() => {
    jest.clearAllMocks();
});

describe('fileHelper', () => {
    describe('parseNumberExcelFile', () => {
        test('success', () => {
            const file = fs.readFileSync(`${__dirname}/testNumberFile.xlsx`);
            const result = parseNumberExcelFile(file, 'userId');
            expect(result).toBeDefined();
            expect(result.length).toBe(3);

            expect(result[0].operator).toBe('050');
            expect(result[0].number).toBe('5505342');
            expect(result[0].digitOne).toBe('5');
            expect(result[0].digitTwo).toBe('5');
            expect(result[0].digitThree).toBe('0');
            expect(result[0].digitFour).toBe('5');
            expect(result[0].digitFive).toBe('3');
            expect(result[0].digitSix).toBe('4');
            expect(result[0].digitSeven).toBe('2');
            expect(result[0].price).toBe(1000);
            expect(result[0].loanPrice).toBe(1100);

            expect(result[1].operator).toBe('055');
            expect(result[1].number).toBe('5505343');
            expect(result[1].digitOne).toBe('5');
            expect(result[1].digitTwo).toBe('5');
            expect(result[1].digitThree).toBe('0');
            expect(result[1].digitFour).toBe('5');
            expect(result[1].digitFive).toBe('3');
            expect(result[1].digitSix).toBe('4');
            expect(result[1].digitSeven).toBe('3');
            expect(result[1].price).toBe(2000);
            expect(result[1].loanPrice).toBe(2200);

            expect(result[2].operator).toBe('099');
            expect(result[2].number).toBe('5505344');
            expect(result[2].digitOne).toBe('5');
            expect(result[2].digitTwo).toBe('5');
            expect(result[2].digitThree).toBe('0');
            expect(result[2].digitFour).toBe('5');
            expect(result[2].digitFive).toBe('3');
            expect(result[2].digitSix).toBe('4');
            expect(result[2].digitSeven).toBe('4');
            expect(result[2].price).toBe(3000);
            expect(result[2].loanPrice).toBe(3300);
        });
    });
});
