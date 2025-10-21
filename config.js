/**
 * Configurações da Landing Page Phoenix Recruitment
 * 
 * Este arquivo centraliza as configurações principais da landing page
 * para facilitar futuras atualizações e personalizações.
 */

window.PhoenixConfig = {
  // Informações da empresa
  company: {
    name: 'Phoenix English School',
    email: 'phoenixschool10@gmail.com',
    phone: '(99) 99206-6131',
    whatsappUrl: 'https://api.whatsapp.com/send/?phone=5599992066131&text=Ol%C3%A1!%20Tenho%20interesse%20no%20processo%20seletivo%20da%20Phoenix.',
  },

  // Redes sociais
  socialMedia: {
    instagram: 'https://www.instagram.com/phoenix_english_school',
    tiktok: 'https://www.tiktok.com/@phoenix.pedreiras',
    facebook: 'https://www.facebook.com/phoenixenglishschool',
    youtube: 'https://www.youtube.com/@phoenixpedreiras?sub_confirmation=1',
    linkedin: 'https://www.linkedin.com/company/phoenix-english-school'
  },

  // Configurações do formulário
  form: {
    // API segura via Netlify Functions (não precisa mais do Google Apps Script)
    apiEndpoint: '/api/submit',
    
    // Campos obrigatórios
    requiredFields: ['nome', 'email', 'telefone', 'idade', 'curriculo', 'aceita'],
    
    // Opções de cargo
    cargoOptions: [
      { value: 'agente-comercial', label: 'Agente Comercial Phoenix' }
    ],

    // Configurações de validação
    validation: {
      minNameLength: 2,
      maxTextareaLength: 500,
      phonePattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    },

    // Rate limiting (em milissegundos)
    rateLimitInterval: 30000 // 30 segundos
  },

  // Configurações de UI
  ui: {
    // Cores principais
    colors: {
      primary: '#A70240',
      black: '#000000',
      white: '#ffffff',
      gray: '#333333'
    },

    // Animações
    animations: {
      fadeInDuration: 600,
      hoverScaleDuration: 300,
      loadingSpinDuration: 1000
    },

    // Breakpoints responsivos
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  },

  // Configurações de analytics (opcional)
  analytics: {
    googleAnalyticsId: '', // Adicione seu GA4 ID aqui
    facebookPixelId: '',   // Adicione seu Facebook Pixel ID aqui
    
    // Eventos para tracking
    events: {
      formStart: 'form_start',
      formSubmit: 'form_submit',
      formSuccess: 'form_success',
      formError: 'form_error'
    }
  },

  // Textos personalizáveis
  texts: {
    hero: {
      title: 'Processo Seletivo',
      subtitle: 'Seja um Agente Comercial Phoenix! Buscamos profissionais comunicativos e ambiciosos para integrar nossa equipe de vendas.',
      cta: 'Candidate-se Agora'
    },

    about: {
      title: 'Agente Comercial Phoenix',
      description: 'Procuramos jovens e adultos comunicativos e ambiciosos para atuar na prospecção de alunos e desenvolvimento de estratégias comerciais. Se você tem mentalidade empreendedora e foco em resultados, esta é sua oportunidade!'
    },

    form: {
      title: 'Inscreva-se no Processo',
      subtitle: 'Preencha o formulário abaixo e dê o primeiro passo para se tornar um Agente Comercial Phoenix.',
      submitButton: 'Enviar Candidatura',
      loadingText: 'Enviando sua candidatura...',
      successTitle: 'Candidatura Enviada com Sucesso!',
      successMessage: 'Obrigado pelo seu interesse! Nossa equipe comercial analisará seu perfil e entrará em contato para as próximas etapas do processo seletivo.'
    },

    contact: {
      title: 'Entre em Contato',
      emailLabel: 'E-mail',
      whatsappLabel: 'WhatsApp',
      socialTitle: 'Siga-nos nas Redes Sociais'
    },

    footer: {
      copyright: '© 2024 Phoenix English School. Todos os direitos reservados.',
      subtitle: 'Processo Seletivo - Faça parte da nossa equipe!'
    }
  },

  // Configurações de desenvolvimento
  dev: {
    debug: false, // Ativar logs de debug
    mockSubmission: false, // Simular envio do formulário
    showTestData: false // Mostrar dados de teste
  }
};

// Função para atualizar configurações dinamicamente
window.updatePhoenixConfig = function(newConfig) {
  window.PhoenixConfig = { ...window.PhoenixConfig, ...newConfig };
  console.log('Phoenix Config atualizado:', window.PhoenixConfig);
};

// Log de inicialização (apenas em desenvolvimento)
if (window.PhoenixConfig.dev.debug) {
  console.log('Phoenix Config carregado:', window.PhoenixConfig);
}
