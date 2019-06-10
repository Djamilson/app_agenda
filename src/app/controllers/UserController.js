const nodemailer = require('nodemailer')

const moment = require('moment')
const { User, Token } = require('../models')

class UserController {
  create (req, res) {
    return res.render('auth/signup')
  }

  async confirmationPost (req, res) {
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
    if (user.isVerified) {
      req.flash('error', 'Este usuário já foi verificado!')
      return res.redirect('/')
    }

    User.update({ is_verified: true, user }, { where: { id: user.id } })
    Token.update({ status: true, tokenn }, { where: { id: tokenn.id } })

    req.flash(
      'success',
      'Conta verificada com sucesso, já pode acessar a área restrita!'
    )
    return res.redirect('/')
  }

  async editar (req, res) {
    const { id } = req.params
    const useredit = await User.findByPk(id)

    return res.render('user/signup', { useredit })
  }

  async redefinirSenhaPost_ (req, res) {
    const { id } = req.body

    const user = await User.findByPk(id)
    console.log('============================')

    console.log('ID', id)

    console.log('============================:', user)
    /* // Make sure the user has been verified
    if (!user) {
      req.flash('error', 'Não foi possível redefinir a senha!')
      return res.redirect('/')
    }

    const passwordNovo = await bcrypt.hash(password, 8)

    User.update({ password_hash: passwordNovo, user }, { where: { id } })

    const tokenFinal = await Token.findByPk(tokenid)
    console.log('IDIDIIDI: ', tokenFinal.id)

    console.log('IDIDIIDI: ', tokenFinal)
    Token.update({ status: true, tokenFinal }, { where: { id: tokenFinal.id } })

    req.flash(
      'success',
      'Senha editada com sucesso, já pode acessar a área restrita!'
    ) */
    return res.redirect('/')
  }

  async redefinirSenhaPost (req, res) {
    const { id, name } = req.body
    // const { filename: avatar } = req.file
    console.log(req)
    console.log('Meu ID: ', id)
    console.log('Name: ', name)

    const user = await User.findByPk(id)

    const file = req.file
    if (!file) {
      console.log('Sem upload a file')

      User.update({ name, user }, { where: { id: user.id } })
    } else {
      console.log('Ótimo upload a file')

      const { filename: avatar } = req.file
      User.update({ name, avatar, user }, { where: { id: user.id } })
    }

    //  if (req.file !== null) {
    //
    // } else {
    //   User.update({ name: req.name, user }, { where: { id: user.id } })
    // }

    const useredit = await User.findByPk(id)
    req.flash('success', 'Perfil editado com sucesso!')
    return res.render('user/signup', { useredit })
  }

