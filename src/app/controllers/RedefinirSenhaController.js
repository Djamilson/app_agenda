const moment = require('moment')
const { User, Token } = require('../models')
const bcrypt = require('bcryptjs')

class RedefinirSenhaController {
  async index (req, res) {
    const token = req.params.token

    const tokenn = await Token.findOne({ where: { token } })

    // Make sure the user has been verified
    if (!moment(tokenn.expires).isAfter(moment())) {
      req.flash('error', 'Token expirado, gere novo token, em recuperar senha!')
      return res.redirect('/')
    }

    const user = await User.findByPk(tokenn.user_id)
    if (!user) {
      req.flash(
        'error',
        'Não foi possível encontra um usuário para esse Token!'
      )
      return res.redirect('/')
    }

    return res.render('redefinir_senha/frmredefinirsenha', { user, tokenn })
  }

  async solicitarRecuperacaoSenha (req, res) {
    return res.render('redefinir_senha/redefinir')
  }

  async redefinirSenhaPost (req, res) {
    const { password, id, tokenid } = req.body

    const user = await User.findByPk(id)
    // Make sure the user has been verified
    if (!user) {
      req.flash('error', 'Não foi possível redefinir a senha!')
      return res.redirect('/')
    }

    const passwordNovo = await bcrypt.hash(password, 8)

    User.update({ password_hash: passwordNovo, user }, { where: { id } })

    const tokenFinal = await Token.findByPk(tokenid)

    Token.update({ status: true, tokenFinal }, { where: { id: tokenFinal.id } })

    req.flash(
      'success',
      'Senha editada com sucesso, já pode acessar a área restrita!'
    )
    return res.redirect('/')
  }
}

module.exports = new RedefinirSenhaController()
