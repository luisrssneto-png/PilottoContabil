import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, Building2, FileText, CheckSquare, Plus, Trash2, CheckCircle2, 
  Circle, Menu, LogOut, Bell, Mail, Phone, MapPin, ShieldCheck, UserCheck, 
  Search, ArrowRight, Upload, AlertCircle, Globe, Eye, Lock, MessageSquare, 
  Send, Users, Sparkles, Clock, Tag, Loader2, Briefcase, FolderOpen, Calendar,
  Download, FileCheck, X, Paperclip, Award, ChevronRight, KeyRound, UserPlus, Settings
} from 'lucide-react';

// 1. Configuração Inicial do Firebase
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'contato-contabil-demo';

// Perfis Oficiais Padrão da Equipe Interna do Escritório Pilotto Contábil (Com E-mail e Senha inicial editáveis)
const TEAM_MEMBERS = [
  { 
    id: 'luis_neto', 
    name: 'Luis Neto', 
    username: 'luis',
    email: 'luis@pilottocontabil.com.br',
    password: '123',
    short: '@Luis', 
    role: 'Diretor / Contador', 
    initials: 'LN', 
    avatarBg: 'bg-amber-500 text-neutral-950',
    badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-500/30' 
  },
  { 
    id: 'francisco_luis', 
    name: 'Sr. Francisco Luis', 
    username: 'francisco',
    email: 'francisco@pilottocontabil.com.br',
    password: '123',
    short: '@Francisco', 
    role: 'Contador Sênior / Fiscal', 
    initials: 'FL', 
    avatarBg: 'bg-blue-600 text-white',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' 
  },
  { 
    id: 'anny_luize', 
    name: 'Srta. Anny Luize', 
    username: 'anny',
    email: 'anny@pilottocontabil.com.br',
    password: '123',
    short: '@Anny', 
    role: 'Analista Contábil / DP', 
    initials: 'AL', 
    avatarBg: 'bg-neutral-900 text-amber-400 border border-amber-500/40',
    badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-300' 
  }
];

// 7 Tarefas Internas Padrões do Escritório
const DEFAULT_INTERNAL_TASKS = [
  "Envio das folhas de pagamento mensais",
  "Envio do Simples Nacional",
  "Envio dos Impostos Presumido",
  "Calcular DIFAL",
  "Enviar Declarações de ICMS",
  "Parcelamentos",
  "Contabilidade"
];

// 6 Atividades Padrões que Envolvem os Clientes (Solicitações)
const DEFAULT_CLIENT_ACTIVITIES = [
  "Cadastro de empregados",
  "Solicitação de documentação do Simples Nacional",
  "Solicitação de documentação da folha de pagamento",
  "Rescisão",
  "Férias",
  "Cálculo de Imposto do Presumido"
];

const MONTHS_LIST = [
  { num: '01', name: 'Janeiro' },
  { num: '02', name: 'Fevereiro' },
  { num: '03', name: 'Março' },
  { num: '04', name: 'Abril' },
  { num: '05', name: 'Maio' },
  { num: '06', name: 'Junho' },
  { num: '07', name: 'Julho' },
  { num: '08', name: 'Agosto' },
  { num: '09', name: 'Setembro' },
  { num: '10', name: 'Outubro' },
  { num: '11', name: 'Novembro' },
  { num: '12', name: 'Dezembro' }
];

const YEARS_LIST = ['2027', '2026', '2025', '2024'];

// Lista estática de fallback para os 27 Estados Brasileiros
const BRAZIL_STATES_FALLBACK = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' }
];

const COUNTRIES_LIST = [
  "Brasil", "Afeganistão", "África do Sul", "Albânia", "Alemanha", "Andorra", "Angola", "Antígua e Barbuda", 
  "Arábia Saudita", "Argélia", "Argentina", "Armênia", "Austrália", "Áustria", "Azerbaijão", "Bahamas", 
  "Bahrein", "Bangladesh", "Barbados", "Bélgica", "Belize", "Benim", "Bielorrússia", "Bolívia", "Bósnia e Herzegovina", 
  "Botsuana", "Brunei", "Bulgária", "Burkina Faso", "Burundi", "Butão", "Cabo Verde", "Camarões", "Camboja", 
  "Canadá", "Catar", "Cazaquistão", "Chade", "Chile", "China", "Chipre", "Colômbia", "Comores", "Congo", 
  "Coreia do Norte", "Coreia do Sul", "Costa do Marfim", "Costa Rica", "Croácia", "Cuba", "Dinamarca", "Djibuti", 
  "Dominica", "Egito", "El Salvador", "Emirados Árabes Unidos", "Equador", "Eritreia", "Eslováquia", "Eslovênia", 
  "Espanha", "Estados Unidos", "Estônia", "Eswatini", "Etiópia", "Fiji", "Filipinas", "Finlândia", "França", 
  "Gabão", "Gâmbia", "Gana", "Geórgia", "Granada", "Grécia", "Guatemala", "Guiana", "Guiné", "Guiné Equatorial", 
  "Guiné-Bissau", "Haiti", "Honduras", "Hungria", "Iêmen", "Índia", "Indonésia", "Irã", "Iraque", "Irlanda", 
  "Islândia", "Israel", "Itália", "Jamaica", "Japão", "Jordânia", "Kuwait", "Laos", "Lesoto", "Letônia", 
  "Líbano", "Libéria", "Líbia", "Liechtenstein", "Lituânia", "Luxemburgo", "Macedônia do Norte", "Madagascar", 
  "Malásia", "Malaui", "Maldivas", "Mali", "Malta", "Marrocos", "Maurício", "Mauritânia", "México", "Mianmar", 
  "Micronésia", "Moçambique", "Moldávia", "Mônaco", "Mongólia", "Montenegro", "Namíbia", "Nauru", "Nepal", 
  "Nicarágua", "Níger", "Nigéria", "Noruega", "Nova Zelândia", "Omã", "Países Baixos", "Palau", "Panamá", 
  "Papua-Nova Guiné", "Paquistão", "Paraguai", "Peru", "Polônia", "Portugal", "Quênia", "Quirguistão", 
  "Reino Unido", "República Centro-Africana", "República Democrática do Congo", "República Dominicana", 
  "República Tcheca", "Romênia", "Ruanda", "Rússia", "Samoa", "San Marino", "Santa Lúcia", "São Cristóvão e Névis", 
  "São Tomé e Príncipe", "São Vicente e Granadinas", "Seicheles", "Senegal", "Serra Leoa", "Sérvia", "Singapura", 
  "Síria", "Somália", "Sri Lanka", "Sudão", "Sudão do Sul", "Suécia", "Suíça", "Suriname", "Tailândia", "Taiwan", 
  "Tajiquistão", "Tanzânia", "Timor-Leste", "Togo", "Tonga", "Trinidad e Tobago", "Tunísia", "Turcomenistão", 
  "Turquia", "Tuvalu", "Ucrânia", "Uganda", "Uruguai", "Uzbequistão", "Vanuatu", "Vaticano", "Venezuela", 
  "Vietnã", "Zâmbia", "Zimbábue"
];

const TAX_REGIMES = [
  { id: 'Simples Nacional', label: 'Simples Nacional', desc: 'Regime compartilhado ME/EPP', color: 'bg-amber-50 border-amber-300 text-amber-900' },
  { id: 'Lucro Presumido', label: 'Lucro Presumido', desc: 'Tributação simplificada IRPJ/CSLL', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'Lucro Real', label: 'Lucro Real', desc: 'Apuração pelo lucro contábil real', color: 'bg-neutral-900 border-neutral-800 text-amber-400' },
  { id: 'MEI', label: 'MEI', desc: 'Microempreendedor Individual', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { id: 'Imune/Isenta', label: 'Imune / Isenta', desc: 'Entidades sem fins lucrativos', color: 'bg-slate-100 border-slate-300 text-slate-700' }
];

// Máscaras
const formatCNPJ = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

const formatCEP = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
};

// Gera chave única de conversa individual 1-para-1 entre dois funcionários
const getDirectChatKey = (userA, userB) => {
  return [userA, userB].sort().join('__');
};

