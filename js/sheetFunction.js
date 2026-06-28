// Garantir ids únicos para todos os inputs/checkboxes/circles e usar esses ids ao salvar/carregar
const circles = Array.from(document.querySelectorAll('.circle'));
const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));

const attrPairs = [
    { val: 'valFor', mod: 'modFor' },
    { val: 'valDes', mod: 'modDes' },
    { val: 'valCon', mod: 'modCon' },
    { val: 'valInt', mod: 'modInt' },
    { val: 'valSab', mod: 'modSab' },
    { val: 'valCar', mod: 'modCar' },
];

const classDetails = [
    {
        keyBytes: [0], nome: 'Bárbaro',
        racas: ['Humano', 'Elfo', 'Anão', 'Halfling'],
        hp_base: 8,
        dado_dano: 'd10',
        carga_base: 8,
        alinhamento: [
            { nome: 'Neutro', descricao: 'Se afastar de uma convenção do mundo civilizado.' },
            { nome: 'Caótico', descricao: 'Ensinar a alguém os modos de seu povo.' }
        ],
        movimentos_raciais: [
            { classe: 'Bárbaro', tipo: 'racial', nome: 'Forasteiro', descricao: "Você pode ser um elfo, anão, halfling ou humano, mas seu povo não é dessas redondezas. No início de cada sessão, o MJ lhe perguntará algo a respeito de sua terra natal, por que você foi embora ou o que deixou para trás. Se responder, marque XP." },
        ],
        movimentos_iniciais: [
            { classe: 'Bárbaro', tipo: 'inicial', nome: 'Apetite hercúleo', descricao: "Outras pessoas podem se contentar apenas com o gosto do vinho, o domínio sobre um servo ou ambos, mas você quer mais. Escolha dois apetites. Enquanto estiver perseguindo um de seus apetites, se realizar algum movimento, no lugar de rolar 2d6 você rola 1d6+1d8. Se o d6 apresentar o maior resultado do par, o MJ também irá introduzir uma complicação ou perigo que surge a partir de sua busca implacável.\n•	Pura destruição\n•	Poder sobre outras pessoas\n•	Prazeres mortais\n•	Conquista\n•	Riquezas e propriedades\n•	Fama e glória" },
            { nome: 'Controle da situação', descricao: "Você recebe +1 constante para seu último suspiro. Quando realizar o último suspiro, com <span class='badge'>7-9</span> você pode fazer uma oferta para a Morte em troca de sua vida. Se a Morte aceitar, você viverá de novo. Caso contrário, você morre." },
            { classe: 'Bárbaro', tipo: 'inicial', nome: 'Musculoso', descricao: "Quando portar uma arma, ela recebe os rótulos poderoso e grotesco." },
            { classe: 'Bárbaro', tipo: 'inicial', nome: 'O que você está esperando?', descricao: "Quando gritar um desafio para seus inimigos, role+CON. Com <span class='badge'>10+</span> eles passam a lhe tratar como a ameaça mais óbvia a ser enfrentada, ignorando os seus companheiros, e você recebe +2 de dano constante contra eles. Com <span class='badge'>7-9</span> ou tolos dentre eles) caem em suas provocações." },
            { classe: 'Bárbaro', tipo: 'inicial', nome: 'Armadura de Placas e portando aço', descricao: "Você ignora o rótulo desengonçada das armaduras que vestir.", exclusivo: true },
            { classe: 'Bárbaro', tipo: 'inicial', nome: 'Desinpedido e ileso', descricao: "Enquanto estiver abaixo de sua Carga, e não estiver usando armadura nem escudo, receba +1 de armadura.", exclusivo: true }
        ],

        movimentos_avancados_2_5: [
            { classe: 'Bárbaro', tipo: 'avançado', id: 10, nome: "Continuo faminto", descricao: "Escolha um apetite adicional." },
            { id: 11, nome: "Apetite por destruição", descricao: "Pegue um movimento da lista do guerreiro, bardo ou ladrão. Você não pode pegar os movimentos de multiclasse dessas classes." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 12, nome: "Meu amor por você é como um caminhão", descricao: "Quando realizar um feito de força, nomeie alguém presente que tenha ficado impressionado por ele, e receba +1 adiante para negociar com essa pessoa." },
            { id: 13, nome: "As melhores coisas da vida", descricao: "No final da sessão, se tiver esmagado seus inimigos, vê-los fugir diante de sua presença e ouvir os lamentos de seus parentes, marque XP." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 14, nome: "Grande viajante", descricao: "No final da sessão, se tiver esmagado seus inimigos, vê-los fugir diante de sua presença e ouvir os lamentos de seus parentes, marque XP." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 15, nome: "USURPADOR", descricao: "Quando se provar superior a uma pessoa no poder, receba +1 adiante contra seus seguidores, lacaios e puxa-sacos." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 16, nome: "KHAN DOS KHANS", descricao: "Seus lacaios sempre aceitam a satisfação gratuita de um apetite seu como pagamento." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 17, nome: "SANSÃO", descricao: "Você pode aceitar uma debilidade para imediatamente se livrar de qualquer restrição física ou mental." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 18, nome: "ESMAGAR!", descricao: "Quando matar e pilhar, com <spam class='badge'>12+</spam> cause seu dano e escolha algum objeto físico que seu alvo possua (uma arma, sua posição, um membro): ele perde o objeto escolhido." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 19, nome: "FOME INDESTRUTÍVEL", descricao: "Quando for receber dano, você pode optar por receber -1 constante até saciar um de seus apetites no lugar do dano. Você não poderá escolher esta opção enquanto estiver com essa penalidade ativa." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 20, nome: "PERCEPÇÃO DE PONTOS FRACOS ", descricao: "Quando discernir realidades, acrescente “o que aqui é fraco ou vulnerável?” à lista de perguntas que você pode fazer." },
            { classe: 'Bárbaro', tipo: 'avançado', id: 21, nome: "SEMPRE EM FRENTE", descricao: "Quando desafiar o perigo causado por algum movimento (como cair de uma ponte estreita ou passar correndo por um guarda armado), receba +1." },
        ],
        movimentos_avancados_6_10: [
            { classe: 'Bárbaro', tipo: 'avançado', requer: "Apetite Por Destruição", id: 13, nome: "Um ótimo dia para morrer", descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 14, nome: "Mate a todos", descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 15, nome: "Grito de guerra", descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 16, nome: 'Marca de poder', descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 17, nome: 'Mais! Sempre Mais!', descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 18, nome: 'Aquele que bate a porta', descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 19, nome: 'Desconfiança Saudável', descricao: "" },
            { classe: 'Bárbaro', tipo: 'avançado', id: 20, nome: 'Pelo Deus do Sangue', descricao: "" }
        ]
    },
    {
        keyBytes: [1, 2, 3], nome: 'Bardo',
        racas: ['Humano', 'Elfo'],
        hp_base: 6,
        dado_dano: 'd6',
        carga_base: 9,
        alinhamento: [
            { nome: 'Bom', descricao: 'Executar sua arte para ajudar alguém.', exclusivo: true },
            { nome: 'Neutro', descricao: 'Evitar um conflito ou desfaça uma situação tensa.', exclusivo: true },
            { nome: 'Caótico', descricao: 'Estimular outros a realizarem uma ação decisiva que seja significativa e mal planejada.', exclusivo: true }
        ],
        movimentos_raciais: [
            { classe: 'Bardo', tipo: 'racial', nome: 'Humano', descricao: "Quando entrar pela primeira vez em um local civilizado, alguém que respeita os costumes de hospitalidade aos menestréis irá recebê-lo como seu convidado." },
            { classe: 'Bardo', tipo: 'racial', nome: 'Elfo', descricao: "Quando entrar em um local importante (decisão do jogador), você pode pedir ao MJ que lhe conte um fato qualquer a respeito da história daquele lugar." }
        ],
        movimentos_iniciais: [
            { classe: 'Bardo', tipo: 'inicial', nome: 'Conhecimento de Bardo', descricao: "Escolha uma área de especialização:\n•	Magias e Feitiços;\n•	Os Mortos e os Mortos-Vivos;\n•	Grandes Histórias do Mundo Conhecido;\n•	Um Bestiário de Criaturas Incomuns;\n•	As Esferas Planares;\n•	Lendas de Heróis do Passado;\n•	Os Deuses e seus Servos;Quando encontrar pela primeira vez uma criatura, local ou item importante (decisão do jogador) que esteja ligado ao seu conhecimento de bardo, você pode fazer uma pergunta qualquer ao MJ a respeito daquilo, que ele deve responder honestamente. O MJ pode lhe perguntar qual foi a lenda, canção ou fábula na qual você ouviu tal informação." },
            { classe: 'Bardo', tipo: 'inicial', nome: 'Arte Arcana', descricao: "Quando tecer um feitiço básico a partir de uma performance, escolha um aliado e um efeito:\n•	Curar 1d8 PV;\n•	+1d4 adiante para o dano;\n•	Remover um encantamento que esteja afetando sua mente;\n•	Na próxima vez que alguém Ajudar o alvo, ele receberá +2, e não +1;E depois role+CAR. Com <span class='badge'>10+</span>, o aliado recebe o efeito selecionado. Com <span class='badge'>7-9</span>, sua magia funciona, mas você atrai atenção indesejável, ou a sua magia reverbera para outros alvos à escolha do MJ, afetando-os também." },
            { classe: 'Bardo', tipo: 'inicial', nome: 'Charmoso e receptivo', descricao: "Quando conversar francamente com alguém, você pode fazer ao seu jogador uma pergunta da lista abaixo, que deve ser respondida com honestidade. Aquele jogador então poderá também lhe fazer uma pergunta da lista abaixo (que você também precisa responder honestamente):\n•	A quem você serve?\n•	O que você quer que eu faça?\n•	Como faço para conseguir que você <input type=text class='spell'>?\n•	O que você realmente está sentindo agora?\n•	O que você mais deseja?" },
            { classe: 'Bardo', tipo: 'inicial', nome: 'Um Porto na Tempestade', descricao: "Quando retornar a um local civilizado que já tenha visitado previamente, diga ao MJ quando esteve aqui pela última vez. Ele lhe responderá quais foram as mudanças ocorridas desde aquela época." }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Bardo', tipo: 'avançado', id: 21, nome: 'Canção de Cura', descricao: 'Quando curar usando arte arcana, cure +1d8 de dano.' },
            { classe: 'Bardo', tipo: 'avançado', id: 22, nome: 'Cacofonia Violenta', descricao: 'Quando conceder bônus para o dano usando arte arcana, conceda +1d4 de dano extra.' },
            { classe: 'Bardo', tipo: 'avançado', id: 23, nome: 'Volume máximo', descricao: 'Quando desencadear uma performance ensandecida (um solo de flauta inflamado, uma explosão de tambores de bronze, uma dança interpretativa confusa), escolha um alvo capaz de ouvi-lo e role+CAR. Com <span class="badge">10+</span>, aliado mais próximo. Com <span class="badge">7-9</span>, o alvo fica confuso e ataca seu , o alvo ainda ataca seu aliado mais próximo, mas você atrai sua atenção e sua ira.' },
            { classe: 'Bardo', tipo: 'avançado', id: 24, nome: 'Grito metálico', descricao: 'Quando gritar com muita força ou tocar uma nota devastadora, escolha um alvo e role+CON. Com <span class="badge">10+</span>, o alvo recebe 1d10 de dano e é ensurdecido por alguns minutos. Com <span class="badge">7-9</span>, você ainda causa dano ao seu alvo, mas perde o controle, e o MJ escolhe um alvo adicional que esteja próximo.' },
            { classe: 'Bardo', tipo: 'avançado', id: 25, nome: 'Uma Pequena ajuda de meus amigos', descricao: 'Quando conseguir ajudar alguém, receba +1 adiante também.' },
            { classe: 'Bardo', tipo: 'avançado', id: 26, nome: 'Tons Sobrenaturais', descricao: 'Sua arte arcana é poderosa, permitindo que escolha dois efeitos no lugar de apenas um.' },
            { classe: 'Bardo', tipo: 'avançado', id: 27, nome: 'Aparo do Duelista', descricao: 'Quando matar e pilhar, receba +1 adiante de armadura.' },
            { classe: 'Bardo', tipo: 'avançado', id: 28, nome: 'Mistificar', descricao: 'Quando negociar com um alvo, caso obtenha <span class="badge">7+</span>, receba também +1 adiante contra ele.' },
            { classe: 'Bardo', tipo: 'avançado', id: 29, nome: 'Amador em Multiclasse', descricao: 'Escolha e adquira um movimento de outra classe. Trate seu nível como se fosse nível -1 no momento da escolha.' },
            { classe: 'Bardo', tipo: 'avançado', id: 30, nome: 'Iniciado em Multiclasse', descricao: 'Escolha e adquira um movimento de outra classe. Trate seu nível como se fosse nível -1 no momento da escolha.' }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Bardo', tipo: 'avançado', substitui: "Canção de Cura", id: 31, nome: 'Refrão da cura', descricao: 'Quando curar usando arte arcana, cure +2d8 de dano.' },
            { classe: 'Bardo', tipo: 'avançado', substitui: "Cacofonia Violenta", id: 32, nome: 'Explosão sonora violenta', descricao: 'Quando conceder bônus para o dano usando arte arcana, conceda +2d4 de dano extra.' },
            { classe: 'Bardo', tipo: 'avançado', id: 33, nome: 'Rosto Inesquecível', descricao: 'Quando encontrar alguém com quem já tenha se encontrado anteriormente (decisão do jogador) após terem passado algum tempo sem se ver, receba +1 adiante contra essa pessoa.' },
            { classe: 'Bardo', tipo: 'avançado', id: 34, nome: 'Reputação', descricao: 'Quando encontrar pela primeira vez pessoas que já tenham ouvido canções a seu respeito, role+CAR. Com <span class="badge">10+</span>, diga ao MJ duas coisas que elas saberiam a seu respeito. Com <span class="badge">7-9</span>, diga ao MJ uma coisa, e ele dirá outra.' },
            { classe: 'Bardo', tipo: 'avançado', substitui: "Tons Sobrenaturais", id: 35, nome: 'Acorde Sobrenatural', descricao: 'Quando usar arte arcana, escolha dois efeitos no lugar de apenas um. Escolha também um desses dois efeitos para ser aplicado em dobro.' },
            { classe: 'Bardo', tipo: 'avançado', id: 36, nome: 'Ouvido bom para magia', descricao: 'Quando ouvir um inimigo conjurar uma magia, o MJ lhe dirá qual é o nome da magia e seus efeitos. Receba +1 adiante quando agir de acordo com essas informações.' },
            { classe: 'Bardo', tipo: 'avançado', id: 37, nome: 'Desleal', descricao: 'Quando for charmoso(a) e receptivo(a), você também pode perguntar “Como você seria vulnerável a mim?”. Seu alvo não pode lhe fazer esta pergunta.' },
            { classe: 'Bardo', tipo: 'avançado', substitui: "Aparo do Duelista", id: 38, nome: 'Bloqueio do Duelista', descricao: 'Quando matar e pilhar, receba +2 adiante de armadura.' },
            { classe: 'Bardo', tipo: 'avançado', id: 39, nome: 'Passar a perna', descricao: 'Quando negociar com um alvo, com <span class="badge">7+</span>, receba também +1 adiante contra ele e faça ao seu jogador uma pergunta que deve ser respondida honestamente.' },
            { classe: 'Bardo', tipo: 'avançado', id: 40, nome: 'Mestre em Multiclasse', descricao: 'Escolha e adquira um movimento de outra classe. Trate seu nível como se fosse nível -1  no momento da escolha.' }
        ],
    },
    {
        keyBytes: [4, 5], nome: 'Clérigo',
        racas: ['Humano', 'Anão'],
        hp_base: 8,
        dado_dano: 'd6',
        carga_base: 10,
        alinhamento: [
            { nome: 'Bom', descricao: 'Colocar-se em perigo para curar outra pessoa.' },
            { nome: 'Ordeiro', descricao: 'Colocar-se em perigo seguindo os preceitos de sua igreja ou deus.' },
            { nome: 'Mal', descricao: 'Prejudicar outra pessoa para provar a superioridade de sua igreja ou deus.' }
        ],
        movimentos_raciais: [
            { classe: 'Clérigo', nome: 'Humano', descricao: "" },
            { classe: 'Clérigo', nome: 'Anão', descricao: "" }
        ],
        movimentos_iniciais: [
            { classe: 'Clérigo', nome: 'Divindade', descricao: "" },
            { classe: 'Clérigo', nome: 'Comungar', descricao: "" },
            { classe: 'Clérigo', nome: 'Conjurar uma Magia', descricao: "" }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Clérigo', id: 41, nome: 'Escolhido', descricao: '' },
            { classe: 'Clérigo', id: 42, nome: 'Revigorar', descricao: '' },
            { classe: 'Clérigo', id: 43, nome: 'A Balança da Vida e da Morte', descricao: '' },
            { classe: 'Clérigo', id: 44, nome: 'Serenidade', descricao: '' },
            { classe: 'Clérigo', id: 45, nome: 'Primeiros Socorros', descricao: '' },
            { classe: 'Clérigo', id: 46, nome: 'Intervenção Divina', descricao: '' },
            { classe: 'Clérigo', id: 47, nome: 'Penitente', descricao: '' },
            { classe: 'Clérigo', id: 48, nome: 'Fortalecer', descricao: '' },
            { classe: 'Clérigo', id: 49, nome: 'Prece por Orientação', descricao: '' },
            { classe: 'Clérigo', id: 50, nome: 'Proteção Divina', descricao: '' },
            { classe: 'Clérigo', id: 51, nome: 'Curandeiro Devotado', descricao: '' }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Clérigo', id: 52, nome: 'Ungido', descricao: '' },
            { classe: 'Clérigo', id: 53, nome: 'Apoteose', descricao: '' },
            { classe: 'Clérigo', id: 54, nome: 'Ceifador', descricao: '' },
            { classe: 'Clérigo', id: 55, nome: 'Providência', descricao: '' },
            { classe: 'Clérigo', id: 56, nome: 'Primeiros Socorros Maior', descricao: '' },
            { classe: 'Clérigo', id: 57, nome: 'Invencibilidade Divina', descricao: '' },
            { classe: 'Clérigo', id: 58, nome: 'Mártir', descricao: '' },
            { classe: 'Clérigo', id: 59, nome: 'Armadura Divina', descricao: '' },
            { classe: 'Clérigo', id: 60, nome: 'Fortalecimento Maior', descricao: '' },
            { classe: 'Clérigo', id: 61, nome: 'Diletante Multiclasse', descricao: '' }
        ],
        spell_list: [
            { nome: "Luz", level: 0, school: "Truque", continuo: false, descricao: "Um item tocado por você brilha com luz arcana, com a mesma intensidade de uma tocha. Essa luz não emite calor ou som e nem precisa de combustível para queimar, mas funciona como uma tocha comum para todos os outros efeitos. Você possui total controle sobre a cor da luz. O feitiço dura enquanto o item estiver em sua presença." },
            { nome: "Santificar", level: 0, school: "", continuo: false, descricao: "Qualquer comida ou água que estiver em suas mãos enquanto conjura este feitiço será consagrada por sua divindade. Além de se tornar sagrada ou profana, a substância afetada é purificada de qualquer resíduo mundano." },
            { nome: "Guia ", level: 0, school: "", continuo: false, descricao: "O símbolo da sua divindade surge à sua frente e aponta na direção ou curso de ação que seu deus gostaria que você tomasse, desaparecendo logo em seguida. Esta mensagem é passada apenas através de movimentos – a comunicação permitida por este feitiço é extremamente limitada." },
            { nome: "Bênção", level: 1, school: "", continuo: true, descricao: "Sua divindade sorri para um combatente à sua escolha, que receberá +1 constante enquanto a batalha continuar e ele permanecer de pé lutando. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Curar Ferimentos Leves", level: 1, school: "", continuo: false, descricao: "Sob seu toque, ferimentos se cicatrizam e ossos deixam de doer. Cure 1d8 de dano em um aliado que você tocar." },
            { nome: "Detectar Alinhamento", level: 1, school: "", continuo: true, descricao: "Quando conjurar esta magia, escolha um alinhamento: Bom, Mal, Ordeiro ou Caótico. Um de seus sentidos se torna momentaneamente capaz de detectar aquele alinhamento. O MJ lhe indicará quem ou o que pertence ao alinhamento escolhido." },
            { nome: "Arma Mágica", level: 1, school: "", continuo: true, descricao: "A arma que estiver em suas mãos no momento em que conjurar este feitiço causa +1d4 de dano até que ele seja desfeito. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Santuário", level: 1, school: "", continuo: true, descricao: "Enquanto conjura este feitiço, você caminha ao redor de uma área, demarcando seu perímetro e consagrando-a à sua divindade. Enquanto permanecer dentro da área, você será alertado de qualquer ação maliciosa que ocorrer ali dentro (incluindo uma criatura que entre no perímetro com intenções malignas). Qualquer pessoa curada dentro de um santuário recebe +1d4 PV" },
            { nome: "Falar com os Mortos", level: 1, school: "", continuo: true, descricao: "Um cadáver dialoga rapidamente com você, respondendo a até três perguntas com todo o conhecimento que ele tinha em vida, e aquele que adquiriu após a morte." },
            { nome: "Reanimar os Mortos", level: 3, continuo: true, descricao: "Você invoca um espírito faminto para que ele possua um corpo recém falecido e torne-se seu servo. Isso cria um zumbi que segue suas ordens utilizando ao máximo suas capacidades limitadas. Trate o zumbi como se fosse um personagem, mas podendo realizar apenas movimentos básicos. Ele possui um modificador de +1 em todas as características e 1 PV. Ele recebe também 1d4 das características abaixo:\n•	O zumbi é talentoso. Uma de suas características possui um modificador de +2.\n•	O zumbi é durável. Ele recebe +2 PV para cada nível de seu criador.\n•	O zumbi possui um cérebro que ainda funciona, e é capaz de completar tarefas complexas.\n•	O zumbi não aparenta estar morto, pelo menos por um ou dois dias. O zumbi persiste até que seja destruído, recebendo uma quantidade de dano superior aos seus PV, ou até que você opte por encerrar o feitiço. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Curar Ferimentos Moderados", level: 3, continuo: false, descricao: "Você estanca sangramentos e conserta ossos quebrados através de magia. Cure 2d8 de dano em um aliado que você tocar." },
            { nome: "Escuridão", level: 3, continuo: true, descricao: "Escolha uma área que você possa enxergar: ela se enche com sombras e escuridão sobrenatural. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Ressurreição", level: 3, continuo: false, descricao: "Diga ao MJ que você deseja ressuscitar um cadáver cuja alma ainda não tenha abandonado este mundo completamente. A ressurreição é sempre possível, mas o MJ lhe pedirá para cumprir uma ou mais (provavelmente todas) das condições abaixo:\n•	O processo irá demorar dias/semanas/meses\n•	Você precisa conseguir a ajuda de __________\n•	Custará muito dinheiro\n•	Você precisará sacrificar __________ para fazê-lo\nO MJ pode, de acordo com as circunstâncias, permitir que um cadáver seja ressuscitado imediatamente, e as condições impostas devem ser cumpridas para que isso seja permanente, ou ele pode exigir que as condições sejam cumpridas previamente." },
            { nome: "Prender Pessoa", level: 3, continuo: false, descricao: "Escolha uma pessoa que você possa enxergar. Até que você conjure um feitiço ou abandone sua presença, ela não poderá realizar qualquer ação a" },
            { nome: "Revelação", level: 5, continuo: false, descricao: "Sua divindade responde às suas preces durante um momento de perfeita compreensão. O MJ irá iluminar a situação atual. Quando agir baseado nas informações que lhe forem dadas, receba +1 adiante." },
            { nome: "Curar Ferimentos Críticos", level: 5, continuo: false, descricao: "Cure 3d8 de dano em um aliado que você tocar." },
            { nome: "Adivinhação", level: 5, continuo: false, descricao: "Nomeie uma pessoa, local ou objeto a respeito do qual queira obter informações. Sua divindade lhe mostrará o alvo, tão claramente quanto seria se você estivesse em sua presença." },
            { nome: "Contágio", level: 5, continuo: true, descricao: "Escolha uma criatura que você possa enxergar. Enquanto este feitiço permanecer ativo, o alvo sofre de uma doença à sua escolha. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Palavras dos Silenciosos", level: 5, continuo: false, descricao: "Com um simples toque, você se torna capaz de conversar com os espíritos presentes no interior de todas as coisas. O objeto inanimado que você tocar lhe responde até três perguntas, no máximo de sua capacidade." },
            { nome: "Visão Verdadeira", level: 5, continuo: true, descricao: "Sua visão se abre para a verdadeira natureza de tudo o que estiver enxergando, atravessando ilusões e encontrando coisas ocultas. O MJ lhe descreverá o local, ignorando todas as ilusões e falsificações, sejam elas mágicas ou não. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Aprisionar Alma", level: 5, continuo: false, descricao: "Você aprisiona a alma de uma criatura agonizante em uma gema. A criatura estará ciente de seu aprisionamento, mas ainda pode ser manipulada através de feitiços, negociação e outros efeitos. Todos os movimentos realizados contra ela receberão +1. Você pode libertar a alma a qualquer momento, mas ela jamais poderá ser capturada novamente." },
            { nome: "Palavra de Retorno", level: 7, continuo: false, descricao: "Escolha uma palavra. Quando pronunciá-la pela primeira vez após conjurar este feitiço, você e qualquer aliado que o estiver tocando no momento da conjuração serão imediatamente transportados para o local onde este feitiço foi conjurado. É possível manter apenas uma única localidade: conjurar Palavra de Retorno novamente antes de pronunciar a palavra substitui o feitiço anterior." },
            { nome: "Restauração", level: 7, continuo: false, descricao: "Ao tocar um aliado, ele é curado de uma quantidade de dano igual ao seu próprio valor máximo de PV." },
            { nome: "Destruição", level: 7, continuo: false, descricao: "Toque um inimigo e atinja-o com fúria divina – cause 2d8 de dano a ele e 1d6 de dano a você mesmo. Esses danos ignoram armaduras." },
            { nome: "Amputar", level: 7, continuo: true, descricao: "Escolha um membro do alvo, como um braço, um tentáculo ou uma asa – ele será magicamente separado de seu corpo, sem causar danos, mas provocando uma dor considerável. A perda do membro pode, por exemplo, impedir uma criatura alada de voar, ou um touro de perfurá-lo com seus chifres. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Sinal da Morte", level: 7, continuo: false, descricao: "Escolha uma criatura cujo nome verdadeiro você conheça. Este feitiço cria runas permanentes em uma superfície alvo, que matarão aquela criatura caso ela as leia." },
            { nome: "Controlar o Clima", level: 7, continuo: false, descricao: "Faça uma prece pedindo por chuva – ou sol, ou vento, ou neve. Dentro de aproximadamente um dia, seu deus irá respondê-lo, alterando o clima conforme seu pedido durante alguns dias." },
            { nome: "Tempestade da Vingança", level: 9, continuo: false, descricao: "Sua divindade faz com que um clima sobrenatural à sua escolha surja. Chuva de sangue ou de ácido, nuvens de almas, ventos que podem levar prédios, ou qualquer outro tipo de clima que você consiga imaginar: peça e ele virá." },
            { nome: "Reparos", level: 9, continuo: false, descricao: "Escolha um evento ocorrido no passado de seu alvo. Todos os efeitos daquele evento, incluindo danos, venenos, doenças e efeitos mágicos são imediatamente encerrados e reparados. PV e doenças são curados, venenos neutralizados, efeitos mágicos cancelados." },
            { nome: "Presença Divina", level: 9, continuo: true, descricao: "Todas as criaturas são obrigadas a pedir sua permissão para permanecerem em sua presença, e você deve concedê-la em voz alta. Qualquer criatura sem a sua permissão sofrerá 1d10 de dano extra sempre que sofrer dano em sua presença. Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Consumir Morte-Vida", level: 9, continuo: false, descricao: "Um morto-vivo sem mente que for tocado por você será imediatamente destruído, e sua energia necromântica será utilizada para curá-lo ou ao próximo aliado que você tocar por uma quantidade de Pontos de Vida igual aos PV que a criatura possuía antes de ser destruída." },
            { nome: "Praga", level: 9, continuo: true, descricao: "Nomeie uma cidade, aldeia, acampamento ou outro local onde vivam pessoas. Enquanto este feitiço permanecer ativo, aquele lugar será tomado por uma praga apropriada aos domínios de sua divindade (gafanhotos, morte do primogênito, etc.). Enquanto este feitiço estiver ativo, você recebe -1 para conjurar feitiços." },
        ]
    },
    {
        keyBytes: [6, 7, 8], nome: 'Druida',
        racas: ['Humano', 'Elfo', 'Halfling'],
        hp_base: 6,
        dado_dano: 'd6',
        carga_base: 6,
        alinhamento: [
            { nome: '', descricao: '' },
            { nome: '', descricao: '' },
            { nome: '', descricao: '' }
        ],
        movimentos_raciais: [
            { classe: 'Druida', tipo: "racial", nome: 'Humano', descricao: "" },
            { classe: 'Druida', tipo: "racial", nome: 'Elfo', descricao: "" },
            { classe: 'Druida', tipo: "racial", nome: 'Halfling', descricao: "" }],
        movimentos_iniciais: [
            { classe: 'Druida', tipo: "inicial", nome: 'Nascido da Terra', descricao: '' },
            { classe: 'Druida', tipo: "inicial", nome: 'Sustentado pela Natureza', descricao: '' },
            { classe: 'Druida', tipo: "inicial", nome: 'Língua dos Espíritos', descricao: '' },
            { classe: 'Druida', tipo: "inicial", nome: 'Metamorfo', descricao: '' },
            { classe: 'Druida', tipo: "inicial", nome: 'Essência Estudada', descricao: '' }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Druida', id: 62, nome: 'Irmão do Caçador', descricao: '' },
            { classe: 'Druida', id: 63, nome: 'Vermelho de Dente e Garra', descricao: '' },
            { classe: 'Druida', id: 64, nome: 'Comunhão dos Sussurros', descricao: '' },
            { classe: 'Druida', id: 65, nome: 'Pele de Casca', descricao: '' },
            { classe: 'Druida', id: 66, nome: 'Olhos do Tigre', descricao: '' },
            { classe: 'Druida', id: 67, nome: 'Mudar de Pele', descricao: '' },
            { classe: 'Druida', id: 68, nome: 'Falador de Coisas', descricao: '' },
            { classe: 'Druida', id: 69, nome: 'Moldador de Formas', descricao: '' },
            { classe: 'Druida', id: 70, nome: 'Domínio Elemental', descricao: '' },
            { classe: 'Druida', id: 71, nome: 'Equilíbrio', descricao: '' }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Druida', id: 72, nome: 'Abraçando Forma Nenhuma', descricao: '' },
            { classe: 'Druida', id: 73, nome: 'Dança do Doppelgänger', descricao: '' },
            { classe: 'Druida', id: 74, nome: 'Sangue e Trovão', descricao: '' },
            { classe: 'Druida', id: 75, nome: 'Sono do Druida', descricao: '' },
            { classe: 'Druida', id: 76, nome: 'Falador do Mundo', descricao: '' },
            { classe: 'Druida', id: 77, nome: 'Irmã da Perseguidora', descricao: '' },
            { classe: 'Druida', id: 78, nome: 'Escultor de Formas', descricao: '' },
            { classe: 'Druida', id: 79, nome: 'Quimera', descricao: '' },
            { classe: 'Druida', id: 80, nome: 'Tecelão do Clima', descricao: '' }
        ],
    },
    {
        keyBytes: [9, 10, 11], nome: 'Guerreiro',
        racas: ['Humano', 'Elfo', 'Anão'],
        hp_base: 10,
        dado_dano: 'd10',
        carga_base: 12,
        alinhamento: [
            { nome: 'Bom', descricao: 'Defender aqueles mais fracos que você.' },
            { nome: 'Neutro', descricao: 'Derrotar um adversário à sua altura.' },
            { nome: 'Mal', descricao: 'Causar sofrimento e destruição.' }
        ],
        movimentos_raciais: [
            { classe: 'Guerreiro', tipo: "racial", nome: 'Humano', descricao: "" },
            { classe: 'Guerreiro', tipo: "racial", nome: 'Elfo', descricao: "" },
            { classe: 'Guerreiro', tipo: "racial", nome: 'Anão', descricao: "" }],
        movimentos_iniciais: [
            { classe: 'Guerreiro', tipo: "inicial", nome: 'Arma Assinatura', descricao: "" },
            { classe: 'Guerreiro', tipo: "inicial", nome: 'Dobrar Barras, Erguer Portões', descricao: "" },
            { classe: 'Guerreiro', tipo: "inicial", nome: 'Blindado', descricao: "" }],
        movimentos_avancados_2_5: [
            { classe: 'Guerreiro', tipo: 'avançado', id: 81, nome: 'Sede de Sangue', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 82, nome: 'Armadureiro', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 83, nome: 'Ferrão Aprimorado', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 84, nome: 'Herança', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 85, nome: 'Tem Cheiro de Sangue', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 86, nome: 'Ferreiro', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 87, nome: 'Olho Mau', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 88, nome: 'Temporada de Caça', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 89, nome: 'Interrogador', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 90, nome: 'Talento para Armas', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 91, nome: 'Superioridade', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 92, nome: 'Multiclasse Diletante', descricao: "" }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Guerreiro', tipo: 'avançado', id: 93, nome: 'Sanguinário', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 94, nome: 'Mestre da Armadura', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 95, nome: 'Ferrão Perfeito', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 96, nome: 'Legado', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 97, nome: 'Gosto de Sangue', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 98, nome: 'Ferreiro Mestre', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 99, nome: 'Olhos da Morte', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 100, nome: 'Caçador Implacável', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 101, nome: 'Mestre Interrogador', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 102, nome: 'Especialista em Armas', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 103, nome: 'Supremacia', descricao: "" },
            { classe: 'Guerreiro', tipo: 'avançado', id: 104, nome: 'Mestre Multiclasse', descricao: "" }
        ],
    },
    {
        keyBytes: [12, 13, 14], nome: 'Imolador',
        racas: ['Humano', 'Elfo', 'Anão'],
        hp_base: 10,
        dado_dano: 'd8',
        carga_base: 9,
        movimentos_raciais: [
            { classe: 'Imolador', tipo: "racial", nome: 'Humano', descricao: "" },
            { classe: 'Imolador', tipo: "racial", nome: 'Elfo', descricao: "" },
            { classe: 'Imolador', tipo: "racial", nome: 'Anão', descricao: "" }
        ],
        movimentos_iniciais: [
            { classe: 'Imolador', tipo: "inicial", nome: 'Consumido pelo Fogo', descricao: "" },
            { classe: 'Imolador', tipo: "inicial", nome: 'Invocar Chamas', descricao: "" },
            { classe: 'Imolador', tipo: "inicial", nome: 'Zelo Fanático', descricao: "" }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Imolador', tipo: 'avançado', id: 105, nome: 'Queimadura Controlada', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 106, nome: 'Juramento de Cinzas', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 107, nome: 'Fogo Purificador', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 108, nome: 'Forma de Chama', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 109, nome: 'Incendiário', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 110, nome: 'Marca do Fogo', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 111, nome: 'Alimentar as Chamas', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 112, nome: 'Fogo Interior', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 113, nome: 'Arauto da Brasa', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 114, nome: 'Diletante Multiclasse', descricao: "" }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Imolador', tipo: 'avançado', id: 115, nome: 'Inferno Controlado', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 116, nome: 'Juramento das Brasas Eternas', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 117, nome: 'Purificação Absoluta', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 118, nome: 'Avatar das Chamas', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 119, nome: 'Mestre Incendiário', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 120, nome: 'Marca Ardente', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 121, nome: 'Fornalha Viva', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 122, nome: 'Coração de Fogo', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 123, nome: 'Senhor das Cinzas', descricao: "" },
            { classe: 'Imolador', tipo: 'avançado', id: 124, nome: 'Mestre Multiclasse', descricao: "" }
        ],
    },
    {
        keyBytes: [15], nome: 'Paladino',
        racas: ['Humano'],
        hp_base: 10,
        dado_dano: 'd10',
        carga_base: 12,
        alinhamento: [
            { nome: 'Ordeiro', descricao: "Negar misericórdia a um criminoso ou infiel." },
            { nome: 'Bom', descricao: "Colocar-se em perigo para proteger alguém mais fraco." },
        ],
        movimentos_raciais: [
            { classe: 'Paladino', tipo: "racial", nome: 'Humano', descricao: "Quando fizer uma oração, pedindo à sua divindade que o guie, mesmo que por um momento, e perguntar “O que é maligno aqui?”, o MJ lhe responderá honestamente." }
        ],
        movimentos_iniciais: [
            { classe: 'Paladino', tipo: "inicial", nome: 'Busca', descricao: "" },
            { classe: 'Paladino', tipo: "inicial", nome: 'Eu Sou a Lei', descricao: "" },
            { classe: 'Paladino', tipo: "inicial", nome: 'Armadura Completa', descricao: "" },
            { classe: 'Paladino', tipo: "inicial", nome: 'Braços Benditos', descricao: "" }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Paladino', tipo: 'avançado', id: 125, nome: 'Voz de Autoridade', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 126, nome: 'Hospitaleiro', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 127, nome: 'Exterminador', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 128, nome: 'Sangue e Aço', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 129, nome: 'Olhos para o Mal', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 130, nome: 'Estabelecer Ordem', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 131, nome: 'Protegido', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 132, nome: 'Liderança', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 133, nome: 'Apóstolo', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 134, nome: 'Prova de Fé', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 135, nome: 'Imposição das Mãos', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 136, nome: 'Diletante Multiclasse', descricao: "" }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Paladino', tipo: 'avançado', id: 137, nome: 'Divina Autoridade', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 138, nome: 'Perfeição Hospitaleira', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 139, nome: 'Exterminador Maior', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 140, nome: 'Sangue e Fogo', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 141, nome: 'Visão Sagrada', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 142, nome: 'Perfeita Ordem', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 143, nome: 'Fortaleza', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 144, nome: 'Grande Liderança', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 145, nome: 'Messias', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 146, nome: 'Fé Inabalável', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 147, nome: 'Imposição das Mãos Maior', descricao: "" },
            { classe: 'Paladino', tipo: 'avançado', id: 148, nome: 'Mestre Multiclasse', descricao: "" }
        ],
    },
    {
        keyBytes: [16, 17, 18], nome: 'Ranger',
        racas: ['Humano', 'Elfo'],
        hp_base: 8,
        dado_dano: 'd8',
        carga_base: 11,
        alinhamento: [
            { nome: 'Caótico', descricao: "Libertar alguém de amarras literais ou metafóricas." },
            { nome: 'Bom', descricao: "Colocar-se em perigo para combater uma ameaça sobrenatural." },
            { nome: 'Neutro', descricao: "Ajudar um animal ou espírito selvagem." }
        ],
        movimentos_raciais: [
            { classe: 'Ranger', tipo: "racial", nome: 'Humano', descricao: '' },
            { classe: 'Ranger', tipo: "racial", nome: 'Elfo', descricao: '' }],
        movimentos_iniciais: [
            { classe: 'Ranger', tipo: "inicial", nome: 'Caçada e Rastreamento', descricao: '' },
            { classe: 'Ranger', tipo: "inicial", nome: 'Companheiro Animal', descricao: '' },
            { classe: 'Ranger', tipo: "inicial", nome: 'Comando', descricao: '' },
            { classe: 'Ranger', tipo: "inicial", nome: 'Tiro Chamado', descricao: '' }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Ranger', tipo: 'avançado', id: 149, nome: 'Companheiro Selvagem', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 150, nome: 'Treinador de Presas', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 151, nome: 'Tiro Preciso', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 152, nome: 'Mão Segura', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 153, nome: 'Proteja-me', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 154, nome: 'Explorador', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 155, nome: 'Observador', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 156, nome: 'Atirador', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 157, nome: 'Mistura na Multidão', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 158, nome: 'Conhecimento da Natureza', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 159, nome: 'Companheiro Bem Treinado', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 160, nome: 'Diletante Multiclasse', descricao: '' }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Ranger', tipo: 'avançado', id: 161, nome: 'Companheiro de Sangue', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 162, nome: 'Predador Superior', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 163, nome: 'Tiro Mortal', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 164, nome: 'Duas Flechas', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 165, nome: 'Segurança em Primeiro Lugar', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 166, nome: 'Mestre Explorador', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 167, nome: 'Olhos de Águia', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 168, nome: 'Atirador de Elite', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 169, nome: 'Um com a Natureza', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 170, nome: 'Mestre da Natureza', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 171, nome: 'Companheiro Excepcional', descricao: '' },
            { classe: 'Ranger', tipo: 'avançado', id: 172, nome: 'Mestre Multiclasse', descricao: '' }
        ],
    },
    {
        keyBytes: [19, 20], nome: 'Ladão',
        racas: ['Humano', 'Halfling'],
        hp_base: 6,
        dado_dano: 'd8',
        carga_base: 9,
        alinhamento: [
            { nome: 'Caótico', descricao: "Pular sobre o perigo sem um plano." },
            { nome: 'Neutro', descricao: "Evitar ser detectado ou se infiltre um local." },
            { nome: 'Mau', descricao: "Repassar o perigo ou a culpa para outra pessoa." }
        ],
        movimentos_raciais: [
            { classe: 'Ladão', tipo: "racial", id: 1, nome: 'Humano', descricao: '' },
            { classe: 'Ladão', tipo: "racial", id: 2, nome: 'Halfling', descricao: '' }
        ],
        movimentos_iniciais: [
            { classe: 'Ladão', tipo: "inicial", id: 1, nome: 'Ataque Pelas Costas', descricao: '' },
            { classe: 'Ladão', tipo: "inicial", id: 2, nome: 'Truques do Ofício', descricao: '' },
            { classe: 'Ladão', tipo: "inicial", id: 3, nome: 'Moral Flexível', descricao: '' },
            { classe: 'Ladão', tipo: "inicial", id: 4, nome: 'Armadilhas Venenosas', descricao: '' }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Ladão', tipo: 'avançado', id: 173, nome: 'Venenista', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 174, nome: 'Envenenador', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 175, nome: 'Especialista em Armadilhas', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 176, nome: 'Disparar Primeiro', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 177, nome: 'Golpe Barato', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 178, nome: 'Conexões', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 179, nome: 'Mão Leve', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 180, nome: 'Arrombador', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 181, nome: 'Parede de Lâminas', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 182, nome: 'Esquiva', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 183, nome: 'Riqueza Oculta', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 184, nome: 'Diletante Multiclasse', descricao: '' }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Ladão', tipo: 'avançado', id: 185, nome: 'Mestre dos Venenos', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 186, nome: 'Assassino', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 187, nome: 'Especialista em Armadilhas Avançado', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 188, nome: 'Matar em Silêncio', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 189, nome: 'Golpe Mortal', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 190, nome: 'Influência', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 191, nome: 'Dedos de Seda', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 192, nome: 'Mestre Arrombador', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 193, nome: 'Tempestade de Facas', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 194, nome: 'Elusivo', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 195, nome: 'Fortuna Oculta', descricao: '' },
            { classe: 'Ladão', tipo: 'avançado', id: 196, nome: 'Mestre Multiclasse', descricao: '' }
        ],
    },
    {
        keyBytes: [21, 22], nome: 'Mago',
        racas: ['Humano', 'Elfo'],
        hp_base: 4,
        dado_dano: 'd4',
        carga_base: 7,
        alinhamento: [
            { nome: 'Bom', descricao: "Usar magia para ajudar diretamente outra pessoa." },
            { nome: 'Neutro', descricao: "Descobrir informações a respeito de um enigma ou mistério mágico." },
            { nome: 'Mau', descricao: "Usar magia para causar medo e terror." }
        ],
        movimentos_raciais: [
            { classe: 'Mago', tipo: "racial", id: 1, nome: 'Humano', descricao: "Escolha um feitiço de clérigo. Você pode conjurá-lo como se fosse um feitiço de mago." },
            { classe: 'Mago', tipo: "racial", id: 2, nome: 'Elfo', descricao: "A magia lhe é tão natural quanto o ato de respirar. Detectar Magia é considerada um truque para você." }
        ],
        movimentos_iniciais: [
            { classe: 'Mago', tipo: "inicial", id: 1, nome: 'Grimório', descricao: "Você aprendeu diversos feitiços e os inscreveu em seu grimório. Comece o jogo com 3 feitiços de primeiro nível anotados em seu livro, assim como todos os truques. Sempre  que ganhar um nível, adicione ao seu grimório um feitiço de nível igual ou inferior ao seu. O livro possui peso 1." },
            { classe: 'Mago', tipo: "inicial", id: 2, nome: 'Preparar Feitiços', descricao: "Quando passar algum tempo contemplando silenciosamente seu grimório (uma hora, aproximadamente) sem interrupções, você:\n•	Perde todos os feitiços que havia preparado anteriormente\n•	Prepara novos feitiços que estejam anotados em seu grimório à sua escolha, cujo \ntotal de níveis não supere seu próprio nível + 1\n•	Prepara todos os seus truques, que nunca contam para o limite acima." },
            { classe: 'Mago', tipo: "inicial", id: 3, nome: 'Conjurar Feitiços', descricao: "Quando lançar um feitiço preparado, role+INT. Com <spam class='badge'>10+</spam>, o feitiço é conjurado com sucesso e não é esquecido – logo, você poderá conjurá-lo novamente mais tarde. <spam class='badge'>7-9</spam>Com, o feitiço é conjurado, mas escolha um:•	Você atrai atenção indesejável ou se coloca em alguma situação complicada. O MJ descreverá como.•	Sua conjuração perturba a trama da realidade – receba -1 constante para conjurar feitiços até a próxima vez que você Preparar Feitiços.•	Você esquece o feitiço após conjurá-lo, e não conseguirá conjurá-lo de novo até a próxima vez que preparar feitiços.Repare que manter ativos feitiços com efeitos contínuos pode lhe ocasionar uma penalidade na rolagem de conjurar feitiços." },
            { classe: 'Mago', tipo: "inicial", id: 4, nome: 'Defesa Mágica', descricao: 'Você pode desfazer um feitiço contínuo imediatamente, e utilizar a energia envolvida em sua dissipação para defletir um ataque. O feitiço é encerrado e você subtrai o nível dele do dano recebido.' },
            { classe: 'Mago', tipo: "inicial", id: 5, nome: 'Ritual', descricao: 'Quando drenar energia de um local de poder para criar um efeito mágico, diga ao MJ o que está tentando realizar. Efeitos advindos de rituais são sempre possíveis, mas o MJ lhe dará de uma a quatro das condições abaixo:\n•	O ritual vai demorar dias/semanas/meses\n•	Primeiro você tem que <input type="text" placeholder="descrever o que precisa fazer" class="ritualInput" />\n•	Você precisará da ajuda de <input type="text" placeholder="descrever quem precisa ajudar" class="ritualInput" />\n•	O ritual vai requerer uma enorme quantia em dinheiro\n•	O melhor que consegue fazer é uma versão inferior, pouco confiável e limitada\n•	Você e seus aliados correrão o perigo de <input type="text" placeholder="descrever o perigo" class="ritualInput" />\n•	Você precisará desencantar <input type="text" placeholder="descrever o que precisa desencantar" class="ritualInput" />  para fazê-lo' }
        ],
        movimentos_avancados_2_5: [
            { classe: 'Mago', tipo: 'avançado', id: 197, nome: 'Erudito', descricao: 'Escolha um feitiço. Você o prepara como se fosse 1 nível menor.' },
            { classe: 'Mago', tipo: 'avançado', id: 198, nome: 'Prodígio', descricao: 'Quando conjurar feitiços, com , você tem a opção de escolher um item da lista de . Caso o faça, pode escolher também um dos itens da lista abaixo:\n•	os efeitos do feitiço são maximizados\n•	os alvos do feitiço são dobrados' },
            { classe: 'Mago', tipo: 'avançado', id: 199, nome: 'Empoderar Magia', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 200, nome: 'Contramágica', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 201, nome: 'Conhecimento Arcano', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 202, nome: 'Mago Especializado', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 203, nome: 'Magia Expandida', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 204, nome: 'Encantador', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 205, nome: 'Mestre do Ritual', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 206, nome: 'Diletante Multiclasse', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 207, nome: 'Altas Proteções', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 208, nome: 'Alquimista', descricao: '' }
        ],
        movimentos_avancados_6_10: [
            { classe: 'Mago', tipo: 'avançado', id: 209, nome: 'Mestre Erudito', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 210, nome: 'Gênio', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 211, nome: 'Magia Potencializada', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 212, nome: 'Contramágica Maior', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 213, nome: 'Segredos Arcanos', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 214, nome: 'Especialização Suprema', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 215, nome: 'Magia Ilimitada', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 216, nome: 'Encantador Mestre', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 217, nome: 'Arquimago Ritualista', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 218, nome: 'Mestre Multiclasse', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 219, nome: 'Proteções Permanentes', descricao: '' },
            { classe: 'Mago', tipo: 'avançado', id: 220, nome: 'Mestre Alquimista', descricao: '' }
        ],
        spell_list: [
            { nome: "Luz", level: 0, school: "Truque", continuo: false, descricao: "Um item tocado por você brilha com luz arcana, com a mesma intensidade de uma tocha. Essa luz não emite calor ou som e nem precisa de combustível para queimar, mas funciona como uma tocha comum para todos os outros efeitos. Você possui total controle sobre a cor da luz. O feitiço dura enquanto o item estiver em sua presença." },
            { nome: "Servo invisível", level: 0, school: "Truque", continuo: true, descricao: "Este feitiço conjura um construto invisível simples que não é capaz de fazer nada a não ser carregar itens. Ele possui Carga 3 e consegue carregar qualquer coisa que você entregar a ele, mas não é capaz de ir buscar objetos por conta própria. Qualquer coisa carregada por um servo invisível parece flutuar no ar alguns passos atrás do mago. Caso o servo receba dano ou saia de sua presença, ele se desfaz imediatamente. De outra forma, ele o serve até que o feitiço seja encerrado." },
            { nome: "Prestidigitação", level: 0, school: "Truque", continuo: false, descricao: "Você é capaz de fazer algumas peripécias com sua magia. Se tocar um item durante a conjuração deste truque, você poderá fazer alterações cosméticas a ele: limpá-lo, sujá-lo, resfriá-lo, aquecê-lo, mudar seu sabor ou sua cor. Se conjurar este feitiço sem tocar um item, poderá invocar pequenas ilusões, cujo tamanho não ultrapasse o seu. As imagens criadas por Prestidigitação são simples e obviamente ilusórias – elas não enganarão ninguém, mas poderão entreter as pessoas." },
            { nome: "Contatar espíritos", level: 1, school: "Invocação", continuo: false, descricao: "Diga o nome do espírito que deseja contatar (ou deixe isso a cargo do MJ). Você o atrai através dos planos, até que esteja próximo o suficiente para conversarem. Ele é obrigado a responder a uma questão que você perguntar da melhor forma possível." },
            { nome: "Detectar magia", level: 1, school: "Adivinhação", continuo: false, descricao: "Um dos seus sentidos torna-se momentaneamente sintonizado com a magia. O MJ lhe dirá o que é mágico ao seu redor." },
            { nome: "Telepatia", level: 1, school: "Adivinhação", continuo: true, descricao: "Você forma um elo telepático com uma única pessoa que tocar, permitindo que conversem através de seus pensamentos. Só é possível formar um elo telepático por vez." },
            { nome: "Encantar pessoa", level: 1, school: "Encantamento", continuo: true, descricao: "A pessoa (não funciona com animais ou monstros) que você tocar durante a conjuração deste feitiço lhe considerará como um amigo até que sofra algum dano ou que você a prove do contrário." },
            { nome: "Invisibilidade", level: 1, school: "Ilusão", continuo: true, descricao: "Toque um aliado: ninguém será mais capaz de vê-lo, pois ele fica invisível! Este feitiço permanece ativo até que seu alvo ataque ou que você o desfaça. Enquanto este feitiço continuar ativo, você não poderá conjurar um novo feitiço." },
            { nome: "Mísseis mágicos", level: 1, school: "Evocação", continuo: true, descricao: "Projéteis de pura magia são disparados das pontas de seus dedos. Cause 2d4 de dano a um alvo." },
            { nome: "Alarme", level: 1, school: "Adivinhação", continuo: true, descricao: "Ande ao redor de uma área circular. Até que você prepare feitiços novamente, este feitiço irá alertá-lo caso uma criatura entre no círculo. Mesmo que esteja dormindo, o feitiço lhe despertará de seu sono." },
            { nome: "Desfazer magia", level: 3, school: "Abjuração", continuo: false, descricao: "Escolha um feitiço ou efeito mágico em sua presença: ele será destroçado por este feitiço. Magias menores são encerradas, enquanto efeitos poderosos são apenas reduzidos ou anulados enquanto o mago permanecer por perto." },
            { nome: "Visões através do tempo", level: 3, school: "Adivinhação", continuo: false, descricao: "Conjure este feitiço ao observar uma superfície reflexiva para enxergar as profundezas do tempo. O MJ lhe revelará os detalhes de um portento terrível – um evento sinistro que ocorrerá se você não intervir. Ele também proverá informações úteis a respeito de maneiras através das quais você poderá interferir nos resultados do portento terrível. Raras serão as previsões que resultarão em 'e você viverá feliz para sempre'. Desculpe." },
            { nome: "Bola de fogo", level: 3, school: "Evocação", continuo: false, descricao: "Você evoca uma poderosa esfera de chamas que envolve seu alvo e todas as pessoas próximas a ele, causando 2d6 pontos de dano que ignoram armadura." },
            { nome: "Imitação", level: 3, school: "Ilusão", continuo: true, descricao: "Você assume a forma de alguém que tocar durante a conjuração deste feitiço. Suas características físicas serão perfeitamente copiadas, mas seu comportamento não. A mudança persiste até que você sofra dano ou opte por retornar à sua forma original. Enquanto este feitiço permanecer ativo, perca acesso a todos os seus movimentos de mago." },
            { nome: "Imagem espelhada", level: 3, school: "Ilusão", continuo: false, descricao: "Você cria uma imagem ilusória de si próprio. Quando sofrer um ataque, role 1d6. Em um resultado 4, 5 ou 6 o ataque acerta a ilusão, e quando isso ocorrer, a imagem se dissipa e este feitiço se encerra." },
            { nome: "Sono", level: 3, school: "Encantamento", continuo: false, descricao: "1d4 inimigos em seu campo de visão, à escolha do MJ, caem no sono. Apenas criaturas capazes de dormir são afetadas. Elas podem acordar normalmente: com barulhos altos, sacudidas ou sofrendo dor." },
            { nome: "Jaula", level: 5, school: "Evocação", continuo: true, descricao: "O alvo é preso em uma jaula de força mágica. Nada pode entrar ou sair, e ela permanece ativa até que você a desfaça ou conjure um novo feitiço. Enquanto este feitiço permanecer ativo, a criatura aprisionada pode ouvir seus pensamentos e você deve permanecer na presença da jaula." },
            { nome: "Contatar outros planos", level: 5, school: "Adivinhação", continuo: false, descricao: "Você encaminha um chamado para outro plano. Especifique o que gostaria de contatar através de localização, tipo de criatura, nome ou título. Isso abre um canal de comunicação de mão dupla entre o conjurador e a entidade contatada, que pode ser encerrado a qualquer momento por qualquer de seus participantes." },
            { nome: "Metamorfose", level: 5, school: "Encantamento", continuo: false, descricao: "Seu toque pode remodelar totalmente uma criatura, que permanecerá na forma que você criou até que você conjure um novo feitiço. Descreva ao MJ a nova forma que você dará ao alvo, incluindo mudanças em habilidades, adaptações significativas, ou fraquezas. O MJ também lhe dirá uma das coisas abaixo:\n•	A forma será instável e temporária\n•	A mente da criatura também será alterada\n•	A forma possui alguma vantagem ou fraqueza não considerada" },
            { nome: "Invocar monstro", level: 5, school: "Invocação", continuo: true, descricao: "Um monstro surge e passa a auxiliá-lo da melhor forma possível. Trate-o como se fosse seu próprio personagem, mas com acesso apenas aos movimentos básicos. A criatura possui um modificador de +1 em todas as habilidades, 1 PV e utiliza o seu dado de dano. O monstro também receberá 1d6 características da lista abaixo.\n•	O monstro possui +2 no lugar de +1 em uma habilidade\n•	O monstro não é descuidado\n•	O monstro causa 1d8 de dano\n•	A ligação do monstro com este plano é forte. +2 PV para cada nível do mago que o conjurou\n•	O monstro possui alguma adaptação útil\nO MJ lhe dirá o que é a criatura, baseando-se em suas escolhas. A criatura permanece \nneste plano até ser morta ou até que você a libere. Enquanto este feitiço permanecer ativo, você recebe -1 em conjurar feitiços." },
            { nome: "Dominação", level: 7, school: "Encantamento", continuo: true, descricao: "Com um toque, você força sua mente sobre a de outra pessoa. Receba 1d4 de domínio. Gaste 1 domínio para fazer seu alvo executar uma das ações abaixo:\n•	Falar algumas palavras de sua escolha\n•	Lhe entregar algo que esteja em poder dele\n•	Fazer um ataque contra um alvo de sua escolha\n•	Responder uma pergunta honestamenteSe ficar sem domínio, o feitiço é encerrado. Se o alvo sofrer dano, você perde 1 de domínio. Enquanto este feitiço permanecer ativo, você não pode conjurar feitiços." },
            { nome: "Enxergar a verdade", level: 7, school: "Encantamento", continuo: true, descricao: "Você consegue enxergar todas as coisas como elas realmente são. O efeito persiste até que você diga uma mentira ou desfaça o feitiço. Enquanto este feitiço permanecer ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Caminhar nas sombras", level: 7, school: "Ilusão", continuo: false, descricao: "As sombras afetadas por este feitiço são transformadas em portais que podem ser utilizados por você e por seus aliados. Cite um local, descrevendo-o com uma quantidade de palavras igual ou menor que seu nível. Atravessar o portal irá levar a pessoa àquele local. O portal só pode ser utilizado uma vez por cada aliado." },
            { nome: "Contingência", level: 7, school: "Evocação", continuo: false, descricao: "Escolha um feitiço de nível 5 ou menor que você conheça. Descreva uma condição de disparo utilizando uma quantidade de palavras igual ou menor que seu nível. O feitiço escolhido ficará suspenso até que você resolva fazê-lo funcionar, ou quando a condição imposta for cumprida, o que ocorrer primeiro. Não é necessário rolar – os efeitos simplesmente acontecem. Só é possível manter um feitiço em contingência por vez – se conjurar Contingência novamente, ela substitui a conjuração anterior." },
            { nome: "Nuvem mortal", level: 7, school: "Invocação", continuo: true, descricao: "Uma nuvem se arrasta até este mundo, vinda de além dos Portões Negros da Morte, preenchendo a área onde o mago se encontra. Sempre que uma criatura na área for ferida, ela sofre, separadamente, 1d6 de dano extra que ignora armadura. Este feitiço persiste enquanto você puder enxergar a área afetada, ou até que o desfaça." },
            { nome: "Antipatia", level: 9, school: "", continuo: true, descricao: "Escolha um alvo e descreva um tipo de criatura ou alinhamento. Criaturas do tipo ou alinhamento especificados não podem entrar na linha de visão do alvo. Caso elas se vejam nessa situação, fugirão imediatamente. O efeito permanece até que você saia da presença do alvo, ou desfaça o feitiço. Enquanto este feitiço permanecer ativo, você recebe -1 para conjurar feitiços." },
            { nome: "Alerta", level: 9, school: "", continuo: false, descricao: "Descreva um evento. O MJ lhe dirá quando ele ocorrer, independentemente de onde você se encontrar ou qual a sua distância até ele. Se quiser, poderá observar o local do evento como se estivesse lá. Você só pode manter um Alerta ativo de cada vez." },
            { nome: "Joia da alma", level: 9, school: "", continuo: false, descricao: "Você aprisiona a alma de uma criatura moribunda em uma gema. A criatura aprisionada permanece ciente de seu aprisionamento, mas ainda assim pode ser manipulada através de magias, negociação e outros efeitos. Todos os movimentos realizados contra a criatura aprisionada recebem +1. A alma pode ser libertada a qualquer momento, mas nunca mais poderá ser recapturada." },
            { nome: "Abrigo", level: 9, school: "Evocação", continuo: true, descricao: "Você cria uma estrutura feita inteiramente de magia pura. Ela pode ser tão grande quanto um castelo, ou tão pequena quanto uma cabana, e é totalmente invulnerável a ataques que não sejam mágicos. A estrutura permanece até que você a abandone, ou encerre o feitiço." },
            { nome: "Invocação perfeita", level: 9, school: "Invocação", continuo: false, descricao: "Você teleporta uma criatura para sua presença. Diga o nome de uma criatura específica ou uma curta descrição de um tipo de criatura. A criatura nomeada, ou uma criatura do tipo descrito, surge diante de você." }
        ]
    }
];

