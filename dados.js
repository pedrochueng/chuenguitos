/*
 * DADOS DA CLÍNICA — único arquivo a editar para contatos e especialidades.
 *
 * Regras:
 * - Preencha somente com informações confirmadas pela cliente.
 * - Campo vazio ("") não aparece no site.
 * - WhatsApp: só dígitos, com 55 + DDD + número. Ex.: "5511912345678".
 *   Número vazio ou inválido = botão aparece como "Agendamento em breve" (sem link).
 * - Especialidade com ativa: false não é exibida (exceto no modo de apresentação).
 */
const CLINICA = {
  // true = mostra os "profissionalExemplo" (fictícios) e uma faixa de aviso no topo.
  // ATENÇÃO: mude para false antes de publicar. Dados de exemplo nunca vão ao ar.
  modoApresentacao: true,

  // WhatsApp da clínica: usado por todas as especialidades e profissionais que não tenham número próprio
  whatsappGeral: "5521970766187",

  // PENDENTE: e-mail oficial. Vazio = a seção "E-mail" não aparece (exceto no modo de apresentação).
  email: "",
  emailExemplo: "contato@example.com", // fictício, só no modo de apresentação

  contato: {
    endereco: "",      // PENDENTE. Ex.: "Rua ..., 123 — Sala 4"
    cidade: "",        // PENDENTE. Ex.: "Cidade — UF"
    horarios: "",      // PENDENTE. Ex.: "Segunda a sexta, das 8h às 19h"
    instagram: "psicologa_neusavalle", // só o usuário, sem @
    orientacoes: "",   // PENDENTE (opcional). Ex.: "Estacionamento na rua lateral"
  },

  /*
   * profissional: dados REAIS e confirmados (aparecem sempre que preenchidos).
   * profissionalExemplo: dados FICTÍCIOS, só aparecem com modoApresentacao: true.
   * Registros de exemplo usam zeros de propósito, para não coincidir com profissionais reais.
   * foto: caminho da foto (ex.: "assets/images/equipe/nome.webp", 4:5, WebP). Sem foto, aparecem as iniciais.
   *   As fotos de exemplo são de pessoas reais de um banco de imagens e NÃO representam a equipe.
   */
  especialidades: [
    {
      id: "psicologia",
      nome: "Psicologia",
      ativa: true,
      descricao:
        "Atendimento psicológico com escuta cuidadosa, para compreender o que você está vivendo e construir caminhos possíveis no seu tempo.",
      // PENDENTE: nome, registro (CRP) e foto autorizada, confirmados pela psicóloga
      profissional: { nome: "", registro: "", bio: "", foto: "" },
      profissionalExemplo: {
        nome: "Nome da Psicóloga",
        foto: "assets/images/equipe/psicologia.webp",
        registro: "CRP 00/00000",
        bio: "Psicóloga clínica e fundadora da clínica. Atende adolescentes e adultos.",
      },
      whatsapp: "", // vazio = usa whatsappGeral
      mensagem: "Olá! Gostaria de obter informações sobre agendamento para psicologia na clínica.",
    },
    // Especialidades futuras: mude ativa para true apenas quando confirmadas.
    {
      id: "fonoaudiologia",
      nome: "Fonoaudiologia",
      ativa: false,
      descricao:
        "Avaliação e acompanhamento da comunicação: fala, linguagem, voz, audição e deglutição, em crianças e adultos.",
      profissional: { nome: "", registro: "", bio: "" },
      profissionalExemplo: {
        nome: "Camila Duarte",
        foto: "assets/images/equipe/fonoaudiologia.webp",
        registro: "CRFa 0-00000",
        bio: "Fonoaudióloga com atuação em linguagem infantil e desenvolvimento da fala.",
      },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento para fonoaudiologia na clínica.",
    },
    {
      id: "psiquiatria",
      nome: "Psiquiatria",
      ativa: false,
      descricao:
        "Avaliação médica da saúde mental e acompanhamento do tratamento, em diálogo com os demais profissionais.",
      profissional: { nome: "", registro: "", bio: "" },
      profissionalExemplo: {
        nome: "Rafael Moreira",
        foto: "assets/images/equipe/psiquiatria.webp",
        registro: "CRM 00000 · RQE 00000",
        bio: "Médico psiquiatra, com atenção ao cuidado integrado entre especialidades.",
      },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento para psiquiatria na clínica.",
    },
    {
      id: "terapias",
      nome: "Terapia ocupacional",
      ativa: false,
      descricao:
        "Apoio à autonomia nas atividades do dia a dia, da rotina escolar à vida adulta.",
      profissional: { nome: "", registro: "", bio: "" },
      profissionalExemplo: {
        nome: "Juliana Prates",
        foto: "assets/images/equipe/terapias.webp",
        registro: "CREFITO 0-00000-TO",
        bio: "Terapeuta ocupacional com foco em desenvolvimento e integração sensorial.",
      },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento de terapia ocupacional na clínica.",
    },
    {
      id: "infantil",
      nome: "Atendimento infantil",
      ativa: false,
      descricao:
        "Escuta da criança por meio do brincar, com orientação próxima aos pais e responsáveis.",
      profissional: { nome: "", registro: "", bio: "" },
      profissionalExemplo: {
        nome: "Beatriz Lima",
        foto: "assets/images/equipe/infantil.webp",
        registro: "CRP 00/00000",
        bio: "Psicóloga com atuação em infância e orientação parental.",
      },
      whatsapp: "",
      mensagem: "Olá! Gostaria de obter informações sobre agendamento de atendimento infantil na clínica.",
    },
  ],
};
