// Smooth scrolling para links âncora com offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      
      const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset +30;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Função para mostrar etapas do formulário
function mostrarEtapa(id) {
  document.querySelectorAll('.etapa').forEach(el => el.classList.remove('ativa'));
  const etapa = document.getElementById(id);
  if (etapa) etapa.classList.add('ativa');
}

// Máscara para telefone (formato brasileiro)
function aplicarMascaraTelefone(input) {
  let valor = input.value.replace(/\D/g, '');
  
  if (valor.length <= 10) {
    valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  input.value = valor;
}

// Aplicar máscara ao campo telefone
const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function() {
    aplicarMascaraTelefone(this);
  });
}

// Upload de arquivo - Mostrar nome do arquivo e validar tamanho
const fileInput = document.getElementById('curriculo');
const fileName = document.getElementById('file-name');
const fileLabelText = document.querySelector('.file-label-text');

if (fileInput && fileName) {
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tamanho (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      
      if (file.size > maxSize) {
        alert('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
        fileInput.value = '';
        fileName.textContent = 'Nenhum arquivo selecionado';
        fileLabelText.textContent = 'Escolher arquivo';
        return;
      }
      
      // Validar tipo de arquivo
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Tipo de arquivo não permitido. Use apenas PDF, DOC ou DOCX.');
        fileInput.value = '';
        fileName.textContent = 'Nenhum arquivo selecionado';
        fileLabelText.textContent = 'Escolher arquivo';
        return;
      }
      
      // Mostrar nome do arquivo
      fileName.textContent = file.name;
      fileLabelText.textContent = 'Alterar arquivo';
      fileName.style.color = '#10b981'; // Verde para indicar sucesso
    } else {
      fileName.textContent = 'Nenhum arquivo selecionado';
      fileLabelText.textContent = 'Escolher arquivo';
      fileName.style.color = '#cbd5e1';
    }
  });
}

// Validação de email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validação de telefone brasileiro
function validarTelefone(telefone) {
  const numeroLimpo = telefone.replace(/\D/g, '');
  return numeroLimpo.length === 10 || numeroLimpo.length === 11;
}

// Validação de idade
function validarIdade(idade) {
  const idadeNum = parseInt(idade);
  return !isNaN(idadeNum) && idadeNum >= 16 && idadeNum <= 99;
}

// Envio do formulário
const form = document.getElementById('recruitment-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    // Validações
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const idade = document.getElementById('idade').value.trim();
    const cargo = document.getElementById('cargo').value;
    const aceita = document.getElementById('aceita').checked;
    
    // Verificar campos obrigatórios
    if (!nome || !email || !telefone || !idade || !cargo || !aceita) {
      alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.');
      return;
    }
    
    // Validar email
    if (!validarEmail(email)) {
      alert('Por favor, insira um email válido.');
      return;
    }
    
    // Validar telefone
    if (!validarTelefone(telefone)) {
      alert('Por favor, insira um telefone válido.');
      return;
    }
    
    // Validar idade
    if (!validarIdade(idade)) {
      alert('Por favor, insira uma idade válida (entre 16 e 99 anos).');
      return;
    }
    
    // Mostrar loading
    mostrarEtapa('loading');
    
    // Simular envio (substituir por integração real)
    setTimeout(() => {
      // Aqui você pode integrar com Google Sheets ou outro serviço
      enviarParaGoogleSheets();
    }, 2000);
  });
}

// Função para enviar dados para API segura
async function enviarParaGoogleSheets() {
  try {
    // Preparar dados
    const dados = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      idade: document.getElementById('idade').value.trim(),
      cargo: document.getElementById('cargo').value,
      experiencia: document.getElementById('experiencia')?.value.trim() || '',
      motivacao: document.getElementById('motivacao')?.value.trim() || ''
    };
    
    // Enviar para API segura (Netlify Function)
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Sucesso
      mostrarEtapa('confirmacao');
      
      // Limpar formulário
      document.getElementById('recruitment-form').reset();
      
    } else {
      // Erro retornado pela API
      throw new Error(result.details || result.error || 'Erro ao enviar candidatura');
    }
    
  } catch (error) {
    console.error('Erro:', error);
    alert(error.message || 'Erro ao enviar candidatura. Tente novamente.');
    mostrarEtapa('formulario-section');
  }
}

// Função para converter arquivo para base64
function converterArquivoParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Animações ao scroll
function animarElementosNoScroll() {
  const elementos = document.querySelectorAll('.hover-scale');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });
  
  elementos.forEach(elemento => {
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateY(20px)';
    elemento.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(elemento);
  });
}

// Inicializar animações quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  animarElementosNoScroll();
});

// Função removida - agora usamos apenas a API segura via /api/submit

// Validação em tempo real
document.addEventListener('DOMContentLoaded', function() {
  const inputs = document.querySelectorAll('input[required], select[required]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = '#ef4444';
      } else {
        this.style.borderColor = 'transparent';
      }
    });
    
    input.addEventListener('input', function() {
      if (this.style.borderColor === 'rgb(239, 68, 68)') {
        this.style.borderColor = 'transparent';
      }
    });
  });
});

// Contador de caracteres para textareas
const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
  const maxLength = 500;
  
  // Criar contador
  const contador = document.createElement('div');
  contador.style.textAlign = 'right';
  contador.style.fontSize = '12px';
  contador.style.color = '#9ca3af';
  contador.style.marginTop = '4px';
  
  textarea.parentNode.appendChild(contador);
  
  function atualizarContador() {
    const atual = textarea.value.length;
    contador.textContent = `${atual}/${maxLength} caracteres`;
    
    if (atual > maxLength * 0.9) {
      contador.style.color = '#f59e0b';
    } else {
      contador.style.color = '#9ca3af';
    }
  }
  
  textarea.addEventListener('input', atualizarContador);
  atualizarContador();
});

// Prevenção de spam (rate limiting simples)
let ultimoEnvio = 0;
const INTERVALO_MINIMO = 30000; // 30 segundos

function podeEnviar() {
  const agora = Date.now();
  if (agora - ultimoEnvio < INTERVALO_MINIMO) {
    const segundosRestantes = Math.ceil((INTERVALO_MINIMO - (agora - ultimoEnvio)) / 1000);
    alert(`Aguarde ${segundosRestantes} segundos antes de enviar novamente.`);
    return false;
  }
  ultimoEnvio = agora;
  return true;
}

// Adicionar verificação de rate limiting ao envio
if (form) {
  const originalSubmitHandler = form.onsubmit;
  form.addEventListener('submit', function(e) {
    if (!podeEnviar()) {
      e.preventDefault();
      return false;
    }
  });
}
