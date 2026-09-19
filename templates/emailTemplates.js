const newCouponTemplate = (user, coupon) => {
    return `
        <h2>🎉 New Coupon Available!</h2>

        <p>Hello ${user.name},</p>

        <p>
            A new coupon is available for you on FastBeetle.
        </p>

        <hr>

        <p><strong>Coupon:</strong> ${coupon.code}</p>
        <p><strong>Discount:</strong> ${coupon.discountValue}</p>
        <p><strong>Valid From:</strong> ${coupon.startDate}</p>
        <p><strong>Valid Until:</strong> ${coupon.endDate}</p>

        <hr>

        <p>Use this coupon on your next order.</p>

        <p>
            Thank you,<br>
            FastBeetle
        </p>
    `;
};

module.exports = {
    newCouponTemplate
};