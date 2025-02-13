
module.exports = async (number, groupInviteLink, client) => {
    try {
        console.log(number);
        if (!number || !number.substring) throw "err";
        const contact = '972' + number.substring(1) + '@c.us';
        let message =
            `تقديسة مباركة!
تم تسجيلك بنجاح للباص
الرجاء الدخول الى المجموعة التالية لانهاء تسجيلك!
        ${groupInviteLink}`;
        await client.sendText(contact, message);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}




