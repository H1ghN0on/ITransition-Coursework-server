import passport from "passport";
import { Strategy as VKStrategy } from "passport-vkontakte";

const { User } = require("../models");

passport.use(
  "vk",
  new VKStrategy(
    {
      clientID: process.env.VK_APP_ID as string,
      clientSecret: process.env.VK_APP_SECRET as string,
      callbackURL: "http://localhost:3001/auth/vk/callback",
    },
    async (accessToken, refreshToken, params, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj: any, cb) => {
  cb(null, obj);
});

export { passport };
