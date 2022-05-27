jest.mock('winston');
jest.mock('@sendgrid/mail');
jest.mock('../../utils/commonUtils');

const sendgridMail = require('@sendgrid/mail');

const { sendMail } = require('../mailClient');
const { getFromEnv } = require('../../utils/commonUtils');

afterEach(() => {
    jest.clearAllMocks();
});

describe('mailClient', () => {
    describe('sendMail', () => {
        beforeEach(() => {
            getFromEnv.mockReturnValue('someValue');
            sendgridMail.setApiKey.mockImplementation(() => {});
            sendgridMail.send.mockImplementation(() => {});
        });

        test('success', () => {
            sendMail('to', 'subject', 'text');

            expect(getFromEnv).toHaveBeenCalledTimes(2);
            expect(sendgridMail.setApiKey).toHaveBeenCalledTimes(1);
            expect(sendgridMail.send).toHaveBeenCalledTimes(1);
        });

        test('returns when to param not defined', () => {
            sendMail(null, 'subject', 'text');

            expect(getFromEnv).toHaveBeenCalledTimes(0);
            expect(sendgridMail.setApiKey).toHaveBeenCalledTimes(0);
            expect(sendgridMail.send).toHaveBeenCalledTimes(0);
        });

        test('returns when subject param not defined', () => {
            sendMail('to', null, 'text');

            expect(getFromEnv).toHaveBeenCalledTimes(0);
            expect(sendgridMail.setApiKey).toHaveBeenCalledTimes(0);
            expect(sendgridMail.send).toHaveBeenCalledTimes(0);
        });

        test('returns when text param not defined', () => {
            sendMail('to', 'subject');

            expect(getFromEnv).toHaveBeenCalledTimes(0);
            expect(sendgridMail.setApiKey).toHaveBeenCalledTimes(0);
            expect(sendgridMail.send).toHaveBeenCalledTimes(0);
        });

        test('returns when sendgridMail throws exception', () => {
            sendgridMail.send.mockImplementation(() => {
                throw new Error();
            });

            sendMail('to', 'subject', 'text');

            expect(getFromEnv).toHaveBeenCalledTimes(2);
            expect(sendgridMail.setApiKey).toHaveBeenCalledTimes(1);
            expect(sendgridMail.send).toHaveBeenCalledTimes(1);
        });
    });
});
