/*
 * DADOS DA CLÍNICA — único arquivo a editar para contatos e especialidades.
 *
 * Regras:
 * - Preencha somente com informações confirmadas pela cliente.
 * - Campo vazio ("") não aparece no site.
 * - WhatsApp: só dígitos, com 55 + DDD + número. Ex.: "5511912345678".
 *   Número vazio ou inválido = botão aparece como "Agendamento em breve" (sem link).
 * - Especialidade com ativa: false não é exibida.
 */
const CLINICA = {
  // PENDENTE: número oficial da clínica (usado quando a especialidade não tem número próprio)
  whatsappGeral: "",

  contato: {
    endereco: "",      // PENDENTE. Ex.: "Rua ..., 123 — Sala 4"
    cidade: "",        // PENDENTE. Ex.: "Cidade — UF"
    horarios: "",      // PENDENTE. Ex.: "Segunda a sexta, das 8h às 19h"
    instagram: "",     // PENDENTE: só o usuário, sem @. Ex.: "nomedaclinica"
    orientacoes: "",   // PENDENTE (opcional). Ex.: "Estacionamento na rua lateral"
  },

  especialidades: [
    {
      id: "psicologia",
      nome: "Psicologia",
      ativa: true,
      descricao:
        "Atendimento psicológico com escuta cuidadosa, para compreender o que você está vivendo e construir caminhos possíveis no seu tempo.",
      // PENDENTE: nome e registro (CRP) confirmados pela psicóloga
      profissional: { nome: "", registro: "" },
      whatsapp: "", // vazio = usa whatsappGeral
      mensagem: "Olá! Gostaria de obter informações sobre agendamento para psicologia na clínica.",
    },
    // Especialidades futuras: mude ativa para true apenas quando confirmadas.
    {
      id: "fonoaudiologia",
      nome: "Fonoaudiologia",
      ativa: false,
      descricao: "",
      profissional: { nome: "", registro: "" },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento para fonoaudiologia na clínica.",
    },
    {
      id: "psiquiatria",
      nome: "Psiquiatria",
      ativa: false,
      descricao: "",
      profissional: { nome: "", registro: "" },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento para psiquiatria na clínica.",
    },
    {
      id: "terapias",
      nome: "Terapias",
      ativa: false,
      descricao: "",
      profissional: { nome: "", registro: "" },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento de terapia na clínica.",
    },
    {
      id: "infantil",
      nome: "Atendimento infantil",
      ativa: false,
      descricao: "",
      profissional: { nome: "", registro: "" },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento de atendimento infantil na clínica.",
    },
  ],
};
