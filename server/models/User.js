// server/models/User.js
import { Model } from 'objection';

export default class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password'], // Fields that are required
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', minLength: 2, maxLength: 20 },
        password: { type: 'string', minLength: 5, maxLength: 255 },
      },
    };
  }
}
