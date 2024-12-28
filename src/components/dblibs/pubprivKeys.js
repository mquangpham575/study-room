import crypto from 'crypto';

export const handleDecryptKey = (c_privateKey, iv, password) => {
    console.warn(c_privateKey);

    let hash = crypto.createHash('sha256').update(password).digest('hex');
    let ivv = Buffer.from(iv, 'hex');

    let cipher = crypto
    .createDecipheriv('aes-256-cbc', Buffer.from(hash, 'hex'), ivv);

    let d_cipher = cipher.update(c_privateKey, 'hex', 'utf8');
    let final = d_cipher + cipher.final('utf8');

    return final;
};

export const aesEncrypt = (data, key, iv) => {
  let cipher = crypto.createCipheriv('aes-256-cbc',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex'));
  let ciphered = cipher.update(data, 'utf16le', 'hex');
  
  return ciphered + cipher.final('hex');
}

export const aesDecrypt = (data, key, iv) => {
  let cipher = crypto.createDecipheriv('aes-256-cbc',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex'));
  let ciphered = cipher.update(data, 'hex', 'utf16le');
  
  return ciphered + cipher.final('utf16le');
}

export const encrypt = (data, publicKey) => {
    const encryptedData = crypto.publicEncrypt(
      publicKey, Buffer.from(data)
    );
    return encryptedData.toString('base64');
};
  
export const decrypt = (encryptedData, privateKey, outType) => {
    const decryptedData = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: 'B2001559'
      },
      Buffer.from(encryptedData, 'base64')
    );
    return decryptedData.toString(outType || 'utf8');
};

export const decryptMessage = (msg, key, iv) => {
  if (msg.content.type !== 'schedule'
      && msg.content.type !== 'quiz')
  {
    return aesDecrypt(msg.content.cont,
          key, iv);    
  }

  return {
    name :aesDecrypt(msg.content.name, key, iv),
    id: aesDecrypt(msg.content.id, key, iv)
  }
}