// Gera um arquivo PDF válido em DataURI caso o usuário faça simulação rápida ou para documentos de demonstração
const createFallbackPdfDataUrl = (title, companyName, refPeriod) => {
  const content = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 170 >> stream
BT /F1 16 Tf 50 720 Td (PILOTTO CONTABIL - DOCUMENTO OFICIAL) Tj /F1 12 Tf 0 -30 Td (Documento: ${title.replace(/[^\w\s]/gi, '')}) Tj 0 -20 Td (Empresa: ${companyName.replace(/[^\w\s]/gi, '')}) Tj 0 -20 Td (Competencia: ${refPeriod}) Tj ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000297 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
518
%%EOF`;
  return `data:application/pdf;base64,${btoa(content)}`;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('office'); // 'office' | 'client'
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false); // Controle de Login Real da Equipe
  const [authPortalTab, setAuthPortalTab] = useState('staff_login'); // 'staff_login' | 'staff_setup' | 'client_login'
  const [currentStaff, setCurrentStaff] = useState(TEAM_MEMBERS[0]); // Funcionário autenticado
  const [activeTab, setActiveTab] = useState('painel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Estados de Dados do Firestore
  const [staffAccounts, setStaffAccounts] = useState([]); // Contas personalizadas dos funcionários no Firestore
  const [companies, setCompanies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [companyPdfs, setCompanyPdfs] = useState([]); // Mural de PDFs por Empresa/Ano/Mês
  const [directMessages, setDirectMessages] = useState([]); // Chat Individual 1-para-1
  const [customTypes, setCustomTypes] = useState([]);

  // Estados do Login de Funcionário e Configuração de Senha
  const [staffLoginIdentifier, setStaffLoginIdentifier] = useState('');
  const [staffLoginPassword, setStaffLoginPassword] = useState('');
  const [staffLoginError, setStaffLoginError] = useState('');

  // Estados de Configurar / Criar Credenciais de Funcionário (Primeiro Acesso ou Nova Conta)
  const [setupMode, setSetupMode] = useState('update'); // 'update' | 'new'
  const [setupSelectedMemberId, setSetupSelectedMemberId] = useState('luis_neto');
  const [setupName, setSetupName] = useState('Luis Neto');
  const [setupRole, setSetupRole] = useState('Diretor / Contador');
  const [setupUsername, setSetupUsername] = useState('luis');
  const [setupEmail, setSetupEmail] = useState('luis@pilottocontabil.com.br');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  
  // Estados da API do IBGE e ViaCEP
  const [ibgeStates, setIbgeStates] = useState(BRAZIL_STATES_FALLBACK);
  const [ibgeCities, setIbgeCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepStatusMessage, setCepStatusMessage] = useState('');

  // Formulário de Nova Empresa
  const initialCompanyForm = {
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    taxRegime: 'Simples Nacional',
    country: 'Brasil',
    state: '',
    city: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: ''
  };
  const [newCompany, setNewCompany] = useState(initialCompanyForm);
  const [filterRegime, setFilterRegime] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados do Portal do Cliente com Senha Opcional
  const [clientPasswordInput, setClientPasswordInput] = useState('');

  // Formulário de Tarefa Interna (Equipe)
  const [newTask, setNewTask] = useState({
    taskType: DEFAULT_INTERNAL_TASKS[0],
    customTitle: '',
    companyId: '',
    assignedTo: 'francisco_luis',
    refYear: '2026',
    refMonth: '10',
    dueDate: '',
    priority: 'Normal'
  });
  const [newCustomInternalType, setNewCustomInternalType] = useState('');
  const [showAddInternalType, setShowAddInternalType] = useState(false);
  const [taskFilterMode, setTaskFilterMode] = useState('all');
  const [openTaskCommentsId, setOpenTaskCommentsId] = useState(null);
  const [taskCommentInput, setTaskCommentInput] = useState('');

  // Formulário de Solicitações com Clientes (Escritório <-> Cliente)
  const [newDoc, setNewDoc] = useState({
    activityType: DEFAULT_CLIENT_ACTIVITIES[0],
    details: '',
    companyId: '',
    assignedTo: 'anny_luize',
    refYear: '2026',
    refMonth: '10',
    dueDate: '',
    status: 'Pendente'
  });
  const [newCustomClientType, setNewCustomClientType] = useState('');
  const [showAddClientType, setShowAddClientType] = useState(false);
  const [openDocCommentsId, setOpenDocCommentsId] = useState(null);
  const [docCommentInput, setDocCommentInput] = useState('');

  // Modal de Finalização de Tarefa/Solicitação com Anexo PDF para o Mural da Empresa
  const [completionModal, setCompletionModal] = useState({
    isOpen: false,
    sourceType: 'task', // 'task' | 'client_request'
    item: null,
    companyId: '',
    refYear: '2026',
    refMonth: '10',
    notes: '',
    files: [] // [{ name, size, dataUrl }]
  });

  // Modal de Visualização de PDF Integrado
  const [previewPdfItem, setPreviewPdfItem] = useState(null);

  // Estados do Mural de Documentos (PDFs) separado por Empresa, Ano e Mês
  const [muralSelectedCompanyId, setMuralSelectedCompanyId] = useState('ALL');
  const [muralSelectedYear, setMuralSelectedYear] = useState('2026');
  const [muralSelectedMonth, setMuralSelectedMonth] = useState('10');

  // Estados do Chat Interno Individual (1 para 1)
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState('francisco_luis');
  const [directChatInput, setDirectChatInput] = useState('');
  const [directChatCompanyId, setDirectChatCompanyId] = useState('');
  const [directChatTaskId, setDirectChatTaskId] = useState('');

  // Estados do Portal do Cliente
  const [clientEmailInput, setClientEmailInput] = useState('');
  const [loggedClientCompany, setLoggedClientCompany] = useState(null);
  const [clientLoginError, setClientLoginError] = useState('');
  const [clientActiveSection, setClientActiveSection] = useState('mural'); // 'mural' | 'solicitacoes'
  const [clientNewRequestType, setClientNewRequestType] = useState(DEFAULT_CLIENT_ACTIVITIES[0]);
  const [clientRequestText, setClientRequestText] = useState('');
  const [clientRequestFiles, setClientRequestFiles] = useState([]);
  const [clientMuralYear, setClientMuralYear] = useState('2026');
  const [clientMuralMonth, setClientMuralMonth] = useState('10');

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Lista consolidada de funcionários (mescla os 3 membros padrão com as credenciais salvas no banco + novos funcionários)
  const activeTeamMembers = useMemo(() => {
    const merged = TEAM_MEMBERS.map(defaultMember => {
      const savedCustom = staffAccounts.find(acc => acc.memberId === defaultMember.id);
      if (savedCustom) {
        return {
          ...defaultMember,
          name: savedCustom.name || defaultMember.name,
          role: savedCustom.role || defaultMember.role,
          username: savedCustom.username || defaultMember.username,
          email: savedCustom.email || defaultMember.email,
          password: savedCustom.password || defaultMember.password,
          firestoreDocId: savedCustom.id
        };
      }
      return defaultMember;
    });

    const extraMembers = staffAccounts
      .filter(acc => !TEAM_MEMBERS.some(dm => dm.id === acc.memberId))
      .map(acc => ({
        id: acc.memberId,
        firestoreDocId: acc.id,
        name: acc.name,
        username: acc.username,
        email: acc.email,
        password: acc.password,
        short: `@${(acc.name || 'Membro').split(' ')[0]}`,
        role: acc.role || 'Contador / Analista',
        initials: (acc.name || 'MC').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        avatarBg: 'bg-neutral-800 text-amber-400 border border-amber-500/40',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300'
      }));

    return [...merged, ...extraMembers];
  }, [staffAccounts]);

  // Mantém os dados do funcionário logado sempre sincronizados caso ele edite seu e-mail/nome
  useEffect(() => {
    const updatedCurrent = activeTeamMembers.find(m => m.id === currentStaff.id);
    if (updatedCurrent) {
      setCurrentStaff(updatedCurrent);
    }
  }, [activeTeamMembers]);

  // Atualiza campos do formulário de configuração quando escolhe outro funcionário da equipe
  useEffect(() => {
    if (setupMode === 'update') {
      const found = activeTeamMembers.find(m => m.id === setupSelectedMemberId);
      if (found) {
        setSetupName(found.name);
        setSetupRole(found.role);
        setSetupUsername(found.username || '');
        setSetupEmail(found.email || '');
      }
    } else {
      setSetupName('');
      setSetupRole('Analista Contábil');
      setSetupUsername('');
      setSetupEmail('');
    }
  }, [setupSelectedMemberId, setupMode, activeTeamMembers]);

  // Garante que o parceiro de chat 1-para-1 nunca seja o próprio usuário logado
  useEffect(() => {
    if (selectedChatPartnerId === currentStaff.id) {
      const other = activeTeamMembers.find(m => m.id !== currentStaff.id);
      if (other) setSelectedChatPartnerId(other.id);
    }
  }, [currentStaff.id, selectedChatPartnerId, activeTeamMembers]);

  // Listas mescladas de Tipos de Tarefas Internas e de Clientes
  const internalTaskOptions = useMemo(() => {
    const custom = customTypes.filter(t => t.category === 'internal').map(t => t.name);
    return [...DEFAULT_INTERNAL_TASKS, ...custom];
  }, [customTypes]);

  const clientActivityOptions = useMemo(() => {
    const custom = customTypes.filter(t => t.category === 'client').map(t => t.name);
    return [...DEFAULT_CLIENT_ACTIVITIES, ...custom];
  }, [customTypes]);

  // 2. Autenticação Firebase
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 3. Carregar Estados da API do IBGE
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setIbgeStates(data.map(uf => ({ sigla: uf.sigla, nome: uf.nome })));
        }
      })
      .catch(() => {});
  }, []);

  // 4. Carregar Municípios do IBGE quando o Estado (UF) do Brasil for alterado
  useEffect(() => {
    if (newCompany.country === 'Brasil' && newCompany.state) {
      setLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${newCompany.state}/municipios?orderBy=nome`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setIbgeCities(data.map(m => m.nome));
          }
          setLoadingCities(false);
        })
        .catch(err => {
          console.error("Erro ao carregar municípios do IBGE:", err);
          setIbgeCities([]);
          setLoadingCities(false);
        });
    } else {
      setIbgeCities([]);
    }
  }, [newCompany.country, newCompany.state]);

  // 5. Busca Automática de CEP (ViaCEP) ao digitar 8 números
  const handleCepChange = async (rawValue) => {
    const formatted = formatCEP(rawValue);
    const digits = rawValue.replace(/\D/g, '');
    setNewCompany(prev => ({ ...prev, zipCode: formatted }));

    if (digits.length === 8) {
      setLoadingCep(true);
      setCepStatusMessage('Consultando CEP nos Correios...');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setNewCompany(prev => ({
            ...prev,
            zipCode: formatted,
            country: 'Brasil',
            state: data.uf || prev.state,
            city: data.localidade || prev.city,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood
          }));
          setCepStatusMessage(`Endereço localizado: ${data.logradouro || 'CEP Geral'} - ${data.localidade}/${data.uf}`);
        } else {
          setCepStatusMessage('CEP não encontrado. Preencha manualmente.');
        }
      } catch (err) {
        setCepStatusMessage('Não foi possível consultar o CEP no momento.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setCepStatusMessage('');
    }
  };

  // 6. Sincronização com Firestore
  useEffect(() => {
    if (!user) return;
    const basePath = `artifacts/${appId}/users/${user.uid}`;
    
    const staffRef = collection(db, basePath, 'staff_accounts');
    const companiesRef = collection(db, basePath, 'companies');
    const tasksRef = collection(db, basePath, 'tasks');
    const docsRef = collection(db, basePath, 'documents');
    const pdfsRef = collection(db, basePath, 'company_pdfs');
    const dmRef = collection(db, basePath, 'direct_messages');
    const typesRef = collection(db, basePath, 'custom_types');

    const unsubStaff = onSnapshot(
      staffRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setStaffAccounts(loaded);
      },
      (error) => console.error("Erro ao carregar contas de funcionários:", error)
    );

    const unsubCompanies = onSnapshot(
      companiesRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loaded.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setCompanies(loaded);
        if (loggedClientCompany) {
          const updated = loaded.find(c => c.id === loggedClientCompany.id);
          if (updated) setLoggedClientCompany(updated);
        }
      },
      (error) => console.error("Erro ao carregar empresas:", error)
    );

    const unsubTasks = onSnapshot(
      tasksRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loaded.sort((a, b) => new Date(a.dueDate || '2099-12-31') - new Date(b.dueDate || '2099-12-31'));
        setTasks(loaded);
      },
      (error) => console.error("Erro ao carregar tarefas:", error)
    );

    const unsubDocs = onSnapshot(
      docsRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loaded.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setDocuments(loaded);
      },
      (error) => console.error("Erro ao carregar solicitações:", error)
    );

    const unsubPdfs = onSnapshot(
      pdfsRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loaded.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
        setCompanyPdfs(loaded);
      },
      (error) => console.error("Erro ao carregar mural de PDFs:", error)
    );

    const unsubDirectMessages = onSnapshot(
      dmRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loaded.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        setDirectMessages(loaded);
      },
      (error) => console.error("Erro ao carregar mensagens diretas:", error)
    );

    const unsubTypes = onSnapshot(
      typesRef,
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomTypes(loaded);
      },
      (error) => console.error("Erro ao carregar tipos customizados:", error)
    );

    return () => {
      unsubStaff();
      unsubCompanies();
      unsubTasks();
      unsubDocs();
      unsubPdfs();
      unsubDirectMessages();
      unsubTypes();
    };
  }, [user, loggedClientCompany?.id]);

  // Funções Auxiliares de Equipe
  const getMemberInfo = (memberId) => {
    return activeTeamMembers.find(m => m.id === memberId) || activeTeamMembers[0];
  };

  // Autenticação de Funcionário (E-mail ou Usuário + Senha)
  const handleStaffLogin = (e) => {
    e.preventDefault();
    setStaffLoginError('');
    const cleanInput = staffLoginIdentifier.trim().toLowerCase();
    const cleanPass = staffLoginPassword.trim();

    const matchedMember = activeTeamMembers.find(m => 
      (m.email && m.email.toLowerCase() === cleanInput) ||
      (m.username && m.username.toLowerCase() === cleanInput) ||
      (m.name && m.name.toLowerCase() === cleanInput)
    );

    if (!matchedMember) {
      setStaffLoginError('Usuário ou e-mail não encontrado. Verifique os dados ou configure seu acesso na aba "Criar / Alterar Senha".');
      return;
    }

    if (matchedMember.password !== cleanPass) {
      setStaffLoginError('Senha incorreta para este funcionário. Tente novamente ou redefina na aba "Criar / Alterar Senha".');
      return;
    }

    setCurrentStaff(matchedMember);
    setIsStaffAuthenticated(true);
    setViewMode('office');
    setStaffLoginPassword('');
    showToast(`Bem-vindo(a) ao Pilotto Contábil, ${matchedMember.name}!`);
  };

  // Salvar ou Criar Credenciais Personalizadas de Funcionário (E-mail, Usuário e Senha)
  const handleSaveStaffCredentials = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!setupEmail.trim() || !setupPassword.trim()) {
      showToast('Preencha o e-mail e a nova senha.', 'error');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      showToast('A confirmação de senha não confere.', 'error');
      return;
    }

    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      const targetMemberId = setupMode === 'update' 
        ? setupSelectedMemberId 
        : `staff_${Date.now()}`;

      const existingDoc = staffAccounts.find(acc => acc.memberId === targetMemberId);

      const payload = {
        memberId: targetMemberId,
        name: setupName.trim(),
        role: setupRole.trim() || 'Contador / Analista',
        username: setupUsername.trim().toLowerCase() || setupEmail.split('@')[0].toLowerCase(),
        email: setupEmail.trim().toLowerCase(),
        password: setupPassword.trim(),
        updatedAt: new Date().toISOString()
      };

      if (existingDoc) {
        await updateDoc(doc(db, `${basePath}/staff_accounts`, existingDoc.id), payload);
      } else {
        await addDoc(collection(db, basePath, 'staff_accounts'), payload);
      }

      setSetupPassword('');
      setSetupConfirmPassword('');
      setStaffLoginIdentifier(payload.email);
      setAuthPortalTab('staff_login');
      showToast(`Credenciais de ${payload.name} salvas com sucesso! Você já pode entrar com seu e-mail e senha.`);
    } catch (error) {
      console.error("Erro ao salvar credenciais:", error);
      showToast("Erro ao salvar credenciais do funcionário.", "error");
    }
  };

  // Logout Geral (Funcionário ou Cliente)
  const handleLogout = () => {
    setIsStaffAuthenticated(false);
    setLoggedClientCompany(null);
    setViewMode('office');
    setAuthPortalTab('staff_login');
    showToast("Sessão encerrada com segurança.");
  };

  const getMonthLabel = (monthNum) => {
    const found = MONTHS_LIST.find(m => m.num === monthNum);
    return found ? found.name : monthNum;
  };

  // Leitura de arquivo PDF do computador (converte para DataURL ou ObjectURL seguro)
  const handleFileUploadList = (fileList, callback) => {
    const filesArray = Array.from(fileList || []);
    if (filesArray.length === 0) return;

    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawResult = ev.target?.result || '';
        // Garante que caiba com folga no limite de documento do Firestore
        const safeDataUrl = rawResult.length < 650000 
          ? rawResult 
          : URL.createObjectURL(file);

        callback({
          name: file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`,
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          dataUrl: safeDataUrl
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Ações de Banco de Dados
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.email || !user) return;
    if (!newCompany.country || !newCompany.state || !newCompany.city) {
      showToast("Por favor, selecione o País, Estado e Município da empresa.", "error");
      return;
    }

    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      await addDoc(collection(db, basePath, 'companies'), {
        ...newCompany,
        email: newCompany.email.trim().toLowerCase(),
        createdBy: currentStaff.name,
        createdAt: new Date().toISOString()
      });
      setNewCompany(initialCompanyForm);
      setCepStatusMessage('');
      showToast("Empresa cadastrada no Pilotto Contábil! E-mail liberado no Portal do Cliente.");
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error);
      showToast("Erro ao salvar empresa.", "error");
    }
  };

  const handleSaveCustomType = async (category, nameValue) => {
    if (!nameValue.trim() || !user) return;
    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      await addDoc(collection(db, basePath, 'custom_types'), {
        category,
        name: nameValue.trim(),
        createdBy: currentStaff.name,
        createdAt: new Date().toISOString()
      });
      if (category === 'internal') {
        setNewTask(prev => ({ ...prev, taskType: nameValue.trim() }));
        setNewCustomInternalType('');
        setShowAddInternalType(false);
      } else {
        setNewDoc(prev => ({ ...prev, activityType: nameValue.trim() }));
        setNewCustomClientType('');
        setShowAddClientType(false);
      }
      showToast(`Nova atividade "${nameValue.trim()}" adicionada ao Pilotto Contábil!`);
    } catch (err) {
      console.error("Erro ao criar tipo:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.taskType || !user) return;
    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      const selectedComp = companies.find(c => c.id === newTask.companyId);
      const assignee = getMemberInfo(newTask.assignedTo);
      const fullTitle = newTask.customTitle.trim() 
        ? `${newTask.taskType} — ${newTask.customTitle.trim()}`
        : newTask.taskType;

      await addDoc(collection(db, basePath, 'tasks'), {
        title: fullTitle,
        taskType: newTask.taskType,
        refYear: newTask.refYear || '2026',
        refMonth: newTask.refMonth || '10',
        dueDate: newTask.dueDate,
        priority: newTask.priority || 'Normal',
        companyId: newTask.companyId || '',
        companyName: selectedComp ? selectedComp.name : 'Interno do Escritório',
        assignedTo: assignee.id,
        assignedToName: assignee.name,
        delegatedBy: currentStaff.id,
        delegatedByName: currentStaff.name,
        completed: false,
        comments: [],
        createdAt: new Date().toISOString()
      });
      setNewTask(prev => ({ ...prev, customTitle: '' }));
      showToast(`Tarefa delegada para ${assignee.name}!`);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  // Abre o Modal de Finalização com Anexo PDF e Publicação no Mural da Empresa
  const openFinishWithPdfModal = (item, sourceType = 'task') => {
    const defaultCompId = item.companyId || (companies[0]?.id || '');
    setCompletionModal({
      isOpen: true,
      sourceType,
      item,
      companyId: defaultCompId,
      refYear: item.refYear || '2026',
      refMonth: item.refMonth || '10',
      notes: `Documento referente a: ${item.title || item.category}`,
      files: []
    });
  };

  // Confirma a Finalização da Tarefa/Solicitação e Publica os PDFs no Mural da Empresa (Ano/Mês)
  const handleConfirmFinishAndPublishPdf = async (e) => {
    e.preventDefault();
    if (!user || !completionModal.item) return;

    const targetItem = completionModal.item;
    const basePath = `artifacts/${appId}/users/${user.uid}`;
    const selectedComp = companies.find(c => c.id === completionModal.companyId);

    try {
      // 1. Atualiza o status da tarefa ou solicitação para Concluído
      if (completionModal.sourceType === 'task') {
        await updateDoc(doc(db, `${basePath}/tasks`, targetItem.id), {
          completed: true,
          completedBy: currentStaff.name,
          completedAt: new Date().toISOString()
        });
      } else {
        await updateDoc(doc(db, `${basePath}/documents`, targetItem.id), {
          status: 'Concluído',
          completedBy: currentStaff.name,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Se houver empresa selecionada e arquivos PDF (ou se o funcionário quiser gerar o PDF padrão), publica no Mural da Empresa
      if (selectedComp && completionModal.files.length > 0) {
        for (const pdfFile of completionModal.files) {
          await addDoc(collection(db, basePath, 'company_pdfs'), {
            companyId: selectedComp.id,
            companyName: selectedComp.name,
            year: completionModal.refYear,
            month: completionModal.refMonth,
            title: targetItem.title || targetItem.taskType || targetItem.category,
            category: targetItem.taskType || targetItem.category || 'Documento Contábil',
            fileName: pdfFile.name,
            fileSize: pdfFile.size || '145 KB',
            fileDataUrl: pdfFile.dataUrl || createFallbackPdfDataUrl(targetItem.title || 'Documento', selectedComp.name, `${completionModal.refMonth}/${completionModal.refYear}`),
            notes: completionModal.notes,
            publishedBy: currentStaff.name,
            publishedByRole: currentStaff.role,
            sourceType: completionModal.sourceType,
            publishedAt: new Date().toISOString()
          });
        }
        showToast(`Concluído! ${completionModal.files.length} arquivo(s) PDF publicado(s) no Mural de ${selectedComp.name} (${getMonthLabel(completionModal.refMonth)}/${completionModal.refYear}).`);
      } else {
        showToast("Atividade marcada como concluída com sucesso!");
      }

      setCompletionModal({
        isOpen: false,
        sourceType: 'task',
        item: null,
        companyId: '',
        refYear: '2026',
        refMonth: '10',
        notes: '',
        files: []
      });
    } catch (error) {
      console.error("Erro ao finalizar e publicar PDF:", error);
      showToast("Erro ao finalizar atividade.", "error");
    }
  };

  const handleAddTaskComment = async (taskItem) => {
    if (!taskCommentInput.trim() || !user) return;
    const updatedComments = [
      ...(Array.isArray(taskItem.comments) ? taskItem.comments : []),
      {
        id: Date.now().toString(),
        authorId: currentStaff.id,
        authorName: currentStaff.name,
        text: taskCommentInput.trim(),
        createdAt: new Date().toISOString()
      }
    ];
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskItem.id), {
        comments: updatedComments
      });
      setTaskCommentInput('');
      showToast("Nota adicionada na tarefa!");
    } catch (err) {
      console.error("Erro ao comentar tarefa:", err);
    }
  };

  const changeTaskAssignee = async (taskId, newAssigneeId) => {
    if (!user) return;
    const member = getMemberInfo(newAssigneeId);
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId), {
        assignedTo: member.id,
        assignedToName: member.name
      });
      showToast(`Tarefa repassada para ${member.name}!`);
    } catch (err) {
      console.error("Erro ao repassar tarefa:", err);
    }
  };

  const changeDocAssignee = async (docId, newAssigneeId) => {
    if (!user) return;
    const member = getMemberInfo(newAssigneeId);
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/documents`, docId), {
        assignedTo: member.id,
        assignedToName: member.name
      });
      showToast(`Solicitação atribuída para ${member.name}!`);
    } catch (err) {
      console.error("Erro ao atribuir solicitação:", err);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.activityType || !newDoc.companyId || !user) return;
    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      const selectedComp = companies.find(c => c.id === newDoc.companyId);
      const assignee = getMemberInfo(newDoc.assignedTo);
      const fullTitle = newDoc.details.trim()
        ? `${newDoc.activityType}: ${newDoc.details.trim()}`
        : newDoc.activityType;

      await addDoc(collection(db, basePath, 'documents'), {
        title: fullTitle,
        category: newDoc.activityType,
        refYear: newDoc.refYear || '2026',
        refMonth: newDoc.refMonth || '10',
        dueDate: newDoc.dueDate,
        companyId: newDoc.companyId,
        companyName: selectedComp ? selectedComp.name : '',
        assignedTo: assignee.id,
        assignedToName: assignee.name,
        createdBy: currentStaff.name,
        status: newDoc.status || 'Em Andamento',
        attachments: [],
        comments: [
          {
            id: Date.now().toString(),
            authorName: `${currentStaff.name} (Pilotto Contábil)`,
            role: 'office',
            text: newDoc.details.trim() || `Atendimento iniciado: ${newDoc.activityType}`,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      });
      setNewDoc(prev => ({ ...prev, details: '' }));
      showToast("Atendimento registrado e sincronizado com o Portal do Cliente!");
    } catch (error) {
      console.error("Erro ao adicionar atendimento:", error);
    }
  };

  const handleAddDocComment = async (docItem, textValue, isFromClient = false) => {
    if (!textValue.trim() || !user) return;
    const authorLabel = isFromClient 
      ? `${loggedClientCompany?.name || 'Cliente'}`
      : `${currentStaff.name} (Pilotto Contábil)`;

    const updatedComments = [
      ...(Array.isArray(docItem.comments) ? docItem.comments : []),
      {
        id: Date.now().toString(),
        authorName: authorLabel,
        role: isFromClient ? 'client' : 'office',
        text: textValue.trim(),
        createdAt: new Date().toISOString()
      }
    ];
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/documents`, docItem.id), {
        comments: updatedComments,
        status: isFromClient ? 'Em Andamento' : docItem.status,
        updatedAt: new Date().toISOString()
      });
      setDocCommentInput('');
      showToast("Mensagem registrada na solicitação!");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const cycleDocStatus = async (docItem) => {
    if (!user) return;
    if (docItem.status !== 'Concluído') {
      // Se próximo status for Concluído, oferece abrir o modal de anexo PDF
      if (docItem.status === 'Em Andamento') {
        openFinishWithPdfModal(docItem, 'client_request');
        return;
      }
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/documents`, docItem.id), {
        status: 'Em Andamento',
        updatedAt: new Date().toISOString()
      });
      showToast("Status alterado para: Em Andamento");
    } else {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/documents`, docItem.id), {
        status: 'Pendente',
        updatedAt: new Date().toISOString()
      });
      showToast("Solicitação reaberta (Pendente).");
    }
  };

  const reopenTask = async (taskId) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId), {
        completed: false,
        completedBy: null
      });
      showToast("Tarefa reaberta.");
    } catch (error) {
      console.error("Erro ao reabrir tarefa:", error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId));
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  const deleteCompany = async (companyId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/companies`, companyId));
      showToast("Empresa removida.");
    } catch (error) {
      console.error("Erro ao deletar empresa:", error);
    }
  };

  const deleteDocument = async (docId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/documents`, docId));
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
    }
  };

  const deletePublishedPdf = async (pdfId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/company_pdfs`, pdfId));
      showToast("Arquivo PDF removido do mural.");
    } catch (err) {
      console.error("Erro ao remover PDF:", err);
    }
  };

  // Envio de Mensagem no Chat Interno Individual (1 para 1)
  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!directChatInput.trim() || !user || !selectedChatPartnerId) return;
    const partner = getMemberInfo(selectedChatPartnerId);
    const comp = companies.find(c => c.id === directChatCompanyId);
    const linkedTask = tasks.find(t => t.id === directChatTaskId);
    const conversationKey = getDirectChatKey(currentStaff.id, partner.id);

    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      await addDoc(collection(db, basePath, 'direct_messages'), {
        conversationKey,
        senderId: currentStaff.id,
        senderName: currentStaff.name,
        receiverId: partner.id,
        receiverName: partner.name,
        text: directChatInput.trim(),
        companyId: comp ? comp.id : '',
        companyName: comp ? comp.name : '',
        taskId: linkedTask ? linkedTask.id : '',
        taskTitle: linkedTask ? linkedTask.title : '',
        createdAt: new Date().toISOString()
      });
      setDirectChatInput('');
      setDirectChatCompanyId('');
      setDirectChatTaskId('');
    } catch (err) {
      console.error("Erro ao enviar mensagem direta:", err);
    }
  };

  const deleteDirectMessage = async (msgId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/direct_messages`, msgId));
    } catch (err) {
      console.error("Erro ao apagar mensagem:", err);
    }
  };

  // Ações do Portal do Cliente
  const handleClientLogin = (e) => {
    e.preventDefault();
    setClientLoginError('');
    const cleanEmail = clientEmailInput.trim().toLowerCase();
    const found = companies.find(c => (c.email || '').toLowerCase() === cleanEmail);
    if (found) {
      setLoggedClientCompany(found);
      showToast(`Bem-vindo(a) ao Portal Exclusivo de ${found.name}!`);
    } else {
      setClientLoginError('Nenhuma empresa localizada com este e-mail. Verifique na aba Empresas do escritório.');
    }
  };

  const handleClientCreateActivity = async (e) => {
    e.preventDefault();
    if (!clientRequestText.trim() || !loggedClientCompany || !user) return;
    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      const isDpTopic = ['Cadastro de empregados', 'Rescisão', 'Férias', 'Solicitação de documentação da folha de pagamento'].includes(clientNewRequestType);
      const targetMember = isDpTopic ? TEAM_MEMBERS[2] : TEAM_MEMBERS[1];

      await addDoc(collection(db, basePath, 'documents'), {
        title: `${clientNewRequestType}: ${clientRequestText.trim()}`,
        category: clientNewRequestType,
        refYear: clientMuralYear || '2026',
        refMonth: clientMuralMonth || '10',
        dueDate: new Date().toISOString().split('T')[0],
        companyId: loggedClientCompany.id,
        companyName: loggedClientCompany.name,
        assignedTo: targetMember.id,
        assignedToName: targetMember.name,
        createdBy: `${loggedClientCompany.name} (Portal do Cliente)`,
        status: 'Pendente',
        attachments: clientRequestFiles,
        comments: [
          {
            id: Date.now().toString(),
            authorName: loggedClientCompany.name,
            role: 'client',
            text: clientRequestText.trim(),
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      });
      setClientRequestText('');
      setClientRequestFiles([]);
      showToast(`Solicitação enviada ao escritório Pilotto Contábil (${targetMember.name})!`);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  // Popular Dados de Exemplo Completos (Empresas, Tarefas, Chat 1-a-1 e PDFs no Mural por Ano/Mês)
  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      const basePath = `artifacts/${appId}/users/${user.uid}`;
      const comp1Ref = await addDoc(collection(db, basePath, 'companies'), {
        name: 'Supermercado Potiguar Ltda',
        cnpj: '12.345.678/0001-90',
        email: 'financeiro@potiguar.com.br',
        phone: '(84) 99988-7766',
        taxRegime: 'Lucro Presumido',
        country: 'Brasil',
        state: 'RN',
        city: 'Parnamirim',
        zipCode: '59140-000',
        street: 'Av. Brigadeiro Everaldo Breves',
        number: '450',
        neighborhood: 'Centro',
        createdBy: 'Luis Neto',
        createdAt: new Date().toISOString()
      });

      const comp2Ref = await addDoc(collection(db, basePath, 'companies'), {
        name: 'Clínica Médica Vida & Saúde',
        cnpj: '98.765.432/0001-10',
        email: 'contato@clinicavida.com.br',
        phone: '(84) 98877-6655',
        taxRegime: 'Simples Nacional',
        country: 'Brasil',
        state: 'RN',
        city: 'Natal',
        zipCode: '59020-000',
        street: 'Av. Prudente de Morais',
        number: '1020',
        neighborhood: 'Tirol',
        createdBy: 'Sr. Francisco Luis',
        createdAt: new Date().toISOString()
      });

      // Tarefas Internas Exemplo
      await addDoc(collection(db, basePath, 'tasks'), {
        title: 'Envio das folhas de pagamento mensais — Outubro/2026',
        taskType: 'Envio das folhas de pagamento mensais',
        refYear: '2026',
        refMonth: '10',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Alta',
        companyId: comp1Ref.id,
        companyName: 'Supermercado Potiguar Ltda',
        assignedTo: 'anny_luize',
        assignedToName: 'Srta. Anny Luize',
        delegatedBy: 'luis_neto',
        delegatedByName: 'Luis Neto',
        completed: false,
        comments: [],
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, basePath, 'tasks'), {
        title: 'Envio dos Impostos Presumido — PIS/COFINS e IRPJ',
        taskType: 'Envio dos Impostos Presumido',
        refYear: '2026',
        refMonth: '10',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Alta',
        companyId: comp1Ref.id,
        companyName: 'Supermercado Potiguar Ltda',
        assignedTo: 'francisco_luis',
        assignedToName: 'Sr. Francisco Luis',
        delegatedBy: 'luis_neto',
        delegatedByName: 'Luis Neto',
        completed: false,
        comments: [],
        createdAt: new Date().toISOString()
      });

      // Solicitações de Clientes Exemplo
      await addDoc(collection(db, basePath, 'documents'), {
        title: 'Férias: Programação de férias da funcionária Maria Clara (Novembro)',
        category: 'Férias',
        refYear: '2026',
        refMonth: '10',
        dueDate: new Date().toISOString().split('T')[0],
        companyId: comp2Ref.id,
        companyName: 'Clínica Médica Vida & Saúde',
        assignedTo: 'anny_luize',
        assignedToName: 'Srta. Anny Luize',
        createdBy: 'Clínica Médica Vida & Saúde (Portal do Cliente)',
        status: 'Em Andamento',
        attachments: [],
        comments: [
          { id: '10', authorName: 'Clínica Médica Vida & Saúde', role: 'client', text: 'Bom dia! Gostaríamos de programar 30 dias de férias da recepcionista Maria Clara iniciando dia 03/11.', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      });

      // PDFs Publicados no Mural de cada Empresa (Separados por Ano/Mês e estritamente privados por empresa)
      await addDoc(collection(db, basePath, 'company_pdfs'), {
        companyId: comp1Ref.id,
        companyName: 'Supermercado Potiguar Ltda',
        year: '2026',
        month: '10',
        title: 'Guia DARF PIS/COFINS e Relatório de Apuração',
        category: 'Envio dos Impostos Presumido',
        fileName: 'DARF_Presumido_Potiguar_10_2026.pdf',
        fileSize: '184 KB',
        fileDataUrl: createFallbackPdfDataUrl('DARF Presumido Outubro 2026', 'Supermercado Potiguar Ltda', '10/2026'),
        notes: 'Guia liberada para pagamento até o dia 20/10. Favor encaminhar comprovante.',
        publishedBy: 'Sr. Francisco Luis',
        publishedByRole: 'Contador Sênior / Fiscal',
        sourceType: 'task',
        publishedAt: new Date().toISOString()
      });

      await addDoc(collection(db, basePath, 'company_pdfs'), {
        companyId: comp2Ref.id,
        companyName: 'Clínica Médica Vida & Saúde',
        year: '2026',
        month: '10',
        title: 'Guia DAS Simples Nacional e Recibo PGDAS-D',
        category: 'Envio do Simples Nacional',
        fileName: 'DAS_Simples_ClinicaVida_10_2026.pdf',
        fileSize: '142 KB',
        fileDataUrl: createFallbackPdfDataUrl('DAS Simples Nacional Outubro 2026', 'Clinica Medica Vida e Saude', '10/2026'),
        notes: 'Guia DAS referente ao faturamento de Outubro/2026.',
        publishedBy: 'Luis Neto',
        publishedByRole: 'Diretor / Contador',
        sourceType: 'task',
        publishedAt: new Date().toISOString()
      });

      // Mensagens Individuais 1-para-1 Exemplo (Luis <-> Francisco e Luis <-> Anny)
      await addDoc(collection(db, basePath, 'direct_messages'), {
        conversationKey: getDirectChatKey('luis_neto', 'francisco_luis'),
        senderId: 'francisco_luis',
        senderName: 'Sr. Francisco Luis',
        receiverId: 'luis_neto',
        receiverName: 'Luis Neto',
        text: 'Luis, já fechei a conferência de ICMS e DIFAL do Supermercado Potiguar. Já publiquei o PDF do DARF no mural de Outubro deles.',
        companyId: comp1Ref.id,
        companyName: 'Supermercado Potiguar Ltda',
        taskId: '',
        taskTitle: '',
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, basePath, 'direct_messages'), {
        conversationKey: getDirectChatKey('luis_neto', 'anny_luize'),
        senderId: 'anny_luize',
        senderName: 'Srta. Anny Luize',
        receiverId: 'luis_neto',
        receiverName: 'Luis Neto',
        text: 'Bom dia Luis! A Clínica Vida & Saúde pediu o cálculo de férias da recepcionista pelo Portal. Já estou gerando o recibo em PDF.',
        companyId: comp2Ref.id,
        companyName: 'Clínica Médica Vida & Saúde',
        taskId: '',
        taskTitle: '',
        createdAt: new Date().toISOString()
      });

      showToast("Ambiente de demonstração Pilotto Contábil carregado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar exemplos:", err);
    }
  };

  // Filtros de Empresas
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesRegime = filterRegime === 'Todos' || c.taxRegime === filterRegime;
      const matchesSearch = !searchQuery || 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cnpj || '').includes(searchQuery) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegime && matchesSearch;
    });
  }, [companies, filterRegime, searchQuery]);

  // Filtros de Tarefas Internas por Membro da Equipe
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (taskFilterMode === 'mine') return t.assignedTo === currentStaff.id;
      if (taskFilterMode === 'delegated') return t.delegatedBy === currentStaff.id;
      if (taskFilterMode === 'all') return true;
      return t.assignedTo === taskFilterMode;
    });
  }, [tasks, taskFilterMode, currentStaff.id]);

  // Conversa Individual 1-para-1 filtrada exclusivamente entre o usuário logado e o colega selecionado
  const activeDirectConversation = useMemo(() => {
    const key = getDirectChatKey(currentStaff.id, selectedChatPartnerId);
    return directMessages.filter(m => m.conversationKey === key);
  }, [directMessages, currentStaff.id, selectedChatPartnerId]);

  // PDFs filtrados no Mural do Escritório (por Empresa, Ano e Mês)
  const filteredOfficeMuralPdfs = useMemo(() => {
    return companyPdfs.filter(pdf => {
      const matchesComp = muralSelectedCompanyId === 'ALL' || pdf.companyId === muralSelectedCompanyId;
      const matchesYear = pdf.year === muralSelectedYear;
      const matchesMonth = muralSelectedMonth === 'ALL' || pdf.month === muralSelectedMonth;
      return matchesComp && matchesYear && matchesMonth;
    });
  }, [companyPdfs, muralSelectedCompanyId, muralSelectedYear, muralSelectedMonth]);

  // PDFs filtrados ESTRITAMENTE para a Empresa Logada no Portal do Cliente
  const filteredClientMuralPdfs = useMemo(() => {
    if (!loggedClientCompany) return [];
    return companyPdfs.filter(pdf => {
      const isStrictlyOwnCompany = pdf.companyId === loggedClientCompany.id;
      const matchesYear = pdf.year === clientMuralYear;
      const matchesMonth = clientMuralMonth === 'ALL' || pdf.month === clientMuralMonth;
      return isStrictlyOwnCompany && matchesYear && matchesMonth;
    });
  }, [companyPdfs, loggedClientCompany, clientMuralYear, clientMuralMonth]);

  const getRegimeBadge = (regimeId) => {
    const found = TAX_REGIMES.find(r => r.id === regimeId);
    return found ? found.color : 'bg-slate-100 border-slate-200 text-slate-700';
  };

  // Outros membros da equipe para o Chat 1-para-1
  const otherTeamMembers = useMemo(() => {
    return activeTeamMembers.filter(m => m.id !== currentStaff.id);
  }, [currentStaff.id, activeTeamMembers]);

  const Navigation = () => {
    const navItems = [
      { id: 'painel', label: 'Painel Executivo', icon: LayoutDashboard },
      { id: 'empresas', label: 'Empresas (CEP/IBGE)', icon: Building2 },
      { id: 'tarefas', label: 'Tarefas Internas', icon: CheckSquare, count: tasks.filter(t => !t.completed && t.assignedTo === currentStaff.id).length },
      { id: 'documentos', label: 'Solicitações Clientes', icon: FileText, count: documents.filter(d => d.status !== 'Concluído').length },
      { id: 'mural_pdfs', label: 'Mural de PDFs (Ano/Mês)', icon: FolderOpen, count: companyPdfs.length },
      { id: 'chat_individual', label: 'Chat Individual (1:1)', icon: MessageSquare },
      { id: 'minha_conta', label: 'Minha Conta & Equipe', icon: KeyRound },
    ];

    return (
      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold shadow-md shadow-amber-500/20' 
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-amber-400'
              }`}
            >
              <div className="flex items-center">
                <Icon className={`h-5 w-5 mr-3 shrink-0 ${isActive ? 'text-neutral-950' : 'text-amber-500/80'}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-400 font-semibold tracking-wide">Iniciando Pilotto Contábil...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TELA DE LOGIN EXECUTIVA (QUANDO NENHUM FUNCIONÁRIO OU CLIENTE ESTÁ LOGADO)
  // ============================================================================
  if (!isStaffAuthenticated && !loggedClientCompany) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
        {/* Notificação Toast */}
        {toastMessage && (
          <div className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-2xl border flex items-center space-x-3 transition-all ${
            toastMessage.type === 'error' 
              ? 'bg-red-950 text-white border-red-700' 
              : 'bg-neutral-900 text-white border-amber-500'
          }`}>
            <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage.text}</span>
          </div>
        )}

        {/* Topo da Tela de Login */}
        <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-2xl shadow-lg shadow-amber-500/20">
              P
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Pilotto <span className="text-amber-400">Contábil</span>
              </h1>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">
                Plataforma Executiva de Gestão Contábil & Portal do Cliente
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => { setAuthPortalTab('staff_login'); setStaffLoginError(''); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
                authPortalTab === 'staff_login'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5 mr-1.5" /> Login Funcionário
            </button>
            <button
              type="button"
              onClick={() => { setAuthPortalTab('staff_setup'); setStaffLoginError(''); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
                authPortalTab === 'staff_setup'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Criar / Alterar Senha
            </button>
            <button
              type="button"
              onClick={() => { setAuthPortalTab('client_login'); setClientLoginError(''); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
                authPortalTab === 'client_login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Portal do Cliente
            </button>
          </div>
        </div>

        {/* Corpo Central de Autenticação */}
        <div className="max-w-5xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Coluna Esquerda: Apresentação e Acesso Rápido de Demonstração */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Ambiente Criptografado • Acesso Individual por Credenciais</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Controle exclusivo para <span className="text-amber-400">cada profissional</span> e transparência total para seus <span className="text-blue-400">clientes</span>.
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Cada membro da equipe (<strong>Luis Neto</strong>, <strong>Sr. Francisco Luis</strong> e <strong>Srta. Anny Luize</strong>) possui seu próprio login com e-mail, usuário e senha personalizada, garantindo privacidade no Chat 1:1 e rastreabilidade nas tarefas e publicações de PDFs.
            </p>

            {/* Cartões de Contas da Equipe (Para Preenchimento Rápido ou Conferência) */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <Users className="h-4 w-4 mr-1.5" /> Credenciais da Equipe (Clique para preencher)
                </p>
                <span className="text-[11px] text-neutral-400">100% editáveis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeTeamMembers.map(member => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setAuthPortalTab('staff_login');
                      setStaffLoginIdentifier(member.email);
                      setStaffLoginPassword(member.password);
                      setStaffLoginError('');
                    }}
                    className="p-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${member.avatarBg}`}>
                        {member.initials}
                      </span>
                      <span className="font-bold text-xs text-white group-hover:text-amber-400 truncate">
                        {member.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">{member.email}</p>
                    <p className="text-[10px] text-amber-400/90 font-semibold mt-1">
                      Usuário: {member.username} • Senha: {member.password}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Card de Login / Configuração */}
          <div className="lg:col-span-6">
            {authPortalTab === 'staff_login' && (
              <div className="bg-white text-neutral-900 rounded-2xl border border-amber-500/40 shadow-2xl overflow-hidden">
                <div className="bg-neutral-900 p-6 border-b border-amber-500/30 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                      Acesso Interno do Escritório
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2">Entrar como Funcionário</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Use seu e-mail ou nome de usuário e sua senha pessoal
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-xl shadow-md">
                    <Lock className="h-6 w-6" />
                  </div>
                </div>

                <form onSubmit={handleStaffLogin} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      E-mail ou Usuário do Funcionário *
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={staffLoginIdentifier}
                        onChange={(e) => setStaffLoginIdentifier(e.target.value)}
                        placeholder="Ex: luis@pilottocontabil.com.br ou luis"
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Senha de Acesso *
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthPortalTab('staff_setup')}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Criar ou alterar minha senha →
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={staffLoginPassword}
                        onChange={(e) => setStaffLoginPassword(e.target.value)}
                        placeholder="Digite sua senha..."
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {staffLoginError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{staffLoginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-amber-400 font-bold rounded-xl text-sm flex items-center justify-center transition-colors border border-amber-500/40 shadow-md"
                  >
                    Acessar Painel Pilotto Contábil <ArrowRight className="h-4 w-4 ml-2" />
                  </button>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span>Quer personalizar seu login?</span>
                    <button
                      type="button"
                      onClick={() => setAuthPortalTab('staff_setup')}
                      className="font-bold text-amber-700 hover:underline flex items-center"
                    >
                      <Settings className="h-3.5 w-3.5 mr-1" /> Configurar E-mail e Senha
                    </button>
                  </div>
                </form>
              </div>
            )}

            {authPortalTab === 'staff_setup' && (
              <div className="bg-white text-neutral-900 rounded-2xl border border-amber-500/40 shadow-2xl overflow-hidden">
                <div className="bg-neutral-900 p-6 border-b border-amber-500/30 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                      Credenciais Personalizadas
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2">Criar / Configurar Meu Acesso</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Defina o e-mail, usuário e senha exclusivos de cada funcionário
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
                    <KeyRound className="h-6 w-6" />
                  </div>
                </div>

                <form onSubmit={handleSaveStaffCredentials} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSetupMode('update')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        setupMode === 'update' ? 'bg-neutral-950 text-amber-400 shadow-xs' : 'text-neutral-600'
                      }`}
                    >
                      Configurar Membro da Equipe
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupMode('new')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        setupMode === 'new' ? 'bg-neutral-950 text-amber-400 shadow-xs' : 'text-neutral-600'
                      }`}
                    >
                      + Cadastrar Novo Funcionário
                    </button>
                  </div>

                  {setupMode === 'update' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Selecione Seu Perfil na Equipe *
                      </label>
                      <select
                        value={setupSelectedMemberId}
                        onChange={(e) => setSetupSelectedMemberId(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold bg-amber-50/40 outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {activeTeamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Nome do Funcionário *
                      </label>
                      <input
                        type="text"
                        required
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        placeholder="Ex: Luis Neto"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Cargo / Setor *
                      </label>
                      <input
                        type="text"
                        required
                        value={setupRole}
                        onChange={(e) => setSetupRole(e.target.value)}
                        placeholder="Ex: Diretor / Contador"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Seu E-mail de Login *
                      </label>
                      <input
                        type="email"
                        required
                        value={setupEmail}
                        onChange={(e) => setSetupEmail(e.target.value)}
                        placeholder="seuemail@pilottocontabil.com.br"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Usuário Curto (Opcional)
                      </label>
                      <input
                        type="text"
                        value={setupUsername}
                        onChange={(e) => setSetupUsername(e.target.value)}
                        placeholder="Ex: luis"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                        Criar / Nova Senha *
                      </label>
                      <input
                        type="password"
                        required
                        value={setupPassword}
                        onChange={(e) => setSetupPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                        className="w-full px-3 py-2 border border-amber-400 bg-amber-50/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                        Confirmar Senha *
                      </label>
                      <input
                        type="password"
                        required
                        value={setupConfirmPassword}
                        onChange={(e) => setSetupConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full px-3 py-2 border border-amber-400 bg-amber-50/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center shadow-md transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Salvar Meu E-mail e Senha de Acesso
                  </button>
                </form>
              </div>
            )}

            {authPortalTab === 'client_login' && (
              <div className="bg-white text-neutral-900 rounded-2xl border border-blue-500/40 shadow-2xl overflow-hidden">
                <div className="bg-neutral-900 p-6 border-b border-blue-500/30 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/30">
                      Espaço Exclusivo da Empresa Cliente
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2">Portal do Cliente</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Acesse o Mural de PDFs (Ano/Mês) e solicite serviços à nossa equipe
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <form
                    onSubmit={(e) => {
                      handleClientLogin(e);
                      setViewMode('client');
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        E-mail Cadastrado da Sua Empresa *
                      </label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={clientEmailInput}
                          onChange={(e) => setClientEmailInput(e.target.value)}
                          placeholder="financeiro@suaempresa.com.br"
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {clientLoginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{clientLoginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center transition-colors shadow-md"
                    >
                      Acessar Portal da Empresa <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  </form>

                  {companies.length > 0 && (
                    <div className="pt-4 border-t border-neutral-100">
                      <p className="text-[11px] font-bold uppercase text-neutral-400 mb-2">
                        Empresas Cadastradas (Clique para testar acesso):
                      </p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {companies.map(comp => (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setClientEmailInput(comp.email || '');
                              setLoggedClientCompany(comp);
                              setViewMode('client');
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:border-blue-500 hover:bg-blue-50/40 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-neutral-900">{comp.name}</p>
                              <p className="text-neutral-500">{comp.email}</p>
                            </div>
                            <span className="text-blue-600 font-bold">Entrar →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé da Tela de Login */}
        <div className="max-w-5xl w-full mx-auto pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <span>© 2026 Pilotto Contábil • Acesso Protegido para Equipe e Clientes</span>
          <span>Desenvolvido sob medida para Luis Neto, Sr. Francisco Luis e Srta. Anny Luize</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex overflow-hidden font-sans text-neutral-900">
      {/* Notificação Toast */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-2xl border flex items-center space-x-3 transition-all ${
          toastMessage.type === 'error' 
            ? 'bg-red-950 text-white border-red-700' 
            : 'bg-neutral-950 text-white border-amber-500/60'
        }`}>
          <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* =========================================================================
         MODAL DE FINALIZAÇÃO DE TAREFA/SOLICITAÇÃO COM ANEXO PDF PARA O MURAL
         ========================================================================= */}
      {completionModal.isOpen && completionModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-amber-500/40 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-neutral-950 text-white p-5 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Finalizar e Publicar PDF no Mural</h3>
                  <p className="text-xs text-amber-400">O PDF ficará disponível exclusivamente para a empresa selecionada</p>
                </div>
              </div>
              <button
                onClick={() => setCompletionModal(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFinishAndPublishPdf} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Atividade sendo concluída</p>
                <p className="text-sm font-bold text-neutral-900 mt-0.5">{completionModal.item.title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Empresa Destinatária do Mural (Privacidade Estrita) *
                </label>
                <select
                  value={completionModal.companyId}
                  onChange={(e) => setCompletionModal(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">Apenas concluir internamente (Sem publicar para cliente)</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>🏢 {c.name} ({c.cnpj})</option>
                  ))}
                </select>
              </div>

              {completionModal.companyId && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Ano do Mural *
                      </label>
                      <select
                        value={completionModal.refYear}
                        onChange={(e) => setCompletionModal(prev => ({ ...prev, refYear: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm bg-white font-semibold outline-none"
                      >
                        {YEARS_LIST.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Mês de Referência *
                      </label>
                      <select
                        value={completionModal.refMonth}
                        onChange={(e) => setCompletionModal(prev => ({ ...prev, refMonth: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm bg-white font-semibold outline-none"
                      >
                        {MONTHS_LIST.map(m => (
                          <option key={m.num} value={m.num}>{m.num} - {m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Upload de Arquivos PDF */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Anexar Arquivo(s) em PDF (Guia, Folha, Recibo, Demonstrativo)
                    </label>
                    <div className="border-2 border-dashed border-amber-500/50 bg-amber-50/40 rounded-xl p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        id="pdf-upload-modal"
                        className="hidden"
                        onChange={(e) => {
                          handleFileUploadList(e.target.files, (fileObj) => {
                            setCompletionModal(prev => ({
                              ...prev,
                              files: [...prev.files, fileObj]
                            }));
                          });
                        }}
                      />
                      <label htmlFor="pdf-upload-modal" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-6 w-6 text-amber-600 mb-1.5" />
                        <span className="text-xs font-bold text-neutral-800">
                          Clique para selecionar PDF(s) do seu computador
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5">
                          Ou use o botão abaixo para gerar um PDF timbrado de teste
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const compObj = companies.find(c => c.id === completionModal.companyId);
                          const cleanName = (completionModal.item.title || 'Documento').replace(/\s+/g, '_').slice(0, 28);
                          const fileName = `${cleanName}_${completionModal.refMonth}_${completionModal.refYear}.pdf`;
                          setCompletionModal(prev => ({
                            ...prev,
                            files: [
                              ...prev.files,
                              {
                                name: fileName,
                                size: '156 KB',
                                dataUrl: createFallbackPdfDataUrl(
                                  completionModal.item.title || 'Guia Contabil',
                                  compObj ? compObj.name : 'Empresa Cliente',
                                  `${completionModal.refMonth}/${completionModal.refYear}`
                                )
                              }
                            ]
                          }));
                        }}
                        className="mt-2.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg text-xs font-semibold inline-flex items-center"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Anexar PDF Timbrado Instantâneo
                      </button>
                    </div>

                    {/* Lista de PDFs anexados no modal */}
                    {completionModal.files.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {completionModal.files.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 bg-neutral-100 rounded-lg border border-neutral-200 text-xs">
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="h-4 w-4 text-red-600 shrink-0" />
                              <span className="font-semibold text-neutral-800 truncate">{f.name}</span>
                              <span className="text-neutral-400">({f.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompletionModal(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== idx)
                              }))}
                              className="text-red-500 hover:text-red-700 font-bold ml-2"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Observação para o Cliente no Mural
                    </label>
                    <textarea
                      rows="2"
                      value={completionModal.notes}
                      onChange={(e) => setCompletionModal(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ex: Guia liberada para pagamento até o dia 20..."
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCompletionModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {completionModal.files.length > 0 ? 'Concluir e Publicar PDF no Mural' : 'Apenas Concluir Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         MODAL DE VISUALIZAÇÃO / DOWNLOAD DO ARQUIVO PDF
         ========================================================================= */}
      {previewPdfItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-amber-500/40 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">{previewPdfItem.fileName}</h3>
                  <p className="text-[11px] text-neutral-400">
                    {previewPdfItem.companyName} • Competência: {getMonthLabel(previewPdfItem.month)}/{previewPdfItem.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={previewPdfItem.fileDataUrl}
                  download={previewPdfItem.fileName}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold flex items-center"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Baixar PDF
                </a>
                <button
                  onClick={() => setPreviewPdfItem(null)}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold"
                >
                  Fechar ✕
                </button>
              </div>
            </div>
            <div className="p-6 bg-neutral-100 flex-1 overflow-y-auto space-y-4">
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      Documento Auditado • Pilotto Contábil
                    </span>
                    <h4 className="text-lg font-bold text-neutral-900 mt-2">{previewPdfItem.title}</h4>
                    <p className="text-xs text-neutral-500">Empresa: <strong>{previewPdfItem.companyName}</strong></p>
                  </div>
                  <div className="text-right text-xs text-neutral-500">
                    <p>Referência: <strong>{getMonthLabel(previewPdfItem.month)} / {previewPdfItem.year}</strong></p>
                    <p>Publicado por: <strong>{previewPdfItem.publishedBy}</strong></p>
                  </div>
                </div>
                {previewPdfItem.notes && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 mb-4">
                    <strong>Instruções do Escritório:</strong> {previewPdfItem.notes}
                  </div>
                )}
                <iframe
                  title={previewPdfItem.fileName}
                  src={previewPdfItem.fileDataUrl}
                  className="w-full h-72 rounded-lg border border-neutral-300 bg-neutral-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         GAVETA LATERAL DE CHAT INDIVIDUAL (1-PARA-1 ENTRE FUNCIONÁRIOS)
         ========================================================================= */}
      {isChatDrawerOpen && viewMode === 'office' && (
        <div className="fixed inset-0 z-40 flex justify-end bg-neutral-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-amber-500/30 flex flex-col justify-between">
            <div className="p-4 bg-neutral-950 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="h-5 w-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Chat Individual Privado (1:1)</h3>
                    <p className="text-[11px] text-amber-400">Você está conectado como {currentStaff.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="text-neutral-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-800"
                >
                  Fechar ✕
                </button>
              </div>

              {/* Seletor de com qual colega conversar individualmente */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                {otherTeamMembers.map(colleague => {
                  const isSelected = selectedChatPartnerId === colleague.id;
                  return (
                    <button
                      key={colleague.id}
                      onClick={() => setSelectedChatPartnerId(colleague.id)}
                      className={`p-2 rounded-xl text-left transition-all flex items-center space-x-2 border ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-neutral-950 text-amber-400' : colleague.avatarBg
                      }`}>
                        {colleague.initials}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{colleague.name}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          Conversa privada
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
              {activeDirectConversation.map(msg => {
                const isMe = msg.senderId === currentStaff.id;
                const sender = getMemberInfo(msg.senderId);
                return (
                  <div key={msg.id} className={`p-3.5 rounded-2xl border shadow-2xs ${
                    isMe ? 'bg-neutral-950 text-white border-amber-500/40 ml-6' : 'bg-white text-neutral-900 border-neutral-200 mr-6'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs ${isMe ? 'text-amber-400' : 'text-blue-600'}`}>
                        {sender.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isMe ? 'text-neutral-100' : 'text-neutral-700'}`}>{msg.text}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.companyName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-md text-amber-300">
                          🏢 {msg.companyName}
                        </span>
                      )}
                      {msg.taskTitle && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-md text-blue-300">
                          📌 {msg.taskTitle}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {activeDirectConversation.length === 0 && (
                <div className="text-center py-10 px-4">
                  <p className="text-xs text-neutral-500 font-medium">
                    Conversa individual privada entre <strong>{currentStaff.name}</strong> e <strong>{getMemberInfo(selectedChatPartnerId).name}</strong>.
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Somente vocês dois visualizam as mensagens enviadas neste canal.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendDirectMessage} className="p-4 bg-white border-t border-neutral-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={directChatCompanyId}
                  onChange={(e) => setDirectChatCompanyId(e.target.value)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-[11px] bg-neutral-50 outline-none"
                >
                  <option value="">Vincular empresa (Opcional)</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={directChatTaskId}
                  onChange={(e) => setDirectChatTaskId(e.target.value)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-[11px] bg-neutral-50 outline-none"
                >
                  <option value="">Vincular tarefa (Opcional)</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={directChatInput}
                  onChange={(e) => setDirectChatInput(e.target.value)}
                  placeholder={`Mensagem privada para ${getMemberInfo(selectedChatPartnerId).name}...`}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && viewMode === 'office' && (
        <div 
          className="fixed inset-0 bg-neutral-950/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Principal (Visão do Escritório Pilotto Contábil - Preto, Dourado e Branco) */}
      {viewMode === 'office' && (
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-neutral-950 text-white border-r border-amber-500/20 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center px-6 border-b border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black mr-2.5 shadow-sm">
              P
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">Pilotto <span className="text-amber-400">Contábil</span></span>
              <p className="text-[10px] text-neutral-400 -mt-1 uppercase tracking-widest">Gestão Executiva</p>
            </div>
          </div>
          
          <div className="flex flex-col h-[calc(100vh-4rem)] justify-between">
            <div>
              {/* Card do Funcionário Logado na Barra Lateral */}
              <div className="mx-4 mt-4 p-3 rounded-xl bg-neutral-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${currentStaff.avatarBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {currentStaff.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentStaff.name}</p>
                    <p className="text-[10px] text-amber-400/90 truncate">{currentStaff.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('minha_conta')}
                  title="Configurar Minha Conta e Senha"
                  className="text-neutral-400 hover:text-amber-400 p-1"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              <Navigation />
            </div>
            
            <div className="p-4 border-t border-neutral-800 space-y-2.5">
              <div className="bg-neutral-900 rounded-xl p-3 border border-amber-500/30">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Portal do Cliente</p>
                <button
                  onClick={() => setViewMode('client')}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> Simular Visão Cliente
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-red-950/60 text-neutral-300 hover:text-red-300 border border-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1.5" /> Sair da Conta ({currentStaff.short})
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar com Identificação do Funcionário Logado e Botão de Trocar Conta / Logout */}
        <header className="bg-white min-h-16 border-b border-neutral-200 flex flex-wrap items-center justify-between px-4 lg:px-8 py-2 gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            {viewMode === 'office' ? (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black mr-2.5">
                  P
                </div>
                <span className="text-lg font-extrabold text-neutral-900">
                  Pilotto <span className="text-amber-600">Contábil</span>
                  <span className="text-xs font-bold bg-neutral-950 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full ml-2.5">
                    Área Exclusiva do Cliente
                  </span>
                </span>
              </div>
            )}

            {/* Indicador de Conta Logada + Botão Configurar Senha */}
            {viewMode === 'office' && (
              <div className="flex items-center flex-wrap gap-2 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${currentStaff.avatarBg}`}>
                  {currentStaff.initials}
                </span>
                <div className="text-xs">
                  <span className="font-bold text-neutral-900">{currentStaff.name}</span>
                  <span className="text-neutral-500 hidden sm:inline"> ({currentStaff.email})</span>
                </div>
                <button
                  onClick={() => setActiveTab('minha_conta')}
                  className="ml-1 px-2 py-0.5 bg-white hover:bg-amber-50 text-amber-800 border border-neutral-300 rounded-md text-[11px] font-bold flex items-center"
                >
                  <KeyRound className="h-3 w-3 mr-1" /> Senha / Equipe
                </button>
              </div>
            )}
          </div>

          {/* Botões Direitos: Chat Individual 1:1, Alternador Escritório/Cliente e Sair */}
          <div className="flex items-center space-x-2">
            {viewMode === 'office' && (
              <button
                onClick={() => setIsChatDrawerOpen(true)}
                className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                Chat 1:1 ({otherTeamMembers.map(m => m.short).join(' / ')})
              </button>
            )}

            {isStaffAuthenticated && (
              <div className="bg-neutral-100 p-1 rounded-xl border border-neutral-200 flex items-center text-xs font-bold">
                <button
                  onClick={() => setViewMode('office')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center ${
                    viewMode === 'office' ? 'bg-neutral-950 text-amber-400 shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                  Escritório
                </button>
                <button
                  onClick={() => setViewMode('client')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center ${
                    viewMode === 'client' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Portal do Cliente
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center transition-colors"
              title="Encerrar sessão e voltar para a tela de login"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" /> Sair
            </button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {viewMode === 'client' ? (
              /* =========================================================================
                 VISÃO DO PORTAL DO CLIENTE (MURAL DE PDFS POR ANO/MÊS + SOLICITAÇÕES)
                 ========================================================================= */
              <div className="space-y-6">
                {!loggedClientCompany ? (
                  <div className="max-w-md mx-auto mt-6 bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
                    <div className="bg-neutral-950 p-6 border-b border-amber-500/40 text-white">
                      <div className="w-12 h-12 bg-amber-500 text-neutral-950 rounded-xl flex items-center justify-center mb-4 font-black text-xl shadow-md">
                        P
                      </div>
                      <h2 className="text-2xl font-bold text-white">Portal do Cliente</h2>
                      <p className="text-xs text-amber-400 mt-1">
                        Pilotto Contábil • Acesso seguro ao Mural de Documentos (PDFs) e Solicitações
                      </p>
                    </div>

                    <div className="p-6">
                      <form onSubmit={handleClientLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            E-mail de Acesso da Sua Empresa
                          </label>
                          <div className="relative">
                            <Mail className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                            <input
                              type="email"
                              required
                              value={clientEmailInput}
                              onChange={(e) => setClientEmailInput(e.target.value)}
                              placeholder="financeiro@suaempresa.com.br"
                              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>
                        </div>

                        {clientLoginError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{clientLoginError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-neutral-950 hover:bg-neutral-800 text-amber-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center transition-colors border border-amber-500/40 shadow-sm"
                        >
                          Entrar no Portal da Empresa <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                      </form>

                      {/* Atalho Rápido para Simulação */}
                      <div className="mt-6 pt-5 border-t border-neutral-100">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                          Acesso Rápido p/ Demonstração (Empresas Cadastradas):
                        </p>
                        {companies.length === 0 ? (
                          <p className="text-xs text-neutral-500">
                            Nenhuma empresa cadastrada. Volte à visão do <strong>Escritório</strong> e clique em "Carregar Dados de Exemplo".
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {companies.map(comp => (
                              <button
                                key={comp.id}
                                type="button"
                                onClick={() => {
                                  setClientEmailInput(comp.email || '');
                                  setLoggedClientCompany(comp);
                                }}
                                className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex items-center justify-between text-xs"
                              >
                                <div>
                                  <p className="font-bold text-neutral-900">{comp.name}</p>
                                  <p className="text-neutral-500">{comp.email}</p>
                                </div>
                                <span className="text-blue-600 font-bold">Acessar →</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Painel Logado da Empresa Cliente (Vê EXCLUSIVAMENTE os dados da sua própria empresa) */
                  <div className="space-y-6">
                    <div className="bg-neutral-950 text-white rounded-2xl p-6 border border-amber-500/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-neutral-950 rounded-full">
                            {loggedClientCompany.taxRegime || 'Simples Nacional'}
                          </span>
                          <span className="text-xs text-neutral-300">CNPJ: {loggedClientCompany.cnpj}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            🔒 Ambiente Privado da Empresa
                          </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white">{loggedClientCompany.name}</h2>
                        <p className="text-xs text-neutral-300 mt-1 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-amber-400" />
                          {loggedClientCompany.street ? `${loggedClientCompany.street}, ${loggedClientCompany.number || 'S/N'} - ` : ''}
                          {loggedClientCompany.city} / {loggedClientCompany.state} ({loggedClientCompany.zipCode || 'Sem CEP'})
                        </p>
                      </div>
                      <button
                        onClick={() => { setLoggedClientCompany(null); setClientEmailInput(''); }}
                        className="self-start md:self-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-xl text-xs font-bold flex items-center transition-colors border border-amber-500/30"
                      >
                        <LogOut className="h-4 w-4 mr-1.5" /> Trocar Empresa / Sair
                      </button>
                    </div>

                    {/* Abas Internas do Portal do Cliente */}
                    <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
                      <button
                        onClick={() => setClientActiveSection('mural')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
                          clientActiveSection === 'mural'
                            ? 'bg-neutral-950 text-amber-400 shadow-sm border border-amber-500/40'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <FolderOpen className="h-4 w-4 mr-2 text-amber-400" />
                        Mural de Documentos & Guias PDF (Por Ano e Mês)
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px]">
                          {companyPdfs.filter(p => p.companyId === loggedClientCompany.id).length}
                        </span>
                      </button>
                      <button
                        onClick={() => setClientActiveSection('solicitacoes')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
                          clientActiveSection === 'solicitacoes'
                            ? 'bg-neutral-950 text-amber-400 shadow-sm border border-amber-500/40'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Solicitar ao Escritório & Acompanhar Pedidos
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 text-[10px]">
                          {documents.filter(d => d.companyId === loggedClientCompany.id).length}
                        </span>
                      </button>
                    </div>

                    {clientActiveSection === 'mural' ? (
                      /* MURAL EXCLUSIVO DA EMPRESA NO PORTAL DO CLIENTE (SEPARADO POR ANO E MÊS) */
                      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center">
                              <FolderOpen className="h-5 w-5 mr-2 text-amber-500" />
                              Mural de Documentos Contábeis, Folhas e Impostos (PDF)
                            </h3>
                            <p className="text-xs text-neutral-500">
                              Documentos publicados pela equipe Pilotto Contábil exclusivamente para <strong>{loggedClientCompany.name}</strong>.
                            </p>
                          </div>

                          {/* Seletor de Ano */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-neutral-600">Ano:</span>
                            {YEARS_LIST.map(year => (
                              <button
                                key={year}
                                onClick={() => setClientMuralYear(year)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  clientMuralYear === year
                                    ? 'bg-neutral-950 text-amber-400 border border-amber-500/40'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Navegação de Pastas por Mês (Janeiro a Dezembro) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                          <button
                            onClick={() => setClientMuralMonth('ALL')}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              clientMuralMonth === 'ALL'
                                ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold shadow-xs'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-amber-400'
                            }`}
                          >
                            <p className="text-xs font-bold">Todos os Meses</p>
                            <p className="text-[10px] opacity-80">
                              {companyPdfs.filter(p => p.companyId === loggedClientCompany.id && p.year === clientMuralYear).length} PDF(s)
                            </p>
                          </button>
                          {MONTHS_LIST.map(m => {
                            const countInMonth = companyPdfs.filter(
                              p => p.companyId === loggedClientCompany.id && p.year === clientMuralYear && p.month === m.num
                            ).length;
                            const isSelected = clientMuralMonth === m.num;
                            return (
                              <button
                                key={m.num}
                                onClick={() => setClientMuralMonth(m.num)}
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? 'bg-neutral-950 text-amber-400 border-amber-500 font-bold shadow-xs'
                                    : countInMonth > 0
                                    ? 'bg-amber-50/50 text-neutral-900 border-amber-300 hover:bg-amber-50'
                                    : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">{m.name}</span>
                                  {countInMonth > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                      isSelected ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-950 text-amber-400'
                                    }`}>
                                      {countInMonth}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] opacity-75 mt-0.5">{m.num}/{clientMuralYear}</p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Lista de PDFs disponíveis no Ano/Mês selecionado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {filteredClientMuralPdfs.map(pdf => (
                            <div key={pdf.id} className="p-4 rounded-2xl border border-neutral-200 hover:border-amber-500/60 bg-neutral-50/50 flex flex-col justify-between gap-3 transition-all">
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 border border-amber-500/30">
                                      {getMonthLabel(pdf.month)} / {pdf.year}
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                      {pdf.category}
                                    </span>
                                  </div>
                                  <p className="font-bold text-sm text-neutral-900">{pdf.title}</p>
                                  <p className="text-xs text-neutral-600 truncate mt-0.5">{pdf.fileName} ({pdf.fileSize})</p>
                                  {pdf.notes && (
                                    <p className="text-xs text-neutral-600 bg-white p-2 rounded-lg border border-neutral-200 mt-2">
                                      💬 {pdf.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-neutral-200/80 text-xs">
                                <span className="text-[11px] text-neutral-500">
                                  Enviado por: <strong>{pdf.publishedBy}</strong>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewPdfItem(pdf)}
                                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg font-bold flex items-center"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" /> Visualizar
                                  </button>
                                  <a
                                    href={pdf.fileDataUrl}
                                    download={pdf.fileName}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg font-bold flex items-center"
                                  >
                                    <Download className="h-3.5 w-3.5 mr-1" /> Baixar PDF
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredClientMuralPdfs.length === 0 && (
                            <div className="md:col-span-2 text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                              <FolderOpen className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                              <p className="text-sm font-bold text-neutral-700">
                                Nenhum PDF publicado em {clientMuralMonth === 'ALL' ? clientMuralYear : `${getMonthLabel(clientMuralMonth)} de ${clientMuralYear}`}.
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                Assim que o escritório finalizar uma folha, imposto ou solicitação e anexar o PDF, ele aparecerá aqui.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* ABA DE SOLICITAÇÕES DO CLIENTE PARA O ESCRITÓRIO */
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                          <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            Histórico de Solicitações de {loggedClientCompany.name}
                          </h3>
                          <div className="space-y-4">
                            {documents.filter(d => d.companyId === loggedClientCompany.id).map(docItem => (
                              <div key={docItem.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-950 text-amber-400">
                                        {docItem.category}
                                      </span>
                                      <span className="text-xs text-neutral-500">
                                        Atendimento: <strong>{docItem.assignedToName || 'Equipe Pilotto'}</strong>
                                      </span>
                                    </div>
                                    <p className="font-bold text-sm text-neutral-900">{docItem.title}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    docItem.status === 'Pendente'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : docItem.status === 'Concluído'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-blue-50 text-blue-800 border-blue-200'
                                  }`}>
                                    {docItem.status}
                                  </span>
                                </div>

                                {Array.isArray(docItem.attachments) && docItem.attachments.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {docItem.attachments.map((att, i) => (
                                      <a
                                        key={i}
                                        href={att.dataUrl}
                                        download={att.name}
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-blue-700 flex items-center"
                                      >
                                        <Paperclip className="h-3 w-3 mr-1" /> {att.name}
                                      </a>
                                    ))}
                                  </div>
                                )}

                                {Array.isArray(docItem.comments) && docItem.comments.length > 0 && (
                                  <div className="bg-white rounded-xl p-3 border border-neutral-200 space-y-2">
                                    {docItem.comments.map(c => (
                                      <div key={c.id} className="text-xs">
                                        <span className={`font-bold ${c.role === 'client' ? 'text-amber-700' : 'text-blue-700'}`}>
                                          {c.authorName}:{' '}
                                        </span>
                                        <span className="text-neutral-700">{c.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Enviar mensagem ou complemento ao escritório..."
                                    value={openDocCommentsId === docItem.id ? docCommentInput : ''}
                                    onFocus={() => setOpenDocCommentsId(docItem.id)}
                                    onChange={(e) => {
                                      setOpenDocCommentsId(docItem.id);
                                      setDocCommentInput(e.target.value);
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddDocComment(docItem, docCommentInput || 'Documentação complementar encaminhada.', true)}
                                    className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-400 rounded-lg text-xs font-bold flex items-center shrink-0"
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1" /> Responder
                                  </button>
                                </div>
                              </div>
                            ))}
                            {documents.filter(d => d.companyId === loggedClientCompany.id).length === 0 && (
                              <div className="text-center py-8 text-neutral-500 text-sm">
                                Nenhuma solicitação aberta por sua empresa ainda.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Formulário para o Cliente Solicitar ao Escritório */}
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                          <h3 className="text-base font-bold text-neutral-900 mb-1">Nova Solicitação ao Escritório</h3>
                          <p className="text-xs text-neutral-500 mb-4">
                            Solicite Cadastro de Empregados, Férias, Rescisão ou envie arquivos para nossa equipe:
                          </p>
                          <form onSubmit={handleClientCreateActivity} className="space-y-3.5">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                Assunto da Solicitação
                              </label>
                              <select
                                value={clientNewRequestType}
                                onChange={(e) => setClientNewRequestType(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                              >
                                {clientActivityOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                Descrição / Dados da Solicitação *
                              </label>
                              <textarea
                                rows="4"
                                required
                                value={clientRequestText}
                                onChange={(e) => setClientRequestText(e.target.value)}
                                placeholder="Informe os dados do empregado, período de férias, dúvidas ou detalhes..."
                                className="w-full p-3 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                              ></textarea>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                Anexar Documento / Comprovante (Opcional)
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                  handleFileUploadList(e.target.files, (fileObj) => {
                                    setClientRequestFiles(prev => [...prev, fileObj]);
                                  });
                                }}
                                className="w-full text-xs text-neutral-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-950 file:text-amber-400"
                              />
                              {clientRequestFiles.length > 0 && (
                                <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                                  {clientRequestFiles.length} arquivo(s) pronto(s) para envio.
                                </p>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
                            >
                              Protocolar Solicitação na Pilotto Contábil
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* =========================================================================
                 VISÃO INTERNA DO ESCRITÓRIO PILOTTO CONTÁBIL (LUIS, FRANCISCO E ANNY)
                 ========================================================================= */
              <>
                {activeTab === 'painel' && (
                  <div className="space-y-6">
                    {/* Banner Executivo Preto & Dourado */}
                    <div className="bg-neutral-950 text-white p-6 rounded-2xl border border-amber-500/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl ${currentStaff.avatarBg} flex items-center justify-center font-extrabold text-lg shadow-sm`}>
                          {currentStaff.initials}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-extrabold text-white">Bem-vindo, {currentStaff.name}</h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500 text-neutral-950">
                              {currentStaff.role}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 mt-1">
                            Você possui <strong className="text-amber-400">{tasks.filter(t => !t.completed && t.assignedTo === currentStaff.id).length} tarefas internas</strong> na sua fila e <strong className="text-blue-400">{documents.filter(d => d.status !== 'Concluído' && d.assignedTo === currentStaff.id).length} solicitações de clientes</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {companies.length === 0 && (
                          <button
                            onClick={handleSeedDemoData}
                            className="bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-colors"
                          >
                            <Sparkles className="h-4 w-4 mr-1.5 text-amber-400" /> Carregar Dados de Exemplo
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('tarefas')}
                          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-sm transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1.5" /> Nova Tarefa Interna
                        </button>
                      </div>
                    </div>

                    {/* Cards da Equipe (Luis Neto, Sr. Francisco Luis, Srta. Anny Luize e novos membros) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activeTeamMembers.map(member => {
                        const memberPendingTasks = tasks.filter(t => !t.completed && t.assignedTo === member.id).length;
                        const memberCompletedTasks = tasks.filter(t => t.completed && t.assignedTo === member.id).length;
                        const memberClientDocs = documents.filter(d => d.status !== 'Concluído' && d.assignedTo === member.id).length;
                        return (
                          <div 
                            key={member.id} 
                            className="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-amber-500/60 shadow-xs transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center ${member.avatarBg}`}>
                                  {member.initials}
                                </span>
                                <div>
                                  <p className="font-bold text-sm text-neutral-900">{member.name}</p>
                                  <p className="text-[11px] text-neutral-500">{member.role}</p>
                                </div>
                              </div>
                              {member.id !== currentStaff.id && (
                                <button
                                  onClick={() => {
                                    setSelectedChatPartnerId(member.id);
                                    setIsChatDrawerOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" /> Chat 1:1
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-center">
                              <div 
                                onClick={() => { setTaskFilterMode(member.id); setActiveTab('tarefas'); }}
                                className="cursor-pointer bg-neutral-50 hover:bg-amber-50 p-2 rounded-xl border border-neutral-200/60"
                              >
                                <p className="text-lg font-extrabold text-amber-600">{memberPendingTasks}</p>
                                <p className="text-[10px] text-neutral-600 font-semibold">Internas</p>
                              </div>
                              <div 
                                onClick={() => setActiveTab('documentos')}
                                className="cursor-pointer bg-neutral-50 hover:bg-blue-50 p-2 rounded-xl border border-neutral-200/60"
                              >
                                <p className="text-lg font-extrabold text-blue-600">{memberClientDocs}</p>
                                <p className="text-[10px] text-neutral-600 font-semibold">Clientes</p>
                              </div>
                              <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-200/60">
                                <p className="text-lg font-extrabold text-emerald-600">{memberCompletedTasks}</p>
                                <p className="text-[10px] text-neutral-600 font-semibold">Concluídas</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Prévia Dupla: Tarefas com Finalização em PDF & Conversas Individuais 1:1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                        <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center justify-between">
                          <span className="flex items-center">
                            <CheckSquare className="h-5 w-5 mr-2 text-amber-500" />
                            Fila de {currentStaff.name}
                          </span>
                          <button onClick={() => { setTaskFilterMode('mine'); setActiveTab('tarefas'); }} className="text-xs text-blue-600 hover:underline font-bold">
                            Ver todas →
                          </button>
                        </h3>
                        <div className="space-y-2.5">
                          {tasks.filter(t => !t.completed && t.assignedTo === currentStaff.id).slice(0, 5).map(task => (
                            <div key={task.id} className="flex justify-between items-center p-3.5 hover:bg-neutral-50 rounded-xl border border-neutral-200/80">
                              <div className="min-w-0 pr-2">
                                <p className="text-sm font-bold text-neutral-900 truncate">{task.title}</p>
                                <p className="text-xs text-neutral-500">
                                  🏢 {task.companyName} • Competência: {task.refMonth || '10'}/{task.refYear || '2026'}
                                </p>
                              </div>
                              <button
                                onClick={() => openFinishWithPdfModal(task, 'task')}
                                className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold shrink-0 flex items-center"
                              >
                                <FileCheck className="h-3.5 w-3.5 mr-1" /> Finalizar + PDF
                              </button>
                            </div>
                          ))}
                          {tasks.filter(t => !t.completed && t.assignedTo === currentStaff.id).length === 0 && (
                            <p className="text-neutral-500 text-sm text-center py-6">
                              Nenhuma tarefa interna pendente para {currentStaff.name}.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Resumo do Chat Individual 1:1 */}
                      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center">
                              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                              Chat Direto Individual (1:1)
                            </h3>
                            <div className="flex space-x-1.5">
                              {otherTeamMembers.map(colleague => (
                                <button
                                  key={colleague.id}
                                  onClick={() => setSelectedChatPartnerId(colleague.id)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                    selectedChatPartnerId === colleague.id
                                      ? 'bg-neutral-950 text-amber-400'
                                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                  }`}
                                >
                                  {colleague.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {activeDirectConversation.slice(-4).map(msg => {
                              const isMe = msg.senderId === currentStaff.id;
                              return (
                                <div key={msg.id} className={`p-3 rounded-xl text-xs border ${
                                  isMe ? 'bg-neutral-950 text-white border-amber-500/30 ml-4' : 'bg-neutral-50 text-neutral-800 border-neutral-200 mr-4'
                                }`}>
                                  <div className="flex justify-between mb-0.5">
                                    <span className={`font-bold ${isMe ? 'text-amber-400' : 'text-blue-600'}`}>{msg.senderName}</span>
                                    {msg.companyName && <span className="text-[10px] text-amber-500">🏢 {msg.companyName}</span>}
                                  </div>
                                  <p>{msg.text}</p>
                                </div>
                              );
                            })}
                            {activeDirectConversation.length === 0 && (
                              <p className="text-neutral-400 text-xs text-center py-6">
                                Nenhuma mensagem privada entre você e {getMemberInfo(selectedChatPartnerId).name}.
                              </p>
                            )}
                          </div>
                        </div>

                        <form onSubmit={handleSendDirectMessage} className="mt-4 pt-3 border-t border-neutral-100 flex gap-2">
                          <input
                            type="text"
                            required
                            value={directChatInput}
                            onChange={(e) => setDirectChatInput(e.target.value)}
                            placeholder={`Falar reservadamente com ${getMemberInfo(selectedChatPartnerId).name}...`}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-neutral-950 hover:bg-neutral-800 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center shrink-0"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" /> Enviar
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'empresas' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-neutral-900">Cadastro de Empresas Clientes</h2>
                      <p className="text-sm text-neutral-500">
                        Busca automática de rua pelo <strong>CEP (ViaCEP)</strong> + Municípios oficiais do <strong>IBGE</strong> e e-mail de acesso ao Portal.
                      </p>
                    </div>

                    <form onSubmit={handleAddCompany} className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6">
                      <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                        <h3 className="text-base font-bold text-neutral-900 flex items-center">
                          <Building2 className="h-5 w-5 mr-2 text-amber-500" />
                          1. Identificação e E-mail de Acesso Exclusivo
                        </h3>
                        <span className="text-xs text-neutral-400">Responsável pelo cadastro: <strong>{currentStaff.name}</strong></span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Razão Social / Nome da Empresa *
                          </label>
                          <input 
                            type="text" 
                            required
                            value={newCompany.name}
                            onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="Ex: Pilotto Participações Ltda"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            CNPJ *
                          </label>
                          <input 
                            type="text" 
                            required
                            value={newCompany.cnpj}
                            onChange={(e) => setNewCompany({...newCompany, cnpj: formatCNPJ(e.target.value)})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="00.000.000/0001-00"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Telefone / WhatsApp *
                          </label>
                          <div className="relative">
                            <Phone className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                            <input 
                              type="text" 
                              required
                              value={newCompany.phone}
                              onChange={(e) => setNewCompany({...newCompany, phone: formatPhone(e.target.value)})}
                              className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                              placeholder="(84) 99999-9999"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-12">
                          <label className="block text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                            E-mail da Empresa (Utilizado pelo cliente para acessar o Mural de PDFs e Solicitações) *
                          </label>
                          <div className="relative">
                            <Mail className="h-4 w-4 text-blue-600 absolute left-3.5 top-3" />
                            <input 
                              type="email" 
                              required
                              value={newCompany.email}
                              onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                              className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="diretoria@empresa.com.br"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Classificação Tributária */}
                      <div className="pt-2">
                        <div className="border-b border-neutral-100 pb-3 mb-4">
                          <h3 className="text-base font-bold text-neutral-900 flex items-center">
                            <ShieldCheck className="h-5 w-5 mr-2 text-amber-500" />
                            2. Classificação Tributária *
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {TAX_REGIMES.map((regime) => {
                            const isSelected = newCompany.taxRegime === regime.id;
                            return (
                              <label
                                key={regime.id}
                                onClick={() => setNewCompany({ ...newCompany, taxRegime: regime.id })}
                                className={`cursor-pointer rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                                  isSelected 
                                    ? 'bg-neutral-950 text-amber-400 border-amber-500 ring-2 ring-amber-500/30' 
                                    : 'bg-white border-neutral-200 hover:border-amber-400'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`font-bold text-sm ${isSelected ? 'text-amber-400' : 'text-neutral-900'}`}>{regime.label}</span>
                                  <input
                                    type="radio"
                                    name="taxRegime"
                                    checked={isSelected}
                                    onChange={() => setNewCompany({ ...newCompany, taxRegime: regime.id })}
                                    className="h-4 w-4 accent-amber-500"
                                  />
                                </div>
                                <p className={`text-xs leading-snug ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>{regime.desc}</p>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Endereço Inteligente: CEP Automático + Cascata País -> UF -> Município */}
                      <div className="pt-2">
                        <div className="border-b border-neutral-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-neutral-900 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-amber-500" />
                            3. Endereço com Preenchimento Automático pelo CEP *
                          </h3>
                          {cepStatusMessage && (
                            <span className="text-xs font-bold text-neutral-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center">
                              {loadingCep && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                              {cepStatusMessage}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-1.5">
                              CEP (Identifica a Rua)
                            </label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={newCompany.zipCode}
                                onChange={(e) => handleCepChange(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-400 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="00000-000"
                              />
                              {loadingCep && (
                                <Loader2 className="h-4 w-4 text-amber-600 animate-spin absolute right-3 top-3" />
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              Logradouro (Rua / Avenida)
                            </label>
                            <input 
                              type="text" 
                              value={newCompany.street}
                              onChange={(e) => setNewCompany({...newCompany, street: e.target.value})}
                              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                              placeholder="Preenchido pelo CEP ou digite..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              Número / Sala
                            </label>
                            <input 
                              type="text" 
                              value={newCompany.number}
                              onChange={(e) => setNewCompany({...newCompany, number: e.target.value})}
                              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                              placeholder="Ex: 120"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              Bairro
                            </label>
                            <input 
                              type="text" 
                              value={newCompany.neighborhood}
                              onChange={(e) => setNewCompany({...newCompany, neighborhood: e.target.value})}
                              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                              placeholder="Bairro"
                            />
                          </div>

                          {/* 1º Passo: País */}
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              1º País *
                            </label>
                            <select
                              required
                              value={newCompany.country}
                              onChange={(e) => {
                                setNewCompany({
                                  ...newCompany,
                                  country: e.target.value,
                                  state: '',
                                  city: ''
                                });
                              }}
                              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                            >
                              <option value="">Selecione o País...</option>
                              {COUNTRIES_LIST.map(country => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                          </div>

                          {/* 2º Passo: Estado */}
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              2º Estado (Após País) *
                            </label>
                            {!newCompany.country ? (
                              <select disabled className="w-full px-3.5 py-2.5 border border-neutral-200 bg-neutral-100 text-neutral-400 rounded-xl text-sm">
                                <option>Aguardando País...</option>
                              </select>
                            ) : newCompany.country === 'Brasil' ? (
                              <select
                                required
                                value={newCompany.state}
                                onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value, city: '' })}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                              >
                                <option value="">Selecione o Estado (UF)...</option>
                                {ibgeStates.map(uf => (
                                  <option key={uf.sigla} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                required
                                value={newCompany.state}
                                onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value, city: '' })}
                                placeholder="Estado / Província..."
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none"
                              />
                            )}
                          </div>

                          {/* 3º Passo: Município */}
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                              3º Município (Após Estado) *
                            </label>
                            {!newCompany.state ? (
                              <select disabled className="w-full px-3.5 py-2.5 border border-neutral-200 bg-neutral-100 text-neutral-400 rounded-xl text-sm">
                                <option>Aguardando Estado...</option>
                              </select>
                            ) : newCompany.country === 'Brasil' ? (
                              <select
                                required
                                disabled={loadingCities}
                                value={newCompany.city}
                                onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                              >
                                <option value="">
                                  {loadingCities ? 'Carregando IBGE...' : `Selecione o Município...`}
                                </option>
                                {ibgeCities.map(cityName => (
                                  <option key={cityName} value={cityName}>{cityName}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                required
                                value={newCompany.city}
                                onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                                placeholder="Cidade..."
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-neutral-100">
                        <button
                          type="submit"
                          className="bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center transition-colors shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Cadastrar Empresa no Pilotto Contábil
                        </button>
                      </div>
                    </form>

                    {/* Tabela de Empresas */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                      <div className="p-4 bg-neutral-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-amber-400">Carteira de Clientes ({filteredCompanies.length})</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative">
                            <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Buscar empresa, CNPJ, cidade..."
                              className="pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg text-xs outline-none"
                            />
                          </div>
                          <select
                            value={filterRegime}
                            onChange={(e) => setFilterRegime(e.target.value)}
                            className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg text-xs outline-none"
                          >
                            <option value="Todos">Todos os Regimes</option>
                            {TAX_REGIMES.map(r => (
                              <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-100 text-neutral-600 text-xs uppercase tracking-wider border-b border-neutral-200">
                              <th className="p-4 font-bold">Empresa / CNPJ</th>
                              <th className="p-4 font-bold">Regime Tributário</th>
                              <th className="p-4 font-bold">E-mail do Portal & Contato</th>
                              <th className="p-4 font-bold">Endereço</th>
                              <th className="p-4 font-bold text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 text-sm">
                            {filteredCompanies.map(company => (
                              <tr key={company.id} className="hover:bg-neutral-50">
                                <td className="p-4">
                                  <p className="font-bold text-neutral-900">{company.name}</p>
                                  <p className="text-xs text-neutral-500">{company.cnpj}</p>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold border ${getRegimeBadge(company.taxRegime)}`}>
                                    {company.taxRegime}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <p className="text-xs font-bold text-blue-600">{company.email}</p>
                                  <p className="text-xs text-neutral-500">{company.phone}</p>
                                </td>
                                <td className="p-4 text-xs text-neutral-600">
                                  <p className="font-bold text-neutral-800">
                                    {company.street ? `${company.street}, ${company.number || 'S/N'}` : 'Sem logradouro'}
                                  </p>
                                  <p className="text-neutral-500">
                                    {company.city}/{company.state} ({company.zipCode || company.country})
                                  </p>
                                </td>
                                <td className="p-4 text-right space-x-1.5">
                                  <button
                                    onClick={() => {
                                      setMuralSelectedCompanyId(company.id);
                                      setActiveTab('mural_pdfs');
                                    }}
                                    className="bg-amber-500/15 hover:bg-amber-500/30 text-amber-900 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center"
                                  >
                                    <FolderOpen className="h-3.5 w-3.5 mr-1" /> Mural PDFs
                                  </button>
                                  <button
                                    onClick={() => {
                                      setLoggedClientCompany(company);
                                      setViewMode('client');
                                    }}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" /> Portal
                                  </button>
                                  <button
                                    onClick={() => deleteCompany(company.id)}
                                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg inline-flex items-center"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {filteredCompanies.length === 0 && (
                              <tr>
                                <td colSpan="5" className="p-8 text-center text-neutral-500">
                                  Nenhuma empresa encontrada.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tarefas' && (
                  /* =========================================================================
                     ABA DE TAREFAS INTERNAS (COM FINALIZAÇÃO E PUBLICAÇÃO DE PDF NO MURAL)
                     ========================================================================= */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-2xl font-extrabold text-neutral-900">Tarefas Internas da Equipe</h2>
                        <p className="text-sm text-neutral-500">
                          Ao finalizar qualquer tarefa, anexe o PDF (guia, folha, recibo) para publicá-lo diretamente no Mural da Empresa por Ano e Mês.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddInternalType(!showAddInternalType)}
                        className="self-start sm:self-auto text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl flex items-center shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Criar Novo Tipo de Tarefa Interna
                      </button>
                    </div>

                    {showAddInternalType && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="text"
                          value={newCustomInternalType}
                          onChange={(e) => setNewCustomInternalType(e.target.value)}
                          placeholder="Nome da nova rotina interna..."
                          className="flex-1 w-full px-3.5 py-2 bg-white border border-amber-400 rounded-xl text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCustomType('internal', newCustomInternalType)}
                          className="bg-neutral-950 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
                        >
                          Salvar na Lista
                        </button>
                      </div>
                    )}

                    {/* Formulário de Criação e Delegação */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                        <h3 className="text-base font-bold text-neutral-900">Designar Tarefa Interna</h3>
                        <span className="text-xs text-neutral-500">
                          Criando como: <strong className="text-amber-700">{currentStaff.name}</strong>
                        </span>
                      </div>

                      <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            1. Atividade Interna *
                          </label>
                          <select
                            value={newTask.taskType}
                            onChange={(e) => setNewTask({...newTask, taskType: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white font-semibold outline-none"
                          >
                            {internalTaskOptions.map(item => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            2. Empresa Cliente Vinculada
                          </label>
                          <select
                            value={newTask.companyId}
                            onChange={(e) => setNewTask({...newTask, companyId: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white outline-none"
                          >
                            <option value="">Interno do Escritório (Geral)</option>
                            {companies.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.taxRegime})</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                            3. Designar Para (Funcionário) *
                          </label>
                          <select
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-amber-400 bg-amber-50/50 rounded-xl text-sm font-bold text-neutral-900 outline-none"
                          >
                            {activeTeamMembers.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Observação / Detalhe
                          </label>
                          <input 
                            type="text" 
                            value={newTask.customTitle}
                            onChange={(e) => setNewTask({...newTask, customTitle: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none"
                            placeholder="Ex: Conferir retenção de ISS..."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Ano Ref.
                          </label>
                          <select
                            value={newTask.refYear}
                            onChange={(e) => setNewTask({...newTask, refYear: e.target.value})}
                            className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white outline-none"
                          >
                            {YEARS_LIST.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Mês Ref.
                          </label>
                          <select
                            value={newTask.refMonth}
                            onChange={(e) => setNewTask({...newTask, refMonth: e.target.value})}
                            className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white outline-none"
                          >
                            {MONTHS_LIST.map(m => <option key={m.num} value={m.num}>{m.name}</option>)}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Vencimento
                          </label>
                          <input 
                            type="date" 
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                            className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button type="submit" className="w-full bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-colors">
                            <Plus className="h-4 w-4 mr-1.5" /> Delegar
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Filtros Rápidos por Funcionário */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setTaskFilterMode('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          taskFilterMode === 'all' ? 'bg-neutral-950 text-amber-400 border-neutral-950' : 'bg-white text-neutral-600 border-neutral-200'
                        }`}
                      >
                        Todas ({tasks.length})
                      </button>
                      <button
                        onClick={() => setTaskFilterMode('mine')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          taskFilterMode === 'mine' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-white text-neutral-600 border-neutral-200'
                        }`}
                      >
                        Minhas: {currentStaff.name} ({tasks.filter(t => t.assignedTo === currentStaff.id).length})
                      </button>
                      {activeTeamMembers.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setTaskFilterMode(m.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            taskFilterMode === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-neutral-600 border-neutral-200'
                          }`}
                        >
                          Fila de {m.name} ({tasks.filter(t => t.assignedTo === m.id).length})
                        </button>
                      ))}
                    </div>

                    {/* Lista de Tarefas Internas */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                      <ul className="divide-y divide-neutral-100">
                        {filteredTasks.map(task => {
                          const assignee = getMemberInfo(task.assignedTo);
                          const isCommentsOpen = openTaskCommentsId === task.id;
                          const commentCount = Array.isArray(task.comments) ? task.comments.length : 0;

                          return (
                            <li key={task.id} className={`p-4 transition-colors ${task.completed ? 'bg-neutral-50/80 opacity-75' : 'hover:bg-neutral-50/40'}`}>
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div className="flex items-start space-x-3.5 flex-1">
                                  <button 
                                    onClick={() => task.completed ? reopenTask(task.id) : openFinishWithPdfModal(task, 'task')}
                                    className={`mt-0.5 flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-600' : 'text-neutral-300 hover:text-amber-500'}`}
                                    title={task.completed ? "Clique para reabrir" : "Concluir e Anexar PDF"}
                                  >
                                    {task.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                  </button>
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className={`font-bold text-sm text-neutral-900 ${task.completed ? 'line-through text-neutral-500' : ''}`}>
                                        {task.title}
                                      </p>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                        Ref: {getMonthLabel(task.refMonth || '10')}/{task.refYear || '2026'}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                                      <span className="font-bold text-blue-700">🏢 {task.companyName || 'Interno'}</span>
                                      <span>• Delegado por: <strong>{task.delegatedByName}</strong></span>
                                      {task.dueDate && (
                                        <span>• Vencimento: <strong>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</strong></span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                                  {!task.completed && (
                                    <button
                                      type="button"
                                      onClick={() => openFinishWithPdfModal(task, 'task')}
                                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold flex items-center shadow-2xs"
                                    >
                                      <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                                      Finalizar + Anexar PDF
                                    </button>
                                  )}

                                  <div className="flex items-center space-x-1.5 bg-neutral-100 px-2.5 py-1 rounded-xl border border-neutral-200">
                                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${assignee.avatarBg}`}>
                                      {assignee.initials}
                                    </span>
                                    <select
                                      value={task.assignedTo || 'luis_neto'}
                                      onChange={(e) => changeTaskAssignee(task.id, e.target.value)}
                                      className="text-xs font-bold text-neutral-800 bg-transparent outline-none cursor-pointer"
                                    >
                                      {activeTeamMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setOpenTaskCommentsId(isCommentsOpen ? null : task.id)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 flex items-center"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                    Notas ({commentCount})
                                  </button>

                                  <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="p-2 text-neutral-400 hover:text-red-600 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {isCommentsOpen && (
                                <div className="mt-3 ml-9 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                                  <div className="space-y-1.5">
                                    {(task.comments || []).map(c => (
                                      <div key={c.id} className="text-xs bg-white p-2 rounded-lg border border-neutral-200">
                                        <span className="font-bold text-amber-700">{c.authorName}: </span>
                                        <span className="text-neutral-700">{c.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={taskCommentInput}
                                      onChange={(e) => setTaskCommentInput(e.target.value)}
                                      placeholder={`Anotar na tarefa como ${currentStaff.name}...`}
                                      className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddTaskComment(task)}
                                      className="px-3 py-1.5 bg-neutral-950 text-amber-400 rounded-lg text-xs font-bold"
                                    >
                                      Salvar Nota
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'documentos' && (
                  /* =========================================================================
                     ABA DE SOLICITAÇÕES DOS CLIENTES (COM FINALIZAÇÃO E PUBLICAÇÃO DE PDF)
                     ========================================================================= */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-2xl font-extrabold text-neutral-900">Solicitações dos Clientes</h2>
                        <p className="text-sm text-neutral-500">
                          Demandas abertas pelos clientes no Portal (Férias, Rescisão, Cadastro de Empregados, Simples, etc.). Ao finalizar, publique o PDF no Mural da empresa.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddClientType(!showAddClientType)}
                        className="self-start sm:self-auto text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl flex items-center"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Criar Nova Opção de Solicitação
                      </button>
                    </div>

                    {showAddClientType && (
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="text"
                          value={newCustomClientType}
                          onChange={(e) => setNewCustomClientType(e.target.value)}
                          placeholder="Digite o novo tipo de solicitação disponível para clientes..."
                          className="flex-1 w-full px-3.5 py-2 bg-white border border-amber-400 rounded-xl text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCustomType('client', newCustomClientType)}
                          className="bg-neutral-950 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold shrink-0"
                        >
                          Adicionar
                        </button>
                      </div>
                    )}

                    {/* Registrar Atendimento / Solicitação em nome de um cliente */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                      <h3 className="text-base font-bold text-neutral-900 mb-4">Abrir Solicitação / Demanda de Cliente</h3>
                      <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            1. Tipo de Solicitação *
                          </label>
                          <select
                            value={newDoc.activityType}
                            onChange={(e) => setNewDoc({...newDoc, activityType: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white font-semibold outline-none"
                          >
                            {clientActivityOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            2. Empresa Cliente *
                          </label>
                          <select
                            required
                            value={newDoc.companyId}
                            onChange={(e) => setNewDoc({...newDoc, companyId: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white outline-none"
                          >
                            <option value="">Selecione a empresa...</option>
                            {companies.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                            3. Responsável no Escritório *
                          </label>
                          <select
                            value={newDoc.assignedTo}
                            onChange={(e) => setNewDoc({...newDoc, assignedTo: e.target.value})}
                            className="w-full px-3.5 py-2.5 border border-amber-400 bg-amber-50/50 rounded-xl text-sm font-bold outline-none"
                          >
                            {activeTeamMembers.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-9">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Detalhes / Instruções
                          </label>
                          <input
                            type="text"
                            value={newDoc.details}
                            onChange={(e) => setNewDoc({...newDoc, details: e.target.value})}
                            placeholder="Ex: Solicitação de documentos admissionais ou cálculo de rescisão..."
                            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <button
                            type="submit"
                            className="w-full bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center"
                          >
                            <Plus className="h-4 w-4 mr-1.5" /> Registrar Demanda
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Lista de Solicitações dos Clientes */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                      <div className="p-4 bg-neutral-950 text-amber-400 font-bold">
                        Solicitações Recebidas dos Clientes ({documents.length})
                      </div>
                      <div className="divide-y divide-neutral-100">
                        {documents.map(docItem => {
                          const isDocChatOpen = openDocCommentsId === docItem.id;
                          const commentsList = Array.isArray(docItem.comments) ? docItem.comments : [];
                          return (
                            <div key={docItem.id} className="p-4 hover:bg-neutral-50/60 space-y-3">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-neutral-950 bg-amber-400 px-2.5 py-0.5 rounded-md">
                                      🏢 {docItem.companyName}
                                    </span>
                                    <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                                      {docItem.category}
                                    </span>
                                  </div>
                                  <p className="font-bold text-sm text-neutral-900">{docItem.title}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {docItem.status !== 'Concluído' && (
                                    <button
                                      type="button"
                                      onClick={() => openFinishWithPdfModal(docItem, 'client_request')}
                                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold flex items-center shadow-2xs"
                                    >
                                      <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                                      Finalizar + Publicar PDF
                                    </button>
                                  )}

                                  <select
                                    value={docItem.assignedTo || 'anny_luize'}
                                    onChange={(e) => changeDocAssignee(docItem.id, e.target.value)}
                                    className="px-2.5 py-1.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none"
                                  >
                                    {activeTeamMembers.map(m => (
                                      <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                  </select>

                                  <button
                                    onClick={() => cycleDocStatus(docItem)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                                      docItem.status === 'Pendente'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : docItem.status === 'Concluído'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                    }`}
                                  >
                                    {docItem.status}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setOpenDocCommentsId(isDocChatOpen ? null : docItem.id)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-white text-neutral-700 border-neutral-200 flex items-center"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                    Mensagens ({commentsList.length})
                                  </button>

                                  <button
                                    onClick={() => deleteDocument(docItem.id)}
                                    className="p-2 text-neutral-400 hover:text-red-600 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {isDocChatOpen && (
                                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                                  <div className="space-y-1.5">
                                    {commentsList.map(c => (
                                      <div key={c.id} className="text-xs bg-white p-2 rounded-lg border border-neutral-200">
                                        <span className={`font-bold ${c.role === 'client' ? 'text-amber-700' : 'text-blue-700'}`}>
                                          {c.authorName}:{' '}
                                        </span>
                                        <span className="text-neutral-700">{c.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={docCommentInput}
                                      onChange={(e) => setDocCommentInput(e.target.value)}
                                      placeholder={`Responder cliente como ${currentStaff.name}...`}
                                      className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddDocComment(docItem, docCommentInput, false)}
                                      className="px-3 py-1.5 bg-neutral-950 text-amber-400 rounded-lg text-xs font-bold"
                                    >
                                      Responder
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'mural_pdfs' && (
                  /* =========================================================================
                     MURAL DE DOCUMENTOS (PDFS) SEPARADO POR EMPRESA, ANO E MÊS
                     ========================================================================= */
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-neutral-900">Mural de Documentos das Empresas (PDFs)</h2>
                        <p className="text-sm text-neutral-500">
                          Organizado por <strong>Empresa, Ano e Mês</strong>. Cada cliente visualiza exclusivamente o mural da sua própria empresa no Portal.
                        </p>
                      </div>
                    </div>

                    {/* Seletores Superiores: Empresa + Ano */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-7">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                            Filtrar por Empresa Cliente
                          </label>
                          <select
                            value={muralSelectedCompanyId}
                            onChange={(e) => setMuralSelectedCompanyId(e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                          >
                            <option value="ALL">🏢 Todas as Empresas Cadastradas ({companyPdfs.length} PDFs)</option>
                            {companies.map(c => (
                              <option key={c.id} value={c.id}>
                                🏢 {c.name} — CNPJ: {c.cnpj}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                            Ano de Competência
                          </label>
                          <div className="flex space-x-2">
                            {YEARS_LIST.map(year => (
                              <button
                                key={year}
                                onClick={() => setMuralSelectedYear(year)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  muralSelectedYear === year
                                    ? 'bg-neutral-950 text-amber-400 border-amber-500'
                                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pastas de Meses (Janeiro a Dezembro) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-neutral-100">
                        <button
                          onClick={() => setMuralSelectedMonth('ALL')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            muralSelectedMonth === 'ALL'
                              ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          <p className="text-xs font-bold">Ano Inteiro</p>
                          <p className="text-[10px] opacity-80">{muralSelectedYear}</p>
                        </button>
                        {MONTHS_LIST.map(m => {
                          const count = companyPdfs.filter(p => 
                            (muralSelectedCompanyId === 'ALL' || p.companyId === muralSelectedCompanyId) &&
                            p.year === muralSelectedYear &&
                            p.month === m.num
                          ).length;
                          const isSelected = muralSelectedMonth === m.num;
                          return (
                            <button
                              key={m.num}
                              onClick={() => setMuralSelectedMonth(m.num)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-neutral-950 text-amber-400 border-amber-500 font-bold'
                                  : count > 0
                                  ? 'bg-amber-50/60 text-neutral-900 border-amber-300'
                                  : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{m.name}</span>
                                {count > 0 && (
                                  <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                                    isSelected ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-950 text-amber-400'
                                  }`}>
                                    {count}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] opacity-75">{m.num}/{muralSelectedYear}</p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Arquivos PDF publicados */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                        {filteredOfficeMuralPdfs.map(pdf => (
                          <div key={pdf.id} className="p-4 rounded-2xl border border-neutral-200 hover:border-amber-500/60 bg-neutral-50/40 flex flex-col justify-between gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start space-x-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-950 text-amber-400">
                                      🏢 {pdf.companyName}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                      {getMonthLabel(pdf.month)}/{pdf.year}
                                    </span>
                                  </div>
                                  <p className="font-bold text-sm text-neutral-900">{pdf.title}</p>
                                  <p className="text-xs text-neutral-500 truncate">{pdf.fileName} • Publicado por {pdf.publishedBy}</p>
                                  {pdf.notes && (
                                    <p className="text-xs text-neutral-600 mt-1.5 bg-white p-2 rounded-lg border border-neutral-200">
                                      {pdf.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => deletePublishedPdf(pdf.id)}
                                className="text-neutral-400 hover:text-red-600 p-1"
                                title="Excluir PDF do mural"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200/70 text-xs">
                              <button
                                onClick={() => setPreviewPdfItem(pdf)}
                                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-lg font-bold flex items-center"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> Visualizar
                              </button>
                              <a
                                href={pdf.fileDataUrl}
                                download={pdf.fileName}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg font-bold flex items-center"
                              >
                                <Download className="h-3.5 w-3.5 mr-1" /> Baixar PDF
                              </a>
                            </div>
                          </div>
                        ))}
                        {filteredOfficeMuralPdfs.length === 0 && (
                          <div className="md:col-span-2 text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                            <FolderOpen className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-neutral-700">Nenhum PDF publicado para este filtro de Ano/Mês.</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              Para publicar, clique em <strong>"Finalizar + Anexar PDF"</strong> em qualquer Tarefa Interna ou Solicitação de Cliente.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'chat_individual' && (
                  /* =========================================================================
                     CHAT INTERNO INDIVIDUAL (1 PARA 1 ENTRE OS FUNCIONÁRIOS)
                     ========================================================================= */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-neutral-900">Chat Interno Individual (1 para 1)</h2>
                      <p className="text-sm text-neutral-500">
                        Conversas privadas separadas par a par. Você está logado como <strong className="text-amber-700">{currentStaff.name}</strong> — escolha abaixo com qual colega deseja conversar.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Coluna de Contatos Diretos */}
                      <div className="lg:col-span-4 space-y-3">
                        <div className="bg-neutral-950 text-white p-4 rounded-2xl border border-amber-500/30">
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                            Colegas do Escritório (Conversa Direta)
                          </p>
                          <div className="space-y-2.5">
                            {otherTeamMembers.map(colleague => {
                              const isSelected = selectedChatPartnerId === colleague.id;
                              const pairKey = getDirectChatKey(currentStaff.id, colleague.id);
                              const pairCount = directMessages.filter(m => m.conversationKey === pairKey).length;
                              return (
                                <button
                                  key={colleague.id}
                                  onClick={() => setSelectedChatPartnerId(colleague.id)}
                                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-md'
                                      : 'bg-neutral-900 text-white border-neutral-800 hover:border-amber-500/40'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center ${
                                      isSelected ? 'bg-neutral-950 text-amber-400' : colleague.avatarBg
                                    }`}>
                                      {colleague.initials}
                                    </span>
                                    <div>
                                      <p className="text-sm font-bold">{colleague.name}</p>
                                      <p className={`text-xs ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`}>{colleague.role}</p>
                                    </div>
                                  </div>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                    isSelected ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-amber-400'
                                  }`}>
                                    {pairCount} msg
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                          <p className="font-bold text-neutral-900 flex items-center">
                            <Lock className="h-3.5 w-3.5 mr-1.5 text-amber-600" /> Privacidade 1 para 1
                          </p>
                          <p>
                            As mensagens trocadas com <strong>{getMemberInfo(selectedChatPartnerId).name}</strong> ficam visíveis apenas na conversa entre vocês dois.
                          </p>
                        </div>
                      </div>

                      {/* Janela da Conversa Individual Selecionada */}
                      <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
                        <div className="p-4 bg-neutral-950 text-white border-b border-amber-500/30 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center ${getMemberInfo(selectedChatPartnerId).avatarBg}`}>
                              {getMemberInfo(selectedChatPartnerId).initials}
                            </span>
                            <div>
                              <h3 className="font-bold text-sm text-white">
                                Conversa Privada: {currentStaff.name} ↔ {getMemberInfo(selectedChatPartnerId).name}
                              </h3>
                              <p className="text-[11px] text-amber-400">{getMemberInfo(selectedChatPartnerId).role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-neutral-50">
                          {activeDirectConversation.map(msg => {
                            const isMe = msg.senderId === currentStaff.id;
                            return (
                              <div key={msg.id} className={`p-4 rounded-2xl border shadow-2xs flex items-start justify-between gap-3 ${
                                isMe ? 'bg-neutral-950 text-white border-amber-500/40 ml-12' : 'bg-white text-neutral-900 border-neutral-200 mr-12'
                              }`}>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-bold ${isMe ? 'text-amber-400' : 'text-blue-600'}`}>
                                      {msg.senderName}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{msg.text}</p>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {msg.companyName && (
                                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        🏢 {msg.companyName}
                                      </span>
                                    )}
                                    {msg.taskTitle && (
                                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-400/30">
                                        📌 {msg.taskTitle}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isMe && (
                                  <button
                                    onClick={() => deleteDirectMessage(msg.id)}
                                    className="text-neutral-500 hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {activeDirectConversation.length === 0 && (
                            <div className="text-center py-16 text-neutral-400 text-sm">
                              Envie a primeira mensagem direta para <strong>{getMemberInfo(selectedChatPartnerId).name}</strong>.
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleSendDirectMessage} className="p-4 bg-white border-t border-neutral-200 space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={directChatCompanyId}
                              onChange={(e) => setDirectChatCompanyId(e.target.value)}
                              className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs bg-neutral-50 outline-none"
                            >
                              <option value="">Vincular Empresa na mensagem (Opcional)</option>
                              {companies.map(c => (
                                <option key={c.id} value={c.id}>🏢 {c.name}</option>
                              ))}
                            </select>
                            <select
                              value={directChatTaskId}
                              onChange={(e) => setDirectChatTaskId(e.target.value)}
                              className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs bg-neutral-50 outline-none"
                            >
                              <option value="">Vincular Tarefa na mensagem (Opcional)</option>
                              {tasks.map(t => (
                                <option key={t.id} value={t.id}>📌 {t.title}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              value={directChatInput}
                              onChange={(e) => setDirectChatInput(e.target.value)}
                              placeholder={`Escrever mensagem privada para ${getMemberInfo(selectedChatPartnerId).name}...`}
                              className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <button
                              type="submit"
                              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shrink-0 shadow-xs"
                            >
                              <Send className="h-4 w-4 mr-1.5" /> Enviar
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'minha_conta' && (
                  /* =========================================================================
                     ABA: MINHA CONTA & GESTÃO DE ACESSOS DA EQUIPE (E-MAIL, USUÁRIO E SENHA)
                     ========================================================================= */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-neutral-900">Minha Conta & Acessos da Equipe</h2>
                      <p className="text-sm text-neutral-500">
                        Personalize seu e-mail de login, usuário e senha ou cadastre novos funcionários na equipe Pilotto Contábil.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Formulário para Alterar E-mail/Senha ou Cadastrar Novo Funcionário */}
                      <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100">
                          <div>
                            <h3 className="text-base font-bold text-neutral-900 flex items-center">
                              <KeyRound className="h-5 w-5 mr-2 text-amber-500" />
                              Configurar Credenciais de Acesso
                            </h3>
                            <p className="text-xs text-neutral-500">
                              As alterações ficam salvas imediatamente no banco de dados.
                            </p>
                          </div>
                          <div className="flex bg-neutral-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setSetupMode('update');
                                setSetupSelectedMemberId(currentStaff.id);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                setupMode === 'update' ? 'bg-neutral-950 text-amber-400' : 'text-neutral-600'
                              }`}
                            >
                              Editar Existente
                            </button>
                            <button
                              type="button"
                              onClick={() => setSetupMode('new')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                setupMode === 'new' ? 'bg-neutral-950 text-amber-400' : 'text-neutral-600'
                              }`}
                            >
                              + Novo Funcionário
                            </button>
                          </div>
                        </div>

                        <form onSubmit={handleSaveStaffCredentials} className="space-y-4">
                          {setupMode === 'update' && (
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                                Funcionário a Configurar
                              </label>
                              <select
                                value={setupSelectedMemberId}
                                onChange={(e) => setSetupSelectedMemberId(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold bg-amber-50/40 outline-none"
                              >
                                {activeTeamMembers.map(m => (
                                  <option key={m.id} value={m.id}>{m.name} — {m.email}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                                Nome Completo *
                              </label>
                              <input
                                type="text"
                                required
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                                Cargo / Departamento *
                              </label>
                              <input
                                type="text"
                                required
                                value={setupRole}
                                onChange={(e) => setSetupRole(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                                E-mail de Login *
                              </label>
                              <input
                                type="email"
                                required
                                value={setupEmail}
                                onChange={(e) => setSetupEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                                Usuário Curto (Para login rápido)
                              </label>
                              <input
                                type="text"
                                value={setupUsername}
                                onChange={(e) => setSetupUsername(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                                Nova Senha *
                              </label>
                              <input
                                type="password"
                                required
                                value={setupPassword}
                                onChange={(e) => setSetupPassword(e.target.value)}
                                placeholder="Digite a nova senha"
                                className="w-full px-3.5 py-2.5 border border-amber-400 bg-amber-50/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                                Confirmar Nova Senha *
                              </label>
                              <input
                                type="password"
                                required
                                value={setupConfirmPassword}
                                onChange={(e) => setSetupConfirmPassword(e.target.value)}
                                placeholder="Repita a nova senha"
                                className="w-full px-3.5 py-2.5 border border-amber-400 bg-amber-50/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Salvar Credenciais de Acesso
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Lista de Membros Ativos do Escritório */}
                      <div className="lg:col-span-5 bg-neutral-950 text-white rounded-2xl border border-amber-500/30 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                          <div>
                            <h3 className="font-bold text-base text-amber-400">Profissionais Cadastrados</h3>
                            <p className="text-xs text-neutral-400">Contas habilitadas para acessar o escritório</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-neutral-950">
                            {activeTeamMembers.length} ativos
                          </span>
                        </div>

                        <div className="space-y-3">
                          {activeTeamMembers.map(member => (
                            <div
                              key={member.id}
                              className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <span className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${member.avatarBg}`}>
                                  {member.initials}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white truncate">
                                    {member.name}
                                    {member.id === currentStaff.id && (
                                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-extrabold">
                                        VOCÊ
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-neutral-400 truncate">{member.role}</p>
                                  <p className="text-[11px] text-amber-400/90 truncate mt-0.5">
                                    Login: <strong>{member.email}</strong> (ou <strong>{member.username}</strong>)
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSetupMode('update');
                                  setSetupSelectedMemberId(member.id);
                                }}
                                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg text-xs font-bold shrink-0"
                              >
                                Editar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