  async resendTokenPost (req, res) {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })

    // Make sure the user has been verified
    if (!user) {
      req.flash(
        'error',
        'Não foi possível encontra um usuário para esse Token!'
      )
      return res.redirect('/')
    }

    const tokenTest = await Token.findAll({
      include: [{ model: User, as: 'user' }],

      where: {
        user_id: user.id,
        status: false
      }
    })

    // tokenTest.map(token => {
    if (
      tokenTest.length > 0 &&
      moment(tokenTest[0].expires).isAfter(moment()) &&
      tokenTest[0].status !== true
    ) {
      req.flash(
        'error',
        `Você tem um token que ainda não expirou, entre no email ${email} para usá-lo!`
      )
      return res.redirect('/')
    }
    // })

    console.log('Data: ', moment(tokenTest.expires).isAfter(moment()))
    console.log('Status:', tokenTest.status)
    console.log('Data expirada cria o token! ======================')
    console.log(
      'Status diferente de true vai criar o token! ======================'
    )

    // Create a verification token for this user
    const token = await Token.create({
      user_id: user.id,
      expires: moment()
        .add('1', 'days')
        .format()
    })

    // Send the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.USER_EMAIL,
        clientId: process.env.CLIENTID_EMAIL,
        clientSecret: process.env.CLIENTSECRET_EMAIL,
        refreshToken: process.env.REFRESHTOKEN_EMAIL
      }
    })

    // se o usuário tive verificado redefini a senha
    let url = '/confirmation/'

    if (user.is_verified) {
      url = '/redefinirsenha/'
    }
    // variavel para pegar o primeiro nome do usuário para mostra no email
    const primeironome = user.name.split(' ')
    const mailOptions = {
      from: 'no-reply@yourwebapplication.com',
      to: user.email,
      subject: 'Validação de conta',
      html:
        '<div style="background-color:#f4f4f4;padding:20px 40px 30px 40px"><div class="adM">' +
        '</div><div style="padding-bottom:5px"><div class="adM"></div>' +
        '</div>' +
        '   <div style="border:1px solid #a5a5a5;background-color:#ffffff;color:#4d4d4d;font:14px Arial,Helvetica,sans-serif;padding:10px;text-align:left">' +
        `<p><strong>Olá, ${primeironome[0]}!</strong></p>` +
        '<p> A Equipe da AABB Palmas - To, recebeu a sua solicita&ccedil;&atilde;o para criação de um novo token, ou redefini&ccedil;&atilde;o de senha.\n\n' +
        '</p>' +
        '<p>' +
        'Use o link a seguir nas pr&oacute;ximas 24 horas para gerar um novo Token, ou criar uma nova senha!' +
        '</p>' +
        '<p align="justify" style="width:400px;">' +
        'clique no link: </p>' +
        '<p> >> <strong> \nhttp://' +
        req.headers.host +
        `${url}` +
        token.token +
        '.</strong> <<' +
        '</p>' +
        '<p>' +
        'Se n&atilde;o foi voc&ecirc; que solicitou a cria&ccedil;&atilde;o de um novo Token ou de uma nova senha, n&atilde;o se preocupe, apenas ignore esta mensagem.' +
        '</p>' +
        '<p>' +
        'Obrigado,' +
        '<br>' +
        'Equipe da AABB Palmas - To' +
        '</p>' +
        '</div>' +
        '<div style="color:#727272;font:12px Arial,Helvetica,sans-serif;padding:5px 0px;text-align:left">' +
        'Encontre as melhores op&ccedil;&otilde;es para lazer' +
        '</div><div class="yj6qo"></div><div class="adL">' +
        '</div></div>'
    }

    await transporter.sendMail(mailOptions, function (err) {
      if (err) {
        req.flash(
          'error',
          'Não foi possível fazer a redefinição de token ou de senha, tente novamente!'
        )
        return res.redirect('/')
      }
    })

    if (user.is_verified) {
      req.flash(
        'success',
        `Socilitação de redefição de senha enviada para o email [${email}] com sucesso!`
      )
      return res.redirect('/')
    } else {
      req.flash(
        'success',
        `Socilitação de novo token foi enviado para ${user.email}`
      )
    }

    return res.redirect('/')
  }

  async store (req, res) {
    const { filename: avatar } = req.file
    const { email } = req.body

    const userBanco = await User.findOne({ where: { email } })

    // Make sure the user has been verified
    if (userBanco) {
      req.flash('error', 'Esse email já esta cadastrado!')
      return res.redirect('/')
    }

    // Create and save the user
    const user = await User.create({
      ...req.body,
      avatar,
      isVerified: true
    })

    // Create a verification token for this user
    const token = await Token.create({
      user_id: user.id,
      expires: moment()
        .add('1', 'days')
        .format()
    })

    // Send the email

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.USER_EMAIL,
        clientId: process.env.CLIENTID_EMAIL,
        clientSecret: process.env.CLIENTSECRET_EMAIL,
        refreshToken: process.env.REFRESHTOKEN_EMAIL
      }
    })

    // variavel para pegar o primeiro nome do usuário para mostra no email
    const primeironome = user.name.split(' ')
    const mailOptions = {
      from: 'no-reply@yourwebapplication.com',
      to: user.email,
      subject: 'Validação de sua conta',
      html:
        '<div style="background-color:#f4f4f4;padding:20px 40px 30px 40px"><div class="adM">' +
        '</div><div style="padding-bottom:5px"><div class="adM"></div>' +
        '</div>' +
        '   <div style="border:1px solid #a5a5a5;background-color:#ffffff;color:#4d4d4d;font:14px Arial,Helvetica,sans-serif;padding:10px;text-align:left">' +
        `<p><strong>Olá, ${primeironome[0]}!</strong></p>` +
        '<p> A Equipe da AABB Palmas - To, recebeu a sua solicita&ccedil;&atilde;o para criação de um novo token, ou redefini&ccedil;&atilde;o de senha.\n\n' +
        '</p>' +
        '<p>' +
        'Use o link a seguir nas pr&oacute;ximas 24 horas para gerar um novo Token, ou criar uma nova senha!' +
        '</p>' +
        '<p align="justify" style="width:400px;">' +
        'clique no link: </p>' +
        '<p> >> <strong> \nhttp://' +
        req.headers.host +
        `/confirmation/` +
        token.token +
        '.</strong> <<' +
        '</p>' +
        '<p>' +
        'Se n&atilde;o foi voc&ecirc; que solicitou a cria&ccedil;&atilde;o de um novo Token ou de uma nova senha, n&atilde;o se preocupe, apenas ignore esta mensagem.' +
        '</p>' +
        '<p>' +
        'Obrigado,' +
        '<br>' +
        'Equipe da AABB Palmas - To' +
        '</p>' +
        '</div>' +
        '<div style="color:#727272;font:12px Arial,Helvetica,sans-serif;padding:5px 0px;text-align:left">' +
        'Encontre as melhores op&ccedil;&otilde;es para lazer' +
        '</div><div class="yj6qo"></div><div class="adL">' +
        '</div></div>'
    }

    await transporter.sendMail(mailOptions, function (err) {
      if (err) {
        req.flash(
          'error',
          'Não foi possível fazer o cadastrado, tente novamente!'
        )
        return res.redirect('/')
      }
    })

    req.flash(
      'success',
      `Cadastrado efetuado com sucesso, verifique o email ${
        user.email
      } para ativar sua conta!`
    )

    return res.redirect('/')
  }

  async index (req, res) {
    console.log('Sessao:', req.session.user.id)

    const providers = await User.findAll({ where: { provider: true } })

    console.log('Meus provaider: ', providers)

    return res.render('user/new', { providers })
  }

  async createNew (req, res) {
    console.log('Sessao:', req.session.user.id)
    console.log('........ >>>>')
    const providers = await User.findAll({ where: { provider: true } })

    return res.render('user/new', { providers })
  }

  async storeNew (req, res) {
    const { filename: avatar } = req.file

    console.log('Meu req::: ', req.body)
    const provider = true
    await User.create({ ...req.body, provider, avatar })

    const providers = await User.findAll({ where: { provider: true } })

    return res.render('user/new', { providers })
  }
}

module.exports = new UserController()
