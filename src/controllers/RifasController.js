require("dotenv").config();
const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const { MercadoPagoConfig, Payment } = require("mercadopago");

class RifasController {
  async create(request, response) {
    const { valorRifa, email, cpf, celular, name, quantRifas } = request.body;

    const maxNumber = 20;

    function generateIdempotencyKey() {
      return uuidv4();
    }

    let qrCodeValue, idTransation;
    const idempotencyKey = generateIdempotencyKey();

    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN,
    });

    const payment = new Payment(client);

    const body = {
      transaction_amount: Number(0.01), // Apenas para teste, ajuste conforme necessário
      description: "",
      payment_method_id: "pix",
      notification_url:
        "https://backend-rifa-mauriciogomarimrifa-35d24eb0.koyeb.app/orderRifa/webhook",

      payer: {
        first_name: String(name),
        email: String(email),
        identification: {
          type: "cpf",
          number: cpf,
        },
        phone: {
          area_code: "17",
          number: celular, // Usar o valor correto do campo 'celular'
        },
      },

      additional_info: {
        items: [
          {
            title: "Rifas",
            quantity: quantRifas,
            unit_price: Number(valorRifa),
            description: maxNumber,
          },
        ],
      },
    };

    console.log('entrou aqui')
    const requestOptions = {
      idempotencyKey: idempotencyKey,
    };

    payment
      .create({ body, requestOptions })
      .then((res) => {
        qrCodeValue = res.point_of_interaction.transaction_data.qr_code;
        idTransation = res.id;
      })
      .catch(console.log)
      .finally(() => {
        if (qrCodeValue) {
          return response.status(201).json({ qrCodeValue, idTransation });
        } else {
          return response
            .status(500)
            .json({ error: "Erro ao criar o pagamento" });
        }
      });
  }

  async responsePix(request, response) {
    const { data, status } = request.body;

    async function generateUniqueNumbers(
      existingNumbers,
      totalNumbers,
      maxNumber
    ) {
      const uniqueNumbers = new Set(existingNumbers.map(Number)); // Convertendo para números
      const newNumbers = new Set();

      // Verifica se todos os números possíveis já foram adicionados
      if (uniqueNumbers.size === maxNumber) {
        return [];
      }

      while (newNumbers.size < totalNumbers) {
        const randomNum = Math.floor(Math.random() * maxNumber) + 1;
        if (!uniqueNumbers.has(randomNum) && !newNumbers.has(randomNum)) {
          newNumbers.add(randomNum);
        }

        if (uniqueNumbers.size + newNumbers.size === maxNumber) {
          console.log("Todos os números possíveis já foram adicionados.");
          break;
        }
      }

      return Array.from(newNumbers);
    }

    
    async function registerCota(cpf, idTransation, quantity, maxNumber) {

      try {
        const existingNumbers = await knex("cotas_rifas").pluck("numero");

        const newNumbers = await generateUniqueNumbers(
          existingNumbers,
          quantity,
          maxNumber
        );

        if (newNumbers.length === 0) {
        } else {
          const insertData = newNumbers.map((num) => ({ id_transacao: idTransation, numero: num, cpf }));
          await knex("cotas_rifas").insert(insertData);
        }
      } catch (error) {
        console.error("Erro ao cadastrar números:", error);
      }
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
          if (res.status == "approved") {
            console.log("aprovado");
            console.log("id", res.id);
            console.log("json", res.payer.identification.number);
            console.log("Quantidade", res.additional_info.items[0].quantity);
            console.log("Max number", res.additional_info.items[0].description);

            let quantity = res.additional_info.items[0].quantity;
            let maxNumber = res.additional_info.items[0].description;

            let idTransation = res.id;
            let cpf = res.payer.identification.number;

            registerCota(cpf, idTransation, quantity, maxNumber);
            return response.sendStatus(201);
          } else {
            return response.sendStatus(201);
          }
        })
        .catch(console.log);
    }
  }
}

module.exports = RifasController;
