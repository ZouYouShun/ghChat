/**
 * @file 处理验证的中间件
 */

import * as jwt from 'jsonwebtoken';
import { environment } from '@env';

export const authVerify = (token) => {
  try {
    // 解码取出之前存在payload的user_id
    const payload = jwt.verify(token, environment.jwt_secret);
    return payload;
  } catch (err) {
    // ctx.throw(401, err);
    console.error(err);
    return false;
  }
};
