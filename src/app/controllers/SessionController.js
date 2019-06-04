const { User } = require('../models')

class SessionController {
  async create (req, res) {
    return res.render('auth/signin')
  }

  async store (req, res) {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    // Make sure the user has been verified
    if (!user.is_verified) {
      req.flash(
        'error',
        'Seu email ainda não foi validado, acesse sua conta de email e confirme a validação do acesso!'
      )
      return res.redirect('/')
    }

    if (!user) {
      console.log('Usuário não encontrado')
      req.flash('error', 'Usuário não encontrado')
      return res.redirect('/')
    }

    if (!(await user.checkPassword(password))) {
      console.log('Senha incorreta')
      req.flash('error', 'Senha incorreta')

      return res.redirect('/')
    }

    // Login successful, write token, and send back user

    console.log('Tudo certo')
    req.session.user = user
    console.log('sessao: ', req.session.user)

    return res.redirect('/app/dashboard')
  }

  destroy (req, res) {
    req.session.destroy(() => {
      res.clearCookie('root')
      return res.redirect('/')
    })
  }
}

module.exports = new SessionController()
