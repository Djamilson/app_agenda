const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')

const moment = require('moment')
const { User, Token, Codigo } = require('../models')

const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

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

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('user/signup', { useredit, usuario })
  }

  async editarsenha (req, res) {
    const { id } = req.params
    const useredit = await User.findByPk(id)

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('user/frmredefinirsenha', { useredit, usuario })
  }
  async upsenha (req, res) {
    const { id, password } = req.body
    const user = await User.findByPk(id)

    const passwordNovo = await bcrypt.hash(password, 8)

    await User.update({ password_hash: passwordNovo, user }, { where: { id } })
    req.flash(
      'success',
      `Senha redefinda com sucesso, alguns dados serão atualizado depois que fizer login novamente!`
    )
    return res.redirect('/app/dashboard')
  }

  async salvaredicaoperfil (req, res) {
    const { id, name } = req.body
    const user = await User.findByPk(id)

    const file = req.file
    if (!file) {
      await User.update({ name, user }, { where: { id: user.id } })
    } else {
      console.log('Vou trata: ', user.avatar)

      const { filename: avatar } = req.file
      await sharp(req.file.path)
        .resize(500)
        .jpeg({ quality: 70 })
        .toFile(path.resolve(req.file.destination, 'resized', avatar))
      // remove os arquivo da pasta, arquivos velhos
      fs.unlinkSync(req.file.path)

      await User.update({ name, avatar, user }, { where: { id: user.id } })

      if (user.avatar !== null) {
        const filePath = path.resolve(
          __dirname,
          '..',
          '..',
          '..',
          'tmp',
          'uploads',
          'resized',
          user.avatar
        )

        fs.unlinkSync(filePath)
      }
    }

    req.flash(
      'success',
      'Perfil editado com sucesso, alguns dados serão atualizado depois que fizer login novamente!'
    )
    return res.redirect('/app/dashboard')
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
        'Se n&atilde;o foi voc&ecirc; que solicitou a cria&ccedil;&atilde;o de um novo Token ou de uma nova senha, n&atilde;o se preocupe, apenas ignore está mensagem.' +
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
    const { email, codigointerno } = req.body

    const codigoInterno = await Codigo.findOne({
      where: { codigo_interno: codigointerno }
    })

    if (!codigoInterno) {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'uploads',
        avatar
      )
      fs.unlinkSync(filePath)

      req.flash(
        'error',
        'Código interno não encontrado, entre em contato com a administração!'
      )

      return res.redirect('/')
    }

    const userBanco = await User.findOne({ where: { email } })

    // Make sure the user has been verified
    if (userBanco) {
      req.flash('error', 'Esse email já está cadastrado!')
      return res.redirect('/')
    }

    await sharp(req.file.path)
      .resize(500)
      .jpeg({ quality: 70 })
      .toFile(path.resolve(req.file.destination, 'resized', avatar))
    // remove os arquivo da pasta, arquivos velhos
    fs.unlinkSync(req.file.path)

    // Create and save the user
    const user = await User.create({
      ...req.body,
      avatar,
      codigo_interno: codigoInterno.id,
      isVerified: false
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
        'Se n&atilde;o foi voc&ecirc; que solicitou a cria&ccedil;&atilde;o de um novo Token ou de uma nova senha, n&atilde;o se preocupe, apenas ignore está mensagem.' +
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
    const providers = await User.findAll({ where: { provider: true } })

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('user/new', { providers, usuario })
  }

  async createNew (req, res) {
    const providers = await User.findAll({ where: { provider: true } })

    return res.render('user/new', { providers })
  }

  async storeNew (req, res) {
    const { filename: avatar } = req.file
    const { email, codigointerno } = req.body

    const codigoInterno = await Codigo.findOne({
      where: { codigo_interno: codigointerno }
    })

    if (!codigoInterno) {
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'uploads',
        avatar
      )
      fs.unlinkSync(filePath)

      req.flash(
        'error',
        'Código interno não encontrado, entre em contato com a administração!'
      )

      return res.redirect('/')
    }

    const userBanco = await User.findOne({ where: { email } })

    // Make sure the user has been verified
    if (userBanco) {
      req.flash('error', 'Esse email já está cadastrado!')
      return res.redirect('/')
    }

    // Create and save the user
    const user = await User.create({
      ...req.body,
      avatar,
      codigo_interno: codigoInterno.id,
      provider: true,
      isVerified: false
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
        'Se n&atilde;o foi voc&ecirc; que solicitou a cria&ccedil;&atilde;o de um novo Token ou de uma nova senha, n&atilde;o se preocupe, apenas ignore está mensagem.' +
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
        return res.redirect('/app/dashboard')
      }
    })

    req.flash(
      'success',
      `Cadastrado efetuado com sucesso, verifique o email ${
        user.email
      } para ativar sua conta!`
    )

    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('user/new', { usuario })
  }
}

module.exports = new UserController()
