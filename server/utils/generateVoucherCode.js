const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateVoucherCode = () => {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
};

module.exports = generateVoucherCode;