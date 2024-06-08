require("dotenv").config();
const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const { MercadoPagoConfig, Payment } = require("mercadopago");

class RifasController {
  async create(request, response) {
    const { valorRifa, email, cpf } = request.body;

    function generateIdempotencyKey() {
      return uuidv4();
    }

    let qrCodeValue;
    const idempotencyKey = generateIdempotencyKey();

    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN,
    });

    const payment = new Payment(client);

    const body = {
      transaction_amount: Number(valorRifa),
      description: "",
      payment_method_id: "pix",
      notification_url:
        "https://backend-rifa-mauriciogomarimrifa-35d24eb0.koyeb.app/orderRifa/webhook",
      payer: {
        email: email,
        identification: {
          type: "cpf",
          number: cpf,
        },
      },
    };

    const requestOptions = {
      idempotencyKey: idempotencyKey,
    };

    payment
      .create({ body, requestOptions })
      .then((res) => {
        qrCodeValue = res.point_of_interaction.transaction_data.qr_code;
      })
      .catch(console.log)
      .finally(() => {
        if (qrCodeValue) {
          response.status(201).json(qrCodeValue);
        } else {
          response.status(500).json({ error: "Erro ao criar o pagamento" });
        }
      });
  }

  async responsePix(request, response) {
    const { data } = request.body;


    async function registerCota(){
     console.log('rifa castrada')
    }

    if (data) {
      const client = new MercadoPagoConfig({
        accessToken: process.env.ACCESS_TOKEN,
      });

      const payment = new Payment(client);

      payment
        .get({
          id: data.id,
        })
        .then((res) => {
          if(res.status == approved) {
            registerCota()
          } else {
            console.log('falta pagar', res.status)
          }
        })
        .catch(console.log);
    }
  }
}

module.exports = RifasController;