// === Sistema de código de ficha ===
function collectState() {
    const state = {};
    allInputs.forEach((input) => {
        if (input.type === 'checkbox') state[input.id] = input.checked ? '1' : '0';
        else state[input.id] = input.value;
    });
    circles.forEach((circle) => {
        state[circle.id] = circle.classList.contains('active') ? '1' : '0';
    });
    return state;
}

function applyState(state) {
    allInputs.forEach((input) => {
        if (state[input.id] !== undefined) {
            if (input.type === 'checkbox') input.checked = state[input.id] === '1';
            else input.value = state[input.id];
        }
    });
    circles.forEach((circle) => {
        if (state[circle.id] === '1') circle.classList.add('active');
        else circle.classList.remove('active');
    });
}

// Cifra XOR com TextEncoder (suporte a UTF-8 e caracteres acentuados)
function encodeState(state) {
    const key = 'DungeonWorld2024';
    const bytes = new TextEncoder().encode(JSON.stringify(state));
    const keyBytes = new TextEncoder().encode(key);
    const xored = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    let binary = '';
    for (let i = 0; i < xored.length; i++) binary += String.fromCharCode(xored[i]);
    return btoa(binary);
}

function decodeState(code) {
    const key = 'DungeonWorld2024';
    const keyBytes = new TextEncoder().encode(key);
    const binary = atob(code);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const xored = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) xored[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    return JSON.parse(new TextDecoder().decode(xored));
}

