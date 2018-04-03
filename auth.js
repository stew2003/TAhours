const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            clientID: "934708699046-86kkmhr565r3hibv1f7ea67sa9q3d9a3.apps.googleusercontent.com",
            clientSecret: "NhkQeR59NIFbZFIvZiD1cTAs",
            callbackURL: "http://localhost:8080/auth/google/callback"
        },
        (token, refreshToken, profile, done) => {
            return done(null, {
                profile: profile,
                token: token
            });
        }));
};