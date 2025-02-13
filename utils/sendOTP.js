
module.exports = async (number, otp, client) => {
    return new Promise(async (resolve, reject) => {
        try {
            const contact = '972' + number.substring(1) + '@c.us';
            let message =
                `السلام عليكم ورحمة الله.
رمز التحقق الخاص بك هو:

*${otp.create(number)}*
        
ملاحظة: الرمز يعمل لمدة خمس دقائق فقط..`;
            await client.sendText(contact, message);
            resolve();
        } catch (error) {

            console.error(`Failed to send otp to ${number}`, error);
            reject(error);
        }
    });
}



