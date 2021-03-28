
function adminGuard(req, res, next) {
  console.log(req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).send({ error: 'User should have admin access to use this endpoint' });
  }
}

module.exports = {
  adminGuard,
};
