const nodemailer = require('nodemailer')

const moment = require('moment')
const { User, Token } = require('../models')

class UserController {
  create (req, res) {
    return res.render('auth/signup')
  }

  async confirmationPost (req, res) {
    // Find a matching token
    const { token, user_id, email } = req.body
    const token_ = await Token.findOne({ where: { token } })

    // Make sure the user has been verified
    if (!token_) {
      req.flash('error', 'Token expirado, gere novo token!')
      return res.redirect('/')
    }

    const user = await User.findOne({ where: { user_id, email } })

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

    // Verify and save the user
    await User.findByIdAndUpdate(user.id, user, {
      isVerified: true
    })

    req.flash(
      'success',
      'Conta verificada com sucesso, já pode acessar a área restrita!'
    )
    return res.redirect('/')
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
    if (user.isVerified) {
      req.flash('error', 'Este usuário já foi verificado!')
      return res.redirect('/')
    }

    // Create a verification token for this user
    const token = await Token.create({ user_id: user.id })

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

    const mailOptions = {
      from: 'no-reply@yourwebapplication.com',
      to: user.email,
      subject: 'Account Verification Token',
      text:
        'Hello,\n\n' +
        'Please verify your account by clicking the link: \nhttp://' +
        req.headers.host +
        '/confirmation/' +
        token.token +
        '.\n'
    }

    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        return res.status(500).send({ msg: err.message })
      }
      res
        .status(200)
        .send('A verification email has been sent to ' + user.email + '.')
    })

    return res.redirect('/')
  }

  async store (req, res) {
    const { filename: avatar } = req.file
    const { email } = req.body
    const password_reset_expires = moment().format()

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
      password_reset_expires,
      isVerified: true
    })

    // Create a verification token for this user
    const token = await Token.create({ user_id: user.id })

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

    const mailOptions = {
      from: 'no-reply@yourwebapplication.com',
      to: user.email,
      subject: 'Account Verification Token',
      text:
        'Hello,\n\n' +
        'Please verify your account by clicking the link: \nhttp://' +
        req.headers.host +
        '/confirmation/' +
        token.token +
        '.\n'
    }

    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        return res.status(500).send({ msg: err.message })
      }
      res
        .status(200)
        .send('A verification email has been sent to ' + user.email + '.')
    })

    return res.redirect('/')
  }

  async index (req, res) {
    console.log('Sessao:', req.session.user.id)

    console.log('........ >>>>')

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
