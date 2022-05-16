import passport from "passport";
import { Strategy as VKStrategy } from "passport-vkontakte";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};
passport.use(
  new JwtStrategy(opts, (jwt_payload: any, done: any) => {
    done(null, jwt_payload);
  })
);

passport.use(
  "vk",
  new VKStrategy(
    {
      clientID: process.env.VK_APP_ID as string,
      clientSecret: process.env.VK_APP_SECRET as string,
      callbackURL:
        "https://it-coursework-server.herokuapp.com/auth/vk/callback",
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
