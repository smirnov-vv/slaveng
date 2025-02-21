import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';

passport.use(
  new LocalStrategy(async (email, password, done) => {
    const user = await User.findByUsername(email); // findByUsername -> findByEmail ?
    if (!user) return done(null, false);
    if (user.password !== password) return done(null, false);
    return done(null, user);
  })
);
