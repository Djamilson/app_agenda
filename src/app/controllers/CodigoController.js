const { Codigo } = require('../models')

class CodigoController {
  async index (req, res) {
    const name = await req.session.user.name.split(' ')
    const usuario = { ...req.session.user, name: name[0] }

    return res.render('codigo/new', { usuario })
  }

  async store (req, res) {
    const { nome, codigointerno } = req.body

    console.log('codigointerno', nome)

    console.log('codigointerno', codigointerno)

    const codigoInterno = await Codigo.findOne({
      where: { codigo_interno: codigointerno }
    })

    if (codigoInterno) {
      req.flash('error', 'Código do sócio já cadastrador!')

      return res.redirect('/app/dashboard')
    }

    await Codigo.create({ nome, codigo_interno: codigointerno })

    req.flash('success', `Cadastrado efetuado com sucesso!`)

    return res.redirect('/app/dashboard')
  }
}

module.exports = new CodigoController()