function autoSave() {
    try {
        localStorage.setItem('dw_sheet_code', encodeState(collectState()));
    } catch (e) { console.error('Falha ao salvar ficha:', e); }
}

function autoLoad() {
    const saved = localStorage.getItem('dw_sheet_code');
    if (!saved) return;
    try {
        applyState(decodeState(saved));
    } catch (e) {
        console.warn('Falha ao restaurar ficha:', e);
    }
}

// Alias para manter compatibilidade com todas as chamadas existentes
const saveStateToURL = autoSave;

function renderList(title, arr) {
    if (!arr || !arr.length) return '';
    let s = `<h3>${title}</h3><div class="list-container">`;
    arr.forEach((it) => { s += `<div class="move-item"><h4>${it?.nome ?? ''}</h4><p>${it?.descricao ?? ''}</p></div>`; });
    s += '</div>';
    return s;
};

// Renderiza movimentos e informações da classe selecionada dentro do elemento #classMovesList
function renderClassMoves() {
    const container = document.getElementById('classMovesList');

    if (!container) return;

    const classSelect = document.getElementById('charClass');
    const raceSelect = document.getElementById('charRace');
    const className = classSelect ? classSelect.value : '';
    const race = raceSelect ? raceSelect.value : '';

    let html = '';
    if (!className) {
        html = '<div style="padding:12px"><em>Selecione uma classe para ver os movimentos.</em></div>';
        container.innerHTML = html;
        return;
    }

    const cls = classDetails.find((cd) => canonical(cd.nome) === canonical(className));
    if (!cls) {
        container.innerHTML = '<div style="padding:12px"><em>Classe não encontrada em classDetails.</em></div>';
        return;
    }

    // movimentos raciais específicos para a raça selecionada
    if (cls.movimentos_raciais && race) {
        const keys = Object.keys(cls.movimentos_raciais || {});
        const found = keys.find((k) => canonical(k) === canonical(race));
        const mr = found ? cls.movimentos_raciais[found] : null;
        if (mr && mr.length) html += renderList(`Movimentos raciais: ${race}`, mr);
    }

    html += renderList('Movimentos iniciais', cls.movimentos_iniciais || []);
    html += renderList('Escolhas iniciais', cls.escolha_inicial || []);
    html += renderList('Movimentos (níveis 2-5)', cls.movimentos_avancados_2_5 || []);
    html += renderList('Movimentos (níveis 6-10)', cls.movimentos_avancados_6_10 || []);

    if (cls.movimentos_substituidos) {
        let s = '<h3>Movimentos substituídos</h3><ul>';
        Object.entries(cls.movimentos_substituidos).forEach(([k, v]) => { s += `<li>${k} → ${v}</li>`; });
        s += '</ul>';
        html += s;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Canonicalização: remove acentos e normaliza para lower-case
function canonical(text) {
    return (text || '')
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase();
}

function capitalize(s) {
    if (!s) return s;
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
}

// === Funções de classe/atributo (escopo de módulo) ===
function findClassByName(name) {
    if (!name) return null;
    const normalized = canonical(name);
    return classDetails.find((cd) => canonical(cd.nome) === normalized) || null;
}

function updateClassSpellsVisibility() {
    const classSelect = document.getElementById('charClass');
    const classSpells = document.getElementById('classSpells');
    if (!classSpells || !classSelect) return;
    const sel = canonical(classSelect.value);
    classSpells.style.display = (sel === 'mago' || sel === 'clerigo') ? '' : 'none';
}

function applyClassEffects() {
    const classSelect = document.getElementById('charClass');
    const selectedName = classSelect ? classSelect.value : '';
    const cls = findClassByName(selectedName);
    const charDmgInput = document.getElementById('charDmg');
    const charPVInput = document.getElementById('charPV');
    const conVal = parseInt((document.getElementById('valCon') || { value: '' }).value, 10);
    const conNum = Number.isFinite(conVal) ? conVal : 0;

    if (cls) {
        if (charDmgInput) charDmgInput.value = cls.dado_dano;
        if (charPVInput) charPVInput.value = (cls.hp_base || 0) + conNum;
        const charLoadInput = document.getElementById('charLoad');
        const modForEl = document.getElementById('modFor');
        let modForNum = 0;
        if (modForEl && modForEl.value) {
            const parsed = parseInt(modForEl.value.replace(/[^0-9-]/g, ''), 10);
            if (!Number.isNaN(parsed)) modForNum = parsed;
        } else {
            const valFor = parseInt((document.getElementById('valFor') || { value: '' }).value, 10);
            if (Number.isFinite(valFor)) modForNum = Math.floor((valFor - 10) / 2);
        }
        if (charLoadInput) charLoadInput.value = (cls.carga_base || 0) + modForNum;
    } else {
        if (charDmgInput) charDmgInput.value = '';
        if (charPVInput) charPVInput.value = '';
        const charLoadInput = document.getElementById('charLoad');
        if (charLoadInput) charLoadInput.value = '';
    }
    updateClassSpellsVisibility();
}

// Funções para adicionar itens, magias e movimentos à ficha
function addEquipmentToList(listId) {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    const item = "<div class='list-item' style='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;'>" +
        "<input class='spell-name' type='text' placeholder='Nome do equipamento' style='flex:2' />" +
        "<input class='spell-name' type='number' placeholder='Peso' min='0' style='width:60px' />" +
        "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +
        "</div>";
    listEl.insertAdjacentHTML('beforeend', item);
}

function addConsumableToList(listId) {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    const item = "<div class='list-item' style='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;'>" +
        "<input class='spell-name' type='text' placeholder='Nome do consumível' style='flex:2' />" +
        "<input class='spell-name' type='number'  placeholder='Peso' min='0' style='width:60px' />" +
        "<div class='use-boxes' style='display:flex;gap:4px;flex-wrap:wrap;align-items:center'></div>" +
        "<button onclick=\"addConsumableUse(this.closest('.list-item'))\" class='addConsumable'>&#x2b</button>" +
        "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button>" +

        "</div>";
    listEl.insertAdjacentHTML('beforeend', item);
}

function addConsumableUse(itemEl) {
    const useBoxes = itemEl.querySelector('.use-boxes');
    if (!useBoxes) return;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'gold_filling';
    useBoxes.appendChild(cb);
}

function addSpellToList(listId, spellName) {

}

function addBond() {
    const bond = document.getElementById('charBonds');
    const bondsArea = document.getElementById('bondsArea');
    if (!bond || !bondsArea) return;
    const item = "<div class='list-item'><label class='bonding-name' type='text'>" + bond.value + "</label>" + "<button onclick=\"this.closest('.list-item').remove()\" class='removeIcon'>&#215</button></div>";
    bondsArea.insertAdjacentHTML('beforeend', item);
}
    
function removeBond(button) {
    const bondItem = button.closest('.list-item');
    if (bondItem) bondItem.remove();
}

function completeBond(button) {
    const bondItem = button.closest('.list-item');
    if (bondItem) {
        const label = bondItem.querySelector('label');
        if (label) label.style.textDecoration = 'line-through';
    }
}

// Tabela de modificadores Dungeon World
function computeModifier(val) {
    const v = parseInt(val, 10);
    if (!Number.isFinite(v)) return '';
    if (v <= 3) return '-3';
    if (v <= 5) return '-2';
    if (v <= 8) return '-1';
    if (v <= 11) return '+0';
    if (v <= 15) return '+1';
    if (v <= 17) return '+2';
    return '+3';
}

function updateModifiers() {
    attrPairs.forEach(({ val, mod }) => {
        const valEl = document.getElementById(val);
        const modEl = document.getElementById(mod);
        if (valEl && modEl) modEl.value = computeModifier(valEl.value);
    });
}

function updateStrikethrough() {
    const used = new Set();
    attrPairs.forEach(({ val }) => {
        const v = parseInt(document.getElementById(val)?.value, 10);
        if (Number.isFinite(v) && v > 0) used.add(v);
    });
    document.querySelectorAll('.init-val').forEach((span) => {
        if (used.has(parseInt(span.dataset.val, 10))) span.classList.add('used');
        else span.classList.remove('used');
    });
}

// Aplica restrições cruzadas entre `charRace` e `charClass`.
function ClassSelector() {
    const raceInput = document.getElementById('charRace');
    const classSelect = document.getElementById('charClass');

    function findAllowedClasses(race) {
        if (!race) return null;
        const normalized = canonical(race);
        const allowed = classDetails
            .filter((cd) => (cd.racas || []).some((r) => canonical(r) === normalized))
            .map((cd) => cd.nome);
        return allowed.length ? allowed : null;
    }

    function findAllowedRaces(className) {
        if (!className) return null;
        const normalized = canonical(className);
        const cls = classDetails.find((cd) => canonical(cd.nome) === normalized);
        return (cls && cls.racas && cls.racas.length) ? cls.racas : null;
    }

    function updateClassOptions() {
        const race = raceInput.value;
        const allowed = findAllowedClasses(race);
        const allowedSet = allowed ? new Set(allowed.map((a) => canonical(a))) : null;
        Array.from(classSelect.options).forEach((option) => {
            if (!option.value) return;
            const optCan = canonical(option.value);
            const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
            option.disabled = isDisabled;
            if (isDisabled) option.classList.add('disabled-by-race');
            else option.classList.remove('disabled-by-race');
        });
        const selected = classSelect.value;
        if (selected && classSelect.querySelector(`option[value="${selected}"]`).disabled) {
            classSelect.value = '';
        }
        applyClassEffects();
    }

    function updateRaceOptions() {
        const className = classSelect.value;
        const allowedRaces = findAllowedRaces(className);
        const allowedSet = allowedRaces ? new Set(allowedRaces.map((r) => canonical(r))) : null;
        Array.from(raceInput.options).forEach((option) => {
            if (!option.value) return;
            const optCan = canonical(option.value);
            const isDisabled = allowedSet === null ? false : !allowedSet.has(optCan);
            option.disabled = isDisabled;
            if (isDisabled) option.classList.add('disabled-by-race');
            else option.classList.remove('disabled-by-race');
        });
        const selectedRace = raceInput.value;
        if (selectedRace && raceInput.querySelector(`option[value="${selectedRace}"]`).disabled) {
            raceInput.value = '';
        }
    }

    raceInput.addEventListener('change', () => {
        updateClassOptions();
        saveStateToURL();
        renderClassMoves();
    });

    classSelect.addEventListener('change', () => {
        const opt = classSelect.selectedOptions[0];
        if (opt && opt.disabled) classSelect.value = '';
        updateRaceOptions();
        applyClassEffects();
        saveStateToURL();
        renderClassMoves();
    });

    updateClassOptions();
    updateRaceOptions();
}

circles.forEach((circle, index) => {
    circle.addEventListener('click', () => {
        const isActive = circle.classList.contains('active');
        if (!isActive) {
            for (let i = 0; i <= index; i++) circles[i].classList.add('active');
        } else {
            for (let i = index; i < circles.length; i++) circles[i].classList.remove('active');
        }
        saveStateToURL();
    });
});

allInputs.forEach((input) => {
    input.addEventListener('input', saveStateToURL);
    input.addEventListener('change', saveStateToURL);
});

// Recalcula modificadores e risca atributos iniciais usados ao editar valor
attrPairs.forEach(({ val }) => {
    const el = document.getElementById(val);
    if (el) el.addEventListener('input', () => {
        updateModifiers();
        updateStrikethrough();
        applyClassEffects();
        autoSave();
    });
});

// === Eventos dos botões de código ===
document.getElementById('btnGerarCodigo').addEventListener('click', () => {
    document.getElementById('codeModalText').value = encodeState(collectState());
    document.getElementById('codeModal').style.display = 'flex';
});

document.getElementById('btnFecharModal').addEventListener('click', () => {
    document.getElementById('codeModal').style.display = 'none';
});

document.getElementById('btnCopiarCodigo').addEventListener('click', () => {
    const ta = document.getElementById('codeModalText');
    ta.select();
    try {
        navigator.clipboard.writeText(ta.value);
    } catch (e) {
        document.execCommand('copy');
    }
    const btn = document.getElementById('btnCopiarCodigo');
    btn.textContent = '\u2705 Copiado!';
    setTimeout(() => { btn.textContent = '\uD83D\uDCCB Copiar'; }, 2000);
});

document.getElementById('btnRestaurar').addEventListener('click', () => {
    document.getElementById('restoreCodeInput').value = '';
    document.getElementById('restoreError').style.display = 'none';
    document.getElementById('restoreModal').style.display = 'flex';
});

document.getElementById('btnConfirmarRestaurar').addEventListener('click', () => {
    const code = document.getElementById('restoreCodeInput').value.trim();
    try {
        applyState(decodeState(code));
        autoSave();
        ClassSelector();
        updateModifiers();
        updateStrikethrough();
        renderClassMoves();
        document.getElementById('restoreModal').style.display = 'none';
    } catch (e) {
        document.getElementById('restoreError').style.display = 'block';
    }
});

document.getElementById('btnCancelarRestaurar').addEventListener('click', () => {
    document.getElementById('restoreModal').style.display = 'none';
});

document.getElementById('addConsumable')?.addEventListener('click', () => {
    addConsumableToList('consumablesContainer');
});

document.getElementById('addEquipment')?.addEventListener('click', () => {
    addEquipmentToList('equipmentContainer');
});

document.getElementById('addBond')?.addEventListener('click', () => {
    addBond();
    console.log('Bond added');
});

// Método para limpar a ficha (retornar ao estado 0)
function clearSheet() {
    // Limpar localStorage
    try {
        localStorage.removeItem('dw_sheet_code');
    } catch (e) { /* silent */ }

    // Limpar sessionStorage
    try {
        sessionStorage.removeItem('dw_sheet_code');
    } catch (e) { /* silent */ }

    // Limpar todos os inputs
    allInputs.forEach((input) => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });

    // Limpar todos os círculos de XP
    circles.forEach((circle) => {
        circle.classList.remove('active');
    });

    // Resetar selectboxes
    document.getElementById('charRace').value = '';
    document.getElementById('charClass').value = '';

    // Atualizar modifiers e strikes
    updateModifiers();
    updateStrikethrough();
    applyClassEffects();
    renderClassMoves();
}

document.getElementById('btnLimpar').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar a ficha? Esta ação não pode ser desfeita.')) {
        clearSheet();
    }
});



// Fechar modais clicando no fundo escuro
['codeModal', 'restoreModal', 'clearModal'].forEach((id) => {
    document.getElementById(id).addEventListener('click', (e) => {
        if (e.target.id === id) document.getElementById(id).style.display = 'none';
    });

});



autoLoad();
ClassSelector();
updateModifiers();
updateStrikethrough();
// Renderiza movimentos iniciais de acordo com seleção atual
renderClassMoves();
