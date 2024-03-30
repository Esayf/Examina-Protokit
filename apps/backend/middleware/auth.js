const  isAuthenticated = (req, res, next) => {
	if (req.session.user) next()
	else next('route')
}
module.exports = isAuthenticated